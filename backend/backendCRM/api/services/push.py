"""Push-notification dispatch — Web Push + Expo.

Web Push uses VAPID; Expo uses its FCM/APNS bridge via the Expo push API.
When credentials are missing, send is logged and skipped (no crash).

Required env:
    VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CLAIMS_EMAIL  (for Web Push)
    (No env needed for Expo — endpoint is the Expo push token itself.)
"""

from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def send_to_user(user, *, title: str, body: str, link: str = "", data: dict | None = None) -> dict:
    from ..models import PushSubscription
    subs = PushSubscription.objects.filter(user=user, is_active=True)
    if not subs.exists():
        return {"sent": 0, "skipped": 0, "no_subscriptions": True}

    sent = 0; failed = 0
    for sub in subs:
        try:
            if sub.platform == "WEB":
                ok = _send_web_push(sub, title, body, link, data or {})
            elif sub.platform == "EXPO":
                ok = _send_expo(sub, title, body, link, data or {})
            else:
                ok = False  # FCM not implemented in this scaffold
            if ok:
                sent += 1
                sub.last_used_at = timezone.now()
                sub.save(update_fields=["last_used_at"])
            else:
                failed += 1
        except Exception as exc:  # noqa: BLE001
            logger.warning("push send failed: %s", exc)
            failed += 1
    return {"sent": sent, "failed": failed}


def _send_web_push(sub, title, body, link, data) -> bool:
    public = getattr(settings, "VAPID_PUBLIC_KEY", "")
    private = getattr(settings, "VAPID_PRIVATE_KEY", "")
    claims_email = getattr(settings, "VAPID_CLAIMS_EMAIL", "")
    if not (public and private and claims_email):
        logger.info("web push skipped — VAPID keys not configured")
        return False
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        logger.warning("pywebpush not installed; install to enable Web Push")
        return False

    subscription_info = {
        "endpoint": sub.endpoint,
        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
    }
    payload = json.dumps({"title": title, "body": body, "link": link, "data": data})
    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=private,
            vapid_claims={"sub": f"mailto:{claims_email}"},
            timeout=8,
        )
        return True
    except WebPushException as exc:
        # Subscription gone (410) → mark inactive
        if exc.response is not None and exc.response.status_code in (404, 410):
            sub.is_active = False
            sub.save(update_fields=["is_active"])
        return False


def _send_expo(sub, title, body, link, data) -> bool:
    import requests
    payload = {
        "to": sub.endpoint,  # Expo push token
        "title": title,
        "body": body,
        "data": {"link": link, **(data or {})},
        "sound": "default",
    }
    r = requests.post("https://exp.host/--/api/v2/push/send", json=payload, timeout=10)
    if r.status_code != 200:
        return False
    return True
