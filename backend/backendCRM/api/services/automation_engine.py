"""Automation execution engine.

Dispatches business events (lead_created, deal_won, etc.) to matching
AutomationRules and executes their actions. Supports two run modes:

- Inline (sync) — runs immediately in-request. Default when Celery isn't wired.
- Celery (async) — if `CELERY_BROKER_URL` is set + worker is up, dispatcher
  hands the job off via `.delay()`.

Action types supported::

    create_task       {"title": "...", "assigned_to": <user_id>, "due_in_hours": N}
    assign_user       {"user_id": <user_id>}
    send_notification {"title": "...", "body": "...", "user_id": <user_id>}
    update_score      {"points": +N, "reason": "..."}
    move_stage        {"status": "QUALIFIED"}
    webhook           {"url": "https://...", "method": "POST"}
    whatsapp          {"template": "welcome", "to": "+91..."}

Each action returns {"action": <type>, "status": "ok|error", "detail": "..."}.
"""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def dispatch(event: str, instance: Any, organization=None) -> list:
    """Fire `event` for `instance` (Lead/Deal/Payment/Task) against this
    org's active rules. Returns a list of AutomationRun ids it kicked off.

    Tries Celery if available, falls back to inline execution.
    """
    if instance is None:
        return []
    org = organization or getattr(instance, "organization", None)
    if org is None:
        return []

    # Import inside function to avoid circular imports at app boot.
    from ..models import AutomationRule

    rules = AutomationRule.objects.filter(
        organization=org,
        is_active=True,
        trigger_event=event,
    )
    if not rules.exists():
        return []

    run_ids = []
    payload = _serialize_instance(instance, event)

    # Try Celery first.
    try:
        from ..tasks import execute_automation_rule  # noqa: WPS433 — lazy import
        if getattr(settings, "CELERY_BROKER_URL", ""):
            for rule in rules:
                async_result = execute_automation_rule.delay(rule.id, event, payload)
                run_ids.append(async_result.id)
            return run_ids
    except Exception:  # noqa: BLE001 — Celery not available, fall through
        pass

    # Inline fallback.
    for rule in rules:
        run_id = execute_inline(rule, event, payload, instance)
        if run_id:
            run_ids.append(run_id)
    return run_ids


def execute_inline(rule, event: str, payload: dict, instance=None) -> int | None:
    """Run a single rule's actions immediately, write an AutomationRun row."""
    from ..models import AutomationRun

    run = AutomationRun.objects.create(
        rule=rule,
        organization=rule.organization,
        trigger_event=event,
        payload=payload,
    )

    log: list[dict] = []
    overall_status = "SUCCESS"

    try:
        if not _conditions_pass(rule.conditions, payload):
            run.status = "SUCCESS"
            run.actions_log = [{"action": "conditions", "status": "skipped", "detail": "no match"}]
            run.completed_at = timezone.now()
            run.save()
            return run.id

        actions = rule.actions if isinstance(rule.actions, list) else []
        for action in actions:
            result = _run_action(action, payload, rule, instance)
            log.append(result)
            if result.get("status") == "error":
                overall_status = "PARTIAL" if any(a.get("status") == "ok" for a in log) else "FAILED"

        rule.run_count = (rule.run_count or 0) + 1
        rule.last_run_at = timezone.now()
        rule.save(update_fields=["run_count", "last_run_at"])

    except Exception as exc:  # noqa: BLE001
        log.append({"action": "engine", "status": "error", "detail": str(exc)})
        overall_status = "FAILED"
        run.error_message = str(exc)

    run.actions_log = log
    run.status = overall_status
    run.completed_at = timezone.now()
    run.save()
    return run.id


def _serialize_instance(instance, event: str) -> dict:
    """Best-effort JSON representation of the trigger target. Used as payload
    so actions can reference fields without holding a model instance.
    """
    base = {"event": event, "id": getattr(instance, "id", None), "type": type(instance).__name__}
    for f in ("name", "status", "score", "priority", "email", "phone",
              "deal_value", "title", "assigned_to_id"):
        if hasattr(instance, f):
            v = getattr(instance, f)
            base[f] = float(v) if hasattr(v, "is_finite") else v
    return base


def _conditions_pass(conditions: Any, payload: dict) -> bool:
    """Evaluate a rule's optional `conditions` JSON. Empty = always pass.

    Accepts either the Filter DSL AST shape or a simple {field: value} dict.
    """
    if not conditions:
        return True
    if isinstance(conditions, dict) and "op" not in conditions:
        # Simple equality dict.
        return all(payload.get(k) == v for k, v in conditions.items())
    # Filter DSL — reuse the existing parser symbolically against the payload.
    # We don't have a queryset here, so do a lightweight in-memory match.
    return _ast_match(conditions, payload)


