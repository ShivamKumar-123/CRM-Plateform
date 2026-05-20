"""Helpdesk / ticketing business logic.

Tickets get a sequential number per org (`ORG-#000123`), an SLA policy from
the department, and auto-assignment to the department's default agent. The
SLA timer fields (`first_response_due`, `resolution_due`) are computed up
front; a downstream worker (or the next request that touches the ticket)
flips `sla_breached` when the deadline passes.
"""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Max
from django.utils import timezone


def next_ticket_number(org) -> str:
    """Generate the next per-org ticket number — e.g. `ACME-000124`."""
    from ..models import Ticket
    prefix = (getattr(org, "slug", "") or "TKT").upper()[:8]
    last = Ticket.objects.filter(organization=org).aggregate(m=Max("id"))["m"] or 0
    return f"{prefix}-{last + 1:06d}"


def attach_sla(ticket) -> None:
    """Pick the right SLAPolicy by department + priority and stamp due times."""
    from ..models import SLAPolicy

    policy = None
    if ticket.department_id:
        policy = SLAPolicy.objects.filter(
            organization=ticket.organization,
            department=ticket.department,
            priority=ticket.priority,
            is_active=True,
        ).first()
    if not policy:
        policy = SLAPolicy.objects.filter(
            organization=ticket.organization,
            priority=ticket.priority,
            is_active=True,
        ).first()

    if policy:
        ticket.sla_policy = policy
        ticket.first_response_due = timezone.now() + timedelta(minutes=policy.first_response_minutes)
        ticket.resolution_due = timezone.now() + timedelta(minutes=policy.resolution_minutes)


def auto_assign(ticket) -> None:
    """If no assignee, drop the ticket on the department's default agent."""
    if ticket.assigned_to_id:
        return
    if ticket.department and ticket.department.default_assignee_id:
        ticket.assigned_to_id = ticket.department.default_assignee_id


def mark_first_response(ticket) -> None:
    if ticket.first_response_at is None:
        ticket.first_response_at = timezone.now()


def check_sla(ticket) -> bool:
    """Refresh `sla_breached` based on current time. Returns True if breached."""
    breached = False
    now = timezone.now()
    if ticket.first_response_due and not ticket.first_response_at and now > ticket.first_response_due:
        breached = True
    if ticket.resolution_due and ticket.status not in ("RESOLVED", "CLOSED") and now > ticket.resolution_due:
        breached = True
    if breached and not ticket.sla_breached:
        ticket.sla_breached = True
    return breached


def escalate_if_breached(ticket) -> None:
    """Coarse escalation — notifies the department's default agent (manager)
    if SLA broke and the ticket isn't already escalated.
    """
    if not ticket.sla_breached or ticket.escalated:
        return
    from ..models import Notification
    target = ticket.department.default_assignee if ticket.department else None
    if target:
        Notification.objects.create(
            user=target,
            organization=ticket.organization,
            type="ticket_sla_breach",
            title=f"SLA breach: {ticket.number}",
            body=ticket.subject[:200],
            link=f"/admin/helpdesk?ticket={ticket.id}",
        )
    ticket.escalated = True


def render_canned(reply, ticket) -> str:
    """Substitute simple variables in a canned-reply body.

    Supported tokens::

        {customer_name}, {ticket_number}, {assignee}, {subject}
    """
    body = reply.body or ""
    repl = {
        "{customer_name}": ticket.customer_name or "there",
        "{ticket_number}": ticket.number,
        "{assignee}": getattr(ticket.assigned_to, "username", "") or "the team",
        "{subject}": ticket.subject,
    }
    for k, v in repl.items():
        body = body.replace(k, v)
    return body
