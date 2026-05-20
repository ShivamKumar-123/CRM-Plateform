"""Custom middleware.

`SessionTrackingMiddleware` — for every authenticated request, look at the JWT
`jti` claim and upsert a `UserSession` row so users can see + revoke their
active devices from the Profile / Admin → Sessions page.
"""

from __future__ import annotations

import logging
import re

from django.utils import timezone

logger = logging.getLogger(__name__)


def _detect_device(ua: str) -> str:
    """Very loose UA sniffing — good enough for a friendly device label."""
    ua_low = (ua or "").lower()
    if not ua_low:
        return "Unknown device"

    browser = "Browser"
    for needle, name in (
        ("edg/", "Edge"),
        ("chrome/", "Chrome"),
        ("crios/", "Chrome iOS"),
        ("firefox/", "Firefox"),
        ("safari/", "Safari"),
        ("opr/", "Opera"),
        ("postmanruntime", "Postman"),
        ("curl/", "curl"),
        ("python-requests", "Python"),
        ("okhttp", "Android app"),
        ("expo", "Expo app"),
    ):
        if needle in ua_low:
            browser = name
            break

    os_name = "Device"
    for needle, name in (
        ("windows nt 10", "Windows 10/11"),
        ("windows", "Windows"),
        ("mac os", "macOS"),
        ("iphone", "iPhone"),
        ("ipad", "iPad"),
        ("android", "Android"),
        ("linux", "Linux"),
    ):
        if needle in ua_low:
            os_name = name
            break

    return f"{browser} · {os_name}"


def _client_ip(request) -> str | None:
    xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or None


class SessionTrackingMiddleware:
    """Upsert UserSession rows from JWT requests."""

    JTI_REGEX = re.compile(r'"jti"\s*:\s*"([^"]+)"')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            self._track(request)
        except Exception as exc:  # noqa: BLE001 — never break the response
            logger.debug("session tracking failed: %s", exc)
        return response

    def _track(self, request):
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return

        # Decode jti without re-verifying — the JWTAuthentication class already
        # validated the token before we got here.
        token = auth_header.split(" ", 1)[1]
        jti = self._extract_jti(token)
        if not jti:
            return

        from .models import UserSession  # local import to avoid early model loading

        ua = request.META.get("HTTP_USER_AGENT", "")[:512]
        ip = _client_ip(request)
        device = _detect_device(ua)

        session, created = UserSession.objects.get_or_create(
            jti=jti,
            defaults={
                "user": user,
                "user_agent": ua,
                "ip_address": ip,
                "device_label": device,
            },
        )
        if not created:
            updates = {}
            if session.user_agent != ua:
                updates["user_agent"] = ua
            if ip and session.ip_address != ip:
                updates["ip_address"] = ip
            if device and session.device_label != device:
                updates["device_label"] = device
            updates["last_seen_at"] = timezone.now()
            for k, v in updates.items():
                setattr(session, k, v)
            session.save(update_fields=list(updates.keys()))

    @staticmethod
    def _extract_jti(token: str) -> str | None:
        """Pull the jti claim out of a JWT without verification."""
        try:
            import base64
            import json

            parts = token.split(".")
            if len(parts) != 3:
                return None
            payload = parts[1]
            # base64url decode with padding fix
            padded = payload + "=" * (-len(payload) % 4)
            data = base64.urlsafe_b64decode(padded.encode("ascii"))
            obj = json.loads(data)
            return obj.get("jti")
        except Exception:  # noqa: BLE001
            return None
