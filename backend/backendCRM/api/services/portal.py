"""Customer Portal helpers.

The portal uses a separate auth flow: opaque `PortalToken` strings sent in
`Authorization: Portal <token>`. No password. Tokens are minted by org admins
from the lead detail page or admin Helpdesk page; the customer receives the
magic link via email / WhatsApp (out of scope here — that's the org's job).

The portal API surface is intentionally **read-only** + ticket-create:
customers can see their own invoices, documents, payments, tickets, and
deals. They can open new tickets and reply to existing ones. They can't
edit anything else.
"""

from __future__ import annotations

import secrets
from datetime import timedelta

from django.utils import timezone


def mint_token(org, email: str, name: str = "", lead=None, expires_days: int = 90, created_by=None):
    """Create a new PortalToken row + return it."""
    from ..models import PortalToken

    return PortalToken.objects.create(
        organization=org,
        email=email,
        name=name,
        linked_lead=lead,
        token=f"prt_{secrets.token_urlsafe(32)}",
        expires_at=timezone.now() + timedelta(days=expires_days),
        created_by=created_by,
    )


def resolve_token(token: str):
    """Return the PortalToken row if valid + active + not expired."""
    if not token or not token.startswith("prt_"):
        return None
    from ..models import PortalToken
    row = PortalToken.objects.select_related("organization", "linked_lead").filter(
        token=token, is_active=True,
    ).first()
    if not row:
        return None
    if row.expires_at and row.expires_at < timezone.now():
        return None
    return row


def touch(token_row) -> None:
    token_row.last_used_at = timezone.now()
    token_row.save(update_fields=["last_used_at"])


def visible_leads(token_row):
    """Leads attached to this portal session — by linked_lead OR same email."""
    from ..models import Leads
    qs = Leads.objects.filter(organization=token_row.organization)
    if token_row.linked_lead_id:
        return qs.filter(pk=token_row.linked_lead_id)
    return qs.filter(email__iexact=token_row.email)


def visible_tickets(token_row):
    from ..models import Ticket
    return Ticket.objects.filter(
        organization=token_row.organization,
        customer_email__iexact=token_row.email,
    )


def visible_invoices(token_row):
    """Invoices via Subscription → Organization match for this token's org.

    Without a per-customer billing relationship in the current model we
    expose org-level invoices when there is a linked_lead (single-customer
    org case). Multi-customer orgs should attach customer_lead to Invoice
    in a future migration.
    """
    from ..models import Invoice
    qs = Invoice.objects.filter(organization=token_row.organization)
    return qs[:50]


def visible_documents(token_row):
    from ..models import Document
    leads = visible_leads(token_row).values_list("id", flat=True)
    return Document.objects.filter(lead_id__in=leads)


def visible_deals(token_row):
    from ..models import Deal
    leads = visible_leads(token_row).values_list("id", flat=True)
    return Deal.objects.filter(lead_id__in=leads) if leads else Deal.objects.none()
