"""Meta WhatsApp Cloud API client.

Reads credentials per-org from `WhatsAppConfig`. Falls back to global
`.env` settings (WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN,
WHATSAPP_WEBHOOK_VERIFY_TOKEN) when an org hasn't filled in its own.

All sends are logged to `WhatsAppMessage` regardless of success — that gives
the admin UI an audit trail. If the org isn't configured, messages stay in
PENDING and `error_message` records the reason.

Public functions:

    send_text(org, to, body, **extra)
    send_template(org, to, template_name, variables=None)
    send_media(org, to, media_url, media_type="image", caption="")
    handle_webhook(payload)  → called by /api/whatsapp/webhook/

The Meta endpoint is `https://graph.facebook.com/v18.0/<phone_number_id>/messages`.
"""

from __future__ import annotations

import logging
from typing import Optional

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.facebook.com/v18.0"


def _config(org) -> tuple[Optional[str], Optional[str]]:
    """Return (phone_number_id, access_token) — falls back to settings env."""
    from ..models import WhatsAppConfig

    if org is not None:
        cfg = WhatsAppConfig.objects.filter(organization=org).first()
        if cfg and cfg.phone_number_id and cfg.access_token:
            return cfg.phone_number_id, cfg.access_token

    pid = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", "") or ""
    tok = getattr(settings, "WHATSAPP_ACCESS_TOKEN", "") or ""
    return pid or None, tok or None


def _log_outbound(org, to: str, body: str, template: str = "", external_id: str = "",
                   status: str = "PENDING", error: str = "") -> "WhatsAppMessage":
    from ..models import WhatsAppMessage
    return WhatsAppMessage.objects.create(
        organization=org,
        direction="OUT",
        to_number=to,
        body=body,
        template_name=template,
        external_id=external_id,
        status=status,
        error_message=error,
        sent_at=timezone.now() if status == "SENT" else None,
    )


def _post(phone_id: str, token: str, payload: dict) -> dict:
    """POST a single message to Meta Graph. Returns parsed response."""
    import requests
    url = f"{GRAPH_BASE}/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    r = requests.post(url, json=payload, headers=headers, timeout=10)
    try:
        body = r.json()
    except Exception:  # noqa: BLE001
        body = {"raw": r.text}
    if r.status_code >= 400:
        raise RuntimeError(f"Meta API {r.status_code}: {body}")
    return body


# ─── Public send helpers ────────────────────────────────────────


def send_text(org, to: str, body: str) -> "WhatsAppMessage":
    phone_id, token = _config(org)
    if not phone_id or not token:
        return _log_outbound(org, to, body, status="PENDING",
                              error="WhatsApp not configured (no phone_number_id / access_token)")

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": body[:4096]},
    }
    try:
        resp = _post(phone_id, token, payload)
        msg_id = (resp.get("messages") or [{}])[0].get("id", "")
        return _log_outbound(org, to, body, external_id=msg_id, status="SENT")
    except Exception as exc:  # noqa: BLE001
        logger.warning("whatsapp text send failed: %s", exc)
        return _log_outbound(org, to, body, status="FAILED", error=str(exc))


def send_template(org, to: str, template_name: str, variables: list[str] | None = None) -> "WhatsAppMessage":
    phone_id, token = _config(org)
    body_preview = f"[template:{template_name}] {', '.join(variables or [])}"
    if not phone_id or not token:
        return _log_outbound(org, to, body_preview, template=template_name, status="PENDING",
                              error="WhatsApp not configured")

    components = []
    if variables:
        components.append({
            "type": "body",
            "parameters": [{"type": "text", "text": str(v)} for v in variables],
        })

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en_US"},
            "components": components,
        },
    }
    try:
        resp = _post(phone_id, token, payload)
        msg_id = (resp.get("messages") or [{}])[0].get("id", "")
        return _log_outbound(org, to, body_preview, template=template_name,
                              external_id=msg_id, status="SENT")
    except Exception as exc:  # noqa: BLE001
        return _log_outbound(org, to, body_preview, template=template_name,
                              status="FAILED", error=str(exc))


def send_media(org, to: str, media_url: str, media_type: str = "image", caption: str = "") -> "WhatsAppMessage":
    phone_id, token = _config(org)
    body_preview = f"[{media_type}] {media_url}"
    if not phone_id or not token:
        return _log_outbound(org, to, body_preview, status="PENDING", error="WhatsApp not configured")

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": media_type,
        media_type: {"link": media_url, "caption": caption} if media_type in ("image", "video", "document") else {"link": media_url},
    }
    try:
        resp = _post(phone_id, token, payload)
        msg_id = (resp.get("messages") or [{}])[0].get("id", "")
        return _log_outbound(org, to, body_preview, external_id=msg_id, status="SENT")
    except Exception as exc:  # noqa: BLE001
        return _log_outbound(org, to, body_preview, status="FAILED", error=str(exc))


def bulk_send(org, recipients: list[str], body: str) -> list:
    """Naive bulk text. For large lists prefer queueing via Celery."""
    return [send_text(org, r, body) for r in recipients]


# ─── Webhook receiver ───────────────────────────────────────────


def handle_webhook(payload: dict) -> int:
    """Process a Meta webhook payload. Updates delivery statuses + logs
    incoming customer replies. Returns number of events processed.
    """
    from ..models import WhatsAppMessage, Organization

    entries = payload.get("entry") or []
    processed = 0
    for entry in entries:
        for change in (entry.get("changes") or []):
            value = change.get("value") or {}
            metadata = value.get("metadata") or {}
            phone_id = metadata.get("phone_number_id")

            org = _org_for_phone_id(phone_id)

            # Delivery status updates.
            for status in (value.get("statuses") or []):
                msg_id = status.get("id")
                state = (status.get("status") or "").upper()
                msg = WhatsAppMessage.objects.filter(external_id=msg_id).first()
                if msg and state:
                    msg.status = state
                    if state in ("DELIVERED", "READ"):
                        msg.delivered_at = timezone.now()
                    msg.save(update_fields=["status", "delivered_at"])
                    processed += 1

            # Incoming customer replies.
            for message in (value.get("messages") or []):
                from_number = message.get("from", "")
                text_body = ((message.get("text") or {}).get("body")) or ""
                WhatsAppMessage.objects.create(
                    organization=org,
                    direction="IN",
                    from_number=from_number,
                    body=text_body[:2000],
                    external_id=message.get("id", ""),
                    status="RECEIVED",
                    received_at=timezone.now(),
                )
                processed += 1

    return processed


def _org_for_phone_id(phone_id: str):
    """Resolve an org by its configured phone_number_id (or None)."""
    if not phone_id:
        return None
    from ..models import WhatsAppConfig
    cfg = WhatsAppConfig.objects.filter(phone_number_id=phone_id).select_related("organization").first()
    return cfg.organization if cfg else None
