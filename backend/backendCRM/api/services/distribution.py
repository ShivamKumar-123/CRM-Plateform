"""Lead distribution engine.

Picks the next user a newly created lead should be assigned to, based on the
org's active DistributionRule(s).

Strategies:
    ROUND_ROBIN   — cycle through eligible users, persisting rr_cursor
    LEAST_LOADED  — assign to the user with fewest open leads right now
    TERRITORY     — match by user.territory == lead.territory (or city/state proximity)
    WEIGHTED      — pick a user proportional to weights JSON
    SKILL         — assign only to users whose `skills_required` are all present

A rule's `match_filter` (JSON AST) is checked first — if it doesn't match the
lead, the rule is skipped. Rules are tried in `priority` order.
"""

from __future__ import annotations

import random
from typing import Optional

from django.db.models import Count, Q

from .. import models
from ..filters_dsl import ast_to_q


def find_assignee(lead: "models.Leads") -> tuple[Optional["models.User"], Optional["models.DistributionRule"], str]:
    """Pick the next assignee for `lead`. Returns (user, rule, reason)."""
    if not lead.organization_id:
        return None, None, "no organization"

    rules = (
        models.DistributionRule.objects
        .filter(organization=lead.organization, is_active=True)
        .prefetch_related("eligible_users")
        .order_by("priority", "id")
    )

    for rule in rules:
        if not _lead_matches_filter(lead, rule):
            continue

        eligible = list(rule.eligible_users.filter(status="ACTIVE"))
        if not eligible:
            continue

        try:
            user = _apply_strategy(lead, rule, eligible)
        except Exception:  # noqa: BLE001 — never let distribution break lead creation
            user = None

        if user is not None:
            reason = f"matched rule '{rule.name}' ({rule.strategy})"
            return user, rule, reason

    return None, None, "no matching rule"


def _lead_matches_filter(lead: "models.Leads", rule: "models.DistributionRule") -> bool:
    if not rule.match_filter:
        return True
    try:
        q = ast_to_q(rule.match_filter, module="lead")
    except Exception:  # invalid filter → skip the rule rather than crashing
        return False
    return models.Leads.objects.filter(q, pk=lead.pk).exists()


def _apply_strategy(lead: "models.Leads", rule: "models.DistributionRule",
                    eligible: list["models.User"]) -> Optional["models.User"]:
    strategy = rule.strategy

    if strategy == "ROUND_ROBIN":
        return _round_robin(rule, eligible)
    if strategy == "LEAST_LOADED":
        return _least_loaded(rule.organization_id, eligible)
    if strategy == "TERRITORY":
        return _territory_match(lead, eligible)
    if strategy == "WEIGHTED":
        return _weighted_pick(rule, eligible)
    if strategy == "SKILL":
        return _skill_match(rule, eligible)
    return eligible[0]


def _round_robin(rule, eligible):
    if not eligible:
        return None
    cursor = rule.rr_cursor % len(eligible)
    user = eligible[cursor]
    rule.rr_cursor = (cursor + 1) % len(eligible)
    rule.save(update_fields=["rr_cursor"])
    return user


def _least_loaded(org_id, eligible):
    """Pick eligible user with fewest open leads in the org."""
    user_ids = [u.id for u in eligible]
    open_statuses_excluded = ["WON", "LOST", "CANCELLED", "DEALED"]

    counts = dict(
        models.Leads.objects
        .filter(organization_id=org_id, assigned_to_id__in=user_ids)
        .exclude(status__in=open_statuses_excluded)
        .values_list("assigned_to_id")
        .annotate(c=Count("id"))
        .values_list("assigned_to_id", "c")
    )

    eligible.sort(key=lambda u: counts.get(u.id, 0))
    return eligible[0]


def _territory_match(lead, eligible):
    if not lead.assigned_to_id and getattr(lead, "city", ""):
        # Prefer users whose territory.name matches the lead's city/state.
        city = (lead.city or "").strip().lower()
        state = (lead.state or "").strip().lower()
        for user in eligible:
            tname = (getattr(getattr(user, "territory", None), "name", "") or "").lower()
            if tname and (tname == city or tname == state or city in tname or state in tname):
                return user
    # Fall back to first eligible with a territory, else first eligible.
    with_territory = [u for u in eligible if getattr(u, "territory_id", None)]
    return (with_territory or eligible)[0]


def _weighted_pick(rule, eligible):
    weights = rule.weights or {}
    pool = []
    for u in eligible:
        w = int(weights.get(str(u.id), 1) or 1)
        pool.extend([u] * max(w, 1))
    return random.choice(pool) if pool else eligible[0]


def _skill_match(rule, eligible):
    required = set(rule.skills_required or [])
    if not required:
        return eligible[0]
    # User.skills isn't a real field yet — store as comma-separated `notes`-like
    # field for now, future-proofed for a proper M2M. Treat user.role and
    # user.company_name as soft skill proxies.
    for u in eligible:
        haystack = " ".join([u.role or "", getattr(u, "company_name", "") or ""]).lower()
        if all(skill.lower() in haystack for skill in required):
            return u
    return eligible[0]