def _ast_match(node, payload: dict) -> bool:
    if not isinstance(node, dict):
        return True
    op = (node.get("op") or "").lower()
    if op in ("and", "or", "not"):
        children = node.get("children") or []
        results = [_ast_match(c, payload) for c in children]
        if op == "and":
            return all(results) if results else True
        if op == "or":
            return any(results) if results else True
        return not all(results) if results else True
    # leaf
    field = node.get("field")
    val = node.get("value")
    actual = payload.get(field)
    if op == "equals": return actual == val
    if op == "not_equals": return actual != val
    if op == "contains": return val and isinstance(actual, str) and val.lower() in actual.lower()
    if op == "gt": return actual is not None and actual > val
    if op == "lt": return actual is not None and actual < val
    if op == "in": return actual in (val or [])
    return True


# ─── Action handlers ─────────────────────────────────────────────


def _run_action(action: dict, payload: dict, rule, instance=None) -> dict:
    a_type = action.get("type") or action.get("action")
    cfg = action.get("config", action)
    handler = ACTION_HANDLERS.get(a_type)
    if not handler:
        return {"action": a_type, "status": "error", "detail": f"unknown action type '{a_type}'"}
    try:
        detail = handler(cfg, payload, rule, instance) or "ok"
        return {"action": a_type, "status": "ok", "detail": str(detail)[:300]}
    except Exception as exc:  # noqa: BLE001
        logger.exception("automation action %s failed", a_type)
        return {"action": a_type, "status": "error", "detail": str(exc)[:300]}


def _act_create_task(cfg, payload, rule, instance):
    from ..models import Task, User
    assignee = User.objects.filter(pk=cfg.get("assigned_to")).first() if cfg.get("assigned_to") else None
    due_at = None
    if cfg.get("due_in_hours"):
        due_at = timezone.now() + timedelta(hours=int(cfg["due_in_hours"]))
    Task.objects.create(
        organization=rule.organization,
        title=cfg.get("title", "Automation follow-up"),
        description=cfg.get("description", f"Auto-created by rule '{rule.name}'"),
        assigned_to=assignee,
        due_date=due_at,
        priority=cfg.get("priority", "NORMAL"),
    )
    return f"task created · assigned to {getattr(assignee, 'username', '—')}"


def _act_assign_user(cfg, payload, rule, instance):
    if instance is None or not hasattr(instance, "assigned_to_id"):
        return "no instance to assign"
    from ..models import User
    user = User.objects.filter(pk=cfg.get("user_id")).first()
    if not user:
        return "user not found"
    type(instance).objects.filter(pk=instance.pk).update(assigned_to=user)
    return f"assigned to {user.username}"


def _act_send_notification(cfg, payload, rule, instance):
    from ..models import Notification, User
    target = User.objects.filter(pk=cfg.get("user_id")).first()
    if not target and instance is not None:
        target = getattr(instance, "assigned_to", None)
    if not target:
        return "no recipient"
    Notification.objects.create(
        user=target,
        organization=rule.organization,
        type=cfg.get("notification_type", "automation"),
        title=cfg.get("title", f"Automation: {rule.name}"),
        body=cfg.get("body", ""),
        link=cfg.get("link", ""),
    )
    return f"notified {target.username}"


def _act_update_score(cfg, payload, rule, instance):
    from ..signals import apply_score_event
    if instance is None or type(instance).__name__ != "Leads":
        return "not a lead"
    # Use a synthetic event so it's tracked in LeadScoreHistory.
    apply_score_event(instance, "automation_action", reason=cfg.get("reason", "automation"))
    return f"score recalculated"


def _act_move_stage(cfg, payload, rule, instance):
    new_status = cfg.get("status")
    if not instance or not new_status or not hasattr(instance, "status"):
        return "no instance or status"
    type(instance).objects.filter(pk=instance.pk).update(status=new_status)
    return f"status → {new_status}"


def _act_webhook(cfg, payload, rule, instance):
    import requests  # local import — only needed if a webhook action fires
    url = cfg.get("url")
    if not url:
        return "no url"
    method = (cfg.get("method") or "POST").upper()
    try:
        r = requests.request(method, url, json={"event": payload.get("event"), "data": payload}, timeout=8)
        return f"{method} {url} → {r.status_code}"
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"webhook failed: {exc}") from exc


def _act_whatsapp(cfg, payload, rule, instance):
    from . import whatsapp_client
    to = cfg.get("to") or getattr(instance, "phone", "")
    if not to:
        return "no phone number"
    template = cfg.get("template", "")
    body = cfg.get("body", "")
    if template:
        whatsapp_client.send_template(rule.organization, to, template, cfg.get("variables", []))
    else:
        whatsapp_client.send_text(rule.organization, to, body)
    return f"whatsapp queued to {to}"


ACTION_HANDLERS = {
    "create_task": _act_create_task,
    "assign_user": _act_assign_user,
    "send_notification": _act_send_notification,
    "update_score": _act_update_score,
    "move_stage": _act_move_stage,
    "move_pipeline_stage": _act_move_stage,
    "webhook": _act_webhook,
    "webhook_call": _act_webhook,
    "whatsapp": _act_whatsapp,
    "whatsapp_trigger": _act_whatsapp,
}
