"""Razorpay billing client.

Reads test/live credentials from settings (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`). Falls back to a no-op stub when keys aren't set —
useful for local dev without real Razorpay accounts.

Public API::

    create_order(amount_paise, plan, organization, user)  → razorpay order dict + Invoice row
    verify_payment_signature(order_id, payment_id, signature)
    handle_webhook(payload, sig_header)
    generate_invoice_pdf(invoice)                          → bytes (or empty when reportlab missing)
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def _client():
    """Build a Razorpay SDK client. Returns None if creds aren't set."""
    key = getattr(settings, "RAZORPAY_KEY_ID", "") or ""
    secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    if not key or not secret:
        return None
    try:
        import razorpay
        return razorpay.Client(auth=(key, secret))
    except ImportError:
        logger.warning("razorpay SDK not installed — checkout will return stub data")
        return None


# ─── Create order ────────────────────────────────────────────────


def create_order(amount_paise: int, plan, organization, user) -> dict:
    """Create a Razorpay order + a draft Invoice. Returns dict for the frontend
    to feed Razorpay Checkout. When Razorpay isn't configured returns a stub
    so the UI still flows in dev.
    """
    from ..models import Invoice

    invoice = Invoice.objects.create(
        organization=organization,
        plan=plan,
        amount=Decimal(amount_paise) / 100,
        currency="INR",
        status="PENDING",
        billing_period_start=timezone.now().date(),
        billing_period_end=(timezone.now() + timedelta(days=30)).date(),
        notes=f"Auto-generated for plan '{plan.name if plan else ''}'",
    )

    client = _client()
    if client is None:
        invoice.notes = (invoice.notes + " [stub mode: Razorpay not configured]").strip()
        invoice.save(update_fields=["notes"])
        return {
            "stub": True,
            "invoice_id": invoice.id,
            "order_id": f"order_stub_{invoice.id}",
            "amount": amount_paise,
            "currency": "INR",
            "razorpay_key_id": "",
            "message": "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
        }

    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "notes": {
                "invoice_id": invoice.id,
                "organization": getattr(organization, "slug", ""),
                "plan": getattr(plan, "slug", ""),
            },
        })
    except Exception as exc:  # noqa: BLE001
        logger.exception("razorpay order create failed")
        invoice.status = "FAILED"
        invoice.notes = f"order create failed: {exc}"
        invoice.save(update_fields=["status", "notes"])
        raise

    invoice.external_id = order.get("id", "")
    invoice.save(update_fields=["external_id"])

    return {
        "stub": False,
        "invoice_id": invoice.id,
        "order_id": order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "razorpay_key_id": getattr(settings, "RAZORPAY_KEY_ID", ""),
    }


# ─── Verify payment signature (Razorpay Checkout callback) ──────


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    if not secret:
        return False
    msg = f"{order_id}|{payment_id}".encode("utf-8")
    expected = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


# ─── Webhook handler ────────────────────────────────────────────


def verify_webhook_signature(raw_body: bytes, sig_header: str) -> bool:
    secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "") or ""
    if not secret:
        return False
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig_header or "")


def handle_webhook(payload: dict) -> dict:
    """Update Invoice + Subscription based on a Razorpay webhook event.

    Supported events: `payment.captured`, `payment.failed`, `subscription.charged`,
    `subscription.cancelled`.
    """
    from ..models import Invoice, Subscription

    event = payload.get("event")
    data = (payload.get("payload") or {}).get("payment", {}).get("entity", {})
    order_id = data.get("order_id") or ""
    if not order_id:
        order_id = (payload.get("payload") or {}).get("subscription", {}).get("entity", {}).get("id", "")

    invoice = Invoice.objects.filter(external_id=order_id).first()

    if event == "payment.captured" and invoice:
        invoice.status = "PAID"
        invoice.paid_at = timezone.now()
        invoice.razorpay_payment_id = data.get("id", "")
        invoice.save()
        # Activate subscription if attached
        sub = Subscription.objects.filter(organization=invoice.organization, plan=invoice.plan).first()
        if sub:
            sub.status = "ACTIVE"
            sub.current_period_start = invoice.billing_period_start
            sub.current_period_end = invoice.billing_period_end
            sub.save()
        return {"ok": True, "event": event, "invoice": invoice.id}

    if event == "payment.failed" and invoice:
        invoice.status = "FAILED"
        invoice.notes = data.get("error_description", "payment failed")
        invoice.save(update_fields=["status", "notes"])
        return {"ok": True, "event": event, "invoice": invoice.id}

    if event == "subscription.cancelled":
        sub = Subscription.objects.filter(external_id=order_id).first()
        if sub:
            sub.status = "CANCELLED"
            sub.save(update_fields=["status"])
            return {"ok": True, "event": event, "subscription": sub.id}

    return {"ok": True, "event": event, "matched": False}


# ─── GST Invoice PDF ────────────────────────────────────────────


def generate_invoice_pdf(invoice) -> bytes:
    """Produce a minimal GST invoice PDF (reportlab). Returns empty bytes if
    reportlab isn't installed.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
    except ImportError:
        return b""

    import io
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=f"Invoice {invoice.id}")
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>TAX INVOICE</b>", styles["Title"]))
    story.append(Spacer(1, 12))

    org = invoice.organization
    org_block = f"<b>{getattr(org, 'name', '—')}</b><br/>{getattr(org, 'address', '')}<br/>"
    if getattr(org, "gst_number", None):
        org_block += f"GSTIN: {org.gst_number}"
    story.append(Paragraph(org_block, styles["Normal"]))
    story.append(Spacer(1, 8))

    meta = [
        ["Invoice #", str(invoice.id)],
        ["Date", invoice.created_at.strftime("%d %b %Y")],
        ["Plan", getattr(invoice.plan, "name", "—")],
        ["Period", f"{invoice.billing_period_start} → {invoice.billing_period_end}"],
        ["Status", invoice.status],
    ]
    t = Table(meta, colWidths=[100, 300])
    t.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.5, colors.grey)]))
    story.append(t)
    story.append(Spacer(1, 12))

    sub_total = Decimal(invoice.amount) / Decimal("1.18")
    gst = Decimal(invoice.amount) - sub_total
    line_items = [
        ["Description", "Amount"],
        [f"Subscription · {getattr(invoice.plan, 'name', '—')}", f"₹ {sub_total:.2f}"],
        ["GST @ 18%", f"₹ {gst:.2f}"],
        ["Total", f"₹ {invoice.amount:.2f}"],
    ]
    t2 = Table(line_items, colWidths=[300, 100])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#facc15")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(t2)

    doc.build(story)
    return buf.getvalue()
