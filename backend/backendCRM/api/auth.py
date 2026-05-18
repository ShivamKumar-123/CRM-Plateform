"""
Custom JWT login view that enforces TOTP 2FA when enabled.

Flow:
  POST /api/token/ {username, password}
    → if 2FA enabled for user:  403 {requires_2fa: true}  (do NOT issue token)
    → else:                     200 {access, refresh}

  POST /api/token/ {username, password, otp}
    → validates OTP first, then issues token
"""

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from rest_framework.response import Response


class TwoFactorTokenSerializer(TokenObtainPairSerializer):
    """Adds an optional `otp` field and enforces 2FA if the user has it enabled."""

    def validate(self, attrs):
        # First validate username + password the normal way (sets self.user)
        data = super().validate(attrs)

        # Lazy import to avoid app-loading order issues
        from .models import TwoFactorSecret
        import pyotp
        from django.utils import timezone

        tf = TwoFactorSecret.objects.filter(user=self.user, is_enabled=True).first()
        if tf:
            otp = self.context["request"].data.get("otp") or ""
            otp = str(otp).strip().replace(" ", "")

            # Allow backup codes too (one-use)
            if otp and otp.upper() in (tf.backup_codes or []):
                tf.backup_codes = [c for c in tf.backup_codes if c.upper() != otp.upper()]
                tf.last_used_at = timezone.now()
                tf.save(update_fields=["backup_codes", "last_used_at"])
                return data

            if not otp:
                raise AuthenticationFailed({"requires_2fa": True, "detail": "Enter your 2FA code to continue."}, code="2fa_required")

            if not pyotp.TOTP(tf.secret).verify(otp, valid_window=1):
                raise AuthenticationFailed({"detail": "Invalid 2FA code."}, code="2fa_invalid")

            tf.last_used_at = timezone.now()
            tf.save(update_fields=["last_used_at"])

        return data


class TwoFactorTokenObtainPairView(TokenObtainPairView):
    serializer_class = TwoFactorTokenSerializer
