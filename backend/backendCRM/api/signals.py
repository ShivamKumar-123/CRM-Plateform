"""
Django signals for:
  - Audit logging (every Lead/Deal/Payment/User create/update/delete)
  - Notification production (lead assigned, deal won, task created, payment received)

Wired in api/apps.py via ApiConfig.ready().
"""

import json
from decimal import Decimal
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out

from .models import (
    Leads, Deal, Payment, Task, User, Organization,
    AuditLog, Notification,
)


# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────

_TRACKED_FIELDS = {
    "leads":   ["name", "phone", "email", "status", "assigned_to_id", "base_price",
                "city", "brand_name", "product_name", "tags"],
    "deal":    ["status", "deal_value", "cost_price", "assigned_to_id",
                "expected_close_date"],
    "payment": ["amount_paid", "payment_type", "payment_stage"],
    "task":    ["status", "priority", "assigned_to_id", "due_date"],
    "user":    ["username", "email", "role", "status", "is_active",
                "is_staff", "is_superuser", "organization_id"],
}


def _serialize(value):
    if isinstance(value, Decimal):
        return str(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def _snapshot(instance, fields):
    return {f: _serialize(getattr(instance, f, None)) for f in fields}


def _diff(old, new):
    return {
        k: {"from": old.get(k), "to": new.get(k)}
        for k in new
        if old.get(k) != new.get(k)
    }


def _capture_pre(instance):
    """Stash a pre-save snapshot on the instance so post_save can diff."""
    model_key = instance._meta.model_name
    fields = _TRACKED_FIELDS.get(model_key, [])
    if not fields:
        return
    try:
        old = instance.__class__.objects.get(pk=instance.pk)
        instance._pre_save_snapshot = _snapshot(old, fields)
    except instance.DoesNotExist:
        instance._pre_save_snapshot = None


def _log(action, instance, user=None, organization=None, changes=None):
    """Write an AuditLog row. Best-effort — never blocks the save."""
    try:
        AuditLog.objects.create(
            organization=organization,
            user=user,
            action=action,
            model_name=instance._meta.model_name,
            object_id=str(instance.pk),
            object_repr=str(instance)[:200],
            changes=changes or {},
        )
    except Exception:
        # Audit failures must never break business operations
        pass


def _notify(user, *, type, title, body="", link="", organization=None):
    """Create an in-app notification."""
    try:
        Notification.objects.create(
            user=user,
            organization=organization,
            type=type,
            title=title,
            body=body,
            link=link,
        )
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────
# Audit signals — Lead
# ─────────────────────────────────────────────────────────────────

@receiver(pre_save, sender=Leads)
def lead_pre_save(sender, instance, **kwargs):
    if instance.pk:
        _capture_pre(instance)


@receiver(post_save, sender=Leads)
def lead_post_save(sender, instance, created, **kwargs):
    if created:
        _log("CREATE", instance, organization=instance.organization)
        # Notification: lead assigned to someone on creation
        if instance.assigned_to_id:
            _notify(
                instance.assigned_to,
                type="lead_assigned",
                title=f"New lead assigned: {instance.name}",
                body=f"{instance.product_name or instance.brand_name or 'New inquiry'} · {instance.city or '—'}",
                link="/app/leads",
                organization=instance.organization,
            )
    else:
        old_snapshot = getattr(instance, "_pre_save_snapshot", None)
        if old_snapshot:
            new_snapshot = _snapshot(instance, _TRACKED_FIELDS["leads"])
            changes = _diff(old_snapshot, new_snapshot)
            if changes:
                _log("UPDATE", instance, organization=instance.organization, changes=changes)
            # Notification: assignment changed
            if "assigned_to_id" in changes and instance.assigned_to_id:
                _notify(
                    instance.assigned_to,
                    type="lead_assigned",
                    title=f"Lead reassigned to you: {instance.name}",
                    body=f"Status: {instance.status}",
                    link="/app/leads",
                    organization=instance.organization,
                )


@receiver(post_delete, sender=Leads)
def lead_post_delete(sender, instance, **kwargs):
    _log("DELETE", instance, organization=instance.organization)


# ─────────────────────────────────────────────────────────────────
# Audit signals — Deal
# ─────────────────────────────────────────────────────────────────

@receiver(pre_save, sender=Deal)
def deal_pre_save(sender, instance, **kwargs):
    if instance.pk:
        _capture_pre(instance)


@receiver(post_save, sender=Deal)
def deal_post_save(sender, instance, created, **kwargs):
    if created:
        _log("CREATE", instance, organization=instance.organization)
    else:
        old_snapshot = getattr(instance, "_pre_save_snapshot", None)
        if old_snapshot:
            new_snapshot = _snapshot(instance, _TRACKED_FIELDS["deal"])
            changes = _diff(old_snapshot, new_snapshot)
            if changes:
                _log("UPDATE", instance, organization=instance.organization, changes=changes)
            # Notification: deal won 🎉
            if "status" in changes and changes["status"]["to"] == "WON":
                if instance.assigned_to_id:
                    _notify(
                        instance.assigned_to,
                        type="deal_won",
                        title=f"Deal won: {instance.lead.name if instance.lead_id else 'Deal'}",
                        body=f"₹{instance.deal_value} · congratulations!",
                        link="/app/deals",
                        organization=instance.organization,
                    )


@receiver(post_delete, sender=Deal)
def deal_post_delete(sender, instance, **kwargs):
    _log("DELETE", instance, organization=instance.organization)


# ─────────────────────────────────────────────────────────────────
# Audit signals — Payment
# ─────────────────────────────────────────────────────────────────

@receiver(post_save, sender=Payment)
def payment_post_save(sender, instance, created, **kwargs):
    org = instance.deal.organization if instance.deal_id else None
    if created:
        _log("CREATE", instance, organization=org)
        if instance.deal_id and instance.deal.assigned_to_id:
            _notify(
                instance.deal.assigned_to,
                type="payment_received",
                title=f"Payment received: ₹{instance.amount_paid}",
                body=f"{instance.get_payment_type_display()} · {instance.get_payment_stage_display()}",
                link="/app/deals",
                organization=org,
            )
    else:
        _log("UPDATE", instance, organization=org)


@receiver(post_delete, sender=Payment)
def payment_post_delete(sender, instance, **kwargs):
    org = instance.deal.organization if instance.deal_id else None
    _log("DELETE", instance, organization=org)


# ─────────────────────────────────────────────────────────────────
# Audit signals — Task
# ─────────────────────────────────────────────────────────────────

@receiver(post_save, sender=Task)
def task_post_save(sender, instance, created, **kwargs):
    if created:
        _log("CREATE", instance, organization=instance.organization)
        if instance.assigned_to_id:
            _notify(
                instance.assigned_to,
                type="task_due",
                title=f"New task: {instance.title}",
                body=f"Priority: {instance.priority} · Due: {instance.due_date or 'no date'}",
                link="/app",
                organization=instance.organization,
            )


@receiver(post_delete, sender=Task)
def task_post_delete(sender, instance, **kwargs):
    _log("DELETE", instance, organization=instance.organization)


# ─────────────────────────────────────────────────────────────────
# Audit signals — User
# ─────────────────────────────────────────────────────────────────

@receiver(pre_save, sender=User)
def user_pre_save(sender, instance, **kwargs):
    if instance.pk:
        _capture_pre(instance)


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        _log("CREATE", instance, organization=instance.organization, user=instance)
    else:
        old_snapshot = getattr(instance, "_pre_save_snapshot", None)
        if old_snapshot:
            new_snapshot = _snapshot(instance, _TRACKED_FIELDS["user"])
            changes = _diff(old_snapshot, new_snapshot)
            if changes:
                _log("UPDATE", instance, organization=instance.organization, changes=changes)


@receiver(post_delete, sender=User)
def user_post_delete(sender, instance, **kwargs):
    _log("DELETE", instance, organization=instance.organization)


# ─────────────────────────────────────────────────────────────────
# Login / logout signals
# ─────────────────────────────────────────────────────────────────

@receiver(user_logged_in)
def on_login(sender, request, user, **kwargs):
    _log("LOGIN", user, user=user, organization=getattr(user, "organization", None))


@receiver(user_logged_out)
def on_logout(sender, request, user, **kwargs):
    if user:
        _log("LOGOUT", user, user=user, organization=getattr(user, "organization", None))
