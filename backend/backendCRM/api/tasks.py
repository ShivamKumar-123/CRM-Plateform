"""Celery task definitions.

Auto-discovered by `backendCRM/celery.py`. Tasks are no-ops when Celery isn't
configured — the automation engine's `dispatch()` falls back to inline.
"""

from __future__ import annotations

import logging

try:
    from celery import shared_task
except ImportError:  # pragma: no cover — Celery optional
    def shared_task(*args, **kwargs):
        def deco(fn):
            fn.delay = lambda *a, **kw: None
            return fn
        if args and callable(args[0]):
            return deco(args[0])
        return deco


logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def execute_automation_rule(self, rule_id: int, event: str, payload: dict):
    """Execute one automation rule asynchronously."""
    from .models import AutomationRule
    from .services.automation_engine import execute_inline

    rule = AutomationRule.objects.filter(pk=rule_id).first()
    if not rule:
        return {"error": "rule not found"}
    try:
        return {"run_id": execute_inline(rule, event, payload, instance=None)}
    except Exception as exc:  # noqa: BLE001
        logger.exception("automation rule %s failed", rule_id)
        raise self.retry(exc=exc)


@shared_task
def send_whatsapp_text(org_id: int, to: str, body: str):
    """Async wrapper around whatsapp_client.send_text — used for bulk send."""
    from .models import Organization
    from .services import whatsapp_client
    org = Organization.objects.filter(pk=org_id).first()
    msg = whatsapp_client.send_text(org, to, body)
    return {"message_id": msg.id, "status": msg.status}


@shared_task
def check_sla_breaches():
    """Periodic task — scan tickets, flip sla_breached, escalate."""
    from .models import Ticket
    from .services.helpdesk import check_sla, escalate_if_breached

    count = 0
    for ticket in Ticket.objects.exclude(status__in=["RESOLVED", "CLOSED"]).iterator():
        if check_sla(ticket):
            escalate_if_breached(ticket)
            ticket.save(update_fields=["sla_breached", "escalated"])
            count += 1
    return {"breached": count}
