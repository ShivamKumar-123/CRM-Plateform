"""Cloud-storage OAuth abstraction (Google Drive / Dropbox / OneDrive).

This module exposes the OAuth URL generators + token-exchange entrypoints.
Actual upload/download is provider-specific and uses standard `requests`
calls against the provider's REST API once we have access tokens.

Credentials are read from settings::

    GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
    DROPBOX_CLIENT_ID / DROPBOX_CLIENT_SECRET / DROPBOX_REDIRECT_URI
    ONEDRIVE_CLIENT_ID / ONEDRIVE_CLIENT_SECRET / ONEDRIVE_REDIRECT_URI

When a provider's `*_CLIENT_ID` isn't set, the connect-URL endpoint returns a
helpful error string instead of crashing.
"""

from __future__ import annotations

import secrets
from urllib.parse import urlencode

from django.conf import settings
from django.utils import timezone


PROVIDERS = {
    "GOOGLE_DRIVE": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scope": "https://www.googleapis.com/auth/drive.file",
        "id_key": "GOOGLE_CLIENT_ID",
        "secret_key": "GOOGLE_CLIENT_SECRET",
        "redirect_key": "GOOGLE_REDIRECT_URI",
    },
    "DROPBOX": {
        "auth_url": "https://www.dropbox.com/oauth2/authorize",
        "token_url": "https://api.dropbox.com/oauth2/token",
        "scope": "files.content.write files.content.read account_info.read",
        "id_key": "DROPBOX_CLIENT_ID",
        "secret_key": "DROPBOX_CLIENT_SECRET",
        "redirect_key": "DROPBOX_REDIRECT_URI",
    },
    "ONEDRIVE": {
        "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "scope": "offline_access Files.ReadWrite User.Read",
        "id_key": "ONEDRIVE_CLIENT_ID",
        "secret_key": "ONEDRIVE_CLIENT_SECRET",
        "redirect_key": "ONEDRIVE_REDIRECT_URI",
    },
}


def _provider_creds(provider: str) -> dict | None:
    cfg = PROVIDERS.get(provider)
    if not cfg:
        return None
    cid = getattr(settings, cfg["id_key"], "") or ""
    secret = getattr(settings, cfg["secret_key"], "") or ""
    redirect = getattr(settings, cfg["redirect_key"], "") or ""
    if not cid or not secret or not redirect:
        return None
    return {**cfg, "client_id": cid, "client_secret": secret, "redirect_uri": redirect}


def authorize_url(provider: str, state: str | None = None) -> tuple[str | None, str]:
    """Return (auth_url, state_token). auth_url is None when creds missing."""
    creds = _provider_creds(provider)
    if not creds:
        return None, ""
    state = state or secrets.token_urlsafe(20)
    params = {
        "client_id": creds["client_id"],
        "redirect_uri": creds["redirect_uri"],
        "response_type": "code",
        "scope": creds["scope"],
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{creds['auth_url']}?{urlencode(params)}", state


def exchange_code(provider: str, code: str) -> dict:
    """Swap an OAuth code for access/refresh tokens. Returns the provider's
    raw response dict; the caller persists it to CloudConnection.
    """
    import requests
    creds = _provider_creds(provider)
    if not creds:
        raise ValueError(f"{provider} OAuth not configured")
    body = {
        "code": code,
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"],
        "redirect_uri": creds["redirect_uri"],
        "grant_type": "authorization_code",
    }
    r = requests.post(creds["token_url"], data=body, timeout=15)
    r.raise_for_status()
    return r.json()


def save_connection(*, provider, user, org, token_response: dict, account_email: str = "", account_name: str = ""):
    from datetime import timedelta
    from ..models import CloudConnection
    expires_in = int(token_response.get("expires_in", 0) or 0)
    conn, _ = CloudConnection.objects.update_or_create(
        user=user,
        provider=provider,
        defaults={
            "organization": org,
            "access_token": token_response.get("access_token", ""),
            "refresh_token": token_response.get("refresh_token", ""),
            "token_expires_at": timezone.now() + timedelta(seconds=expires_in) if expires_in else None,
            "scope": token_response.get("scope", ""),
            "account_email": account_email,
            "account_name": account_name,
            "is_active": True,
        },
    )
    return conn


def upload_file(connection, *, filename: str, content: bytes, folder: str = "/CRM") -> dict:
    """Upload a file using the saved connection. Returns provider response."""
    import requests
    if connection.provider == "DROPBOX":
        headers = {
            "Authorization": f"Bearer {connection.access_token}",
            "Dropbox-API-Arg": '{"path": "%s/%s", "mode": "add", "autorename": true}' % (folder, filename),
            "Content-Type": "application/octet-stream",
        }
        r = requests.post("https://content.dropboxapi.com/2/files/upload", headers=headers, data=content, timeout=30)
        return r.json()
    if connection.provider == "GOOGLE_DRIVE":
        # Simple resumable would require multi-step; using multipart for brevity.
        boundary = "crm_suite_boundary"
        meta = '{"name": "%s"}' % filename
        body = (
            f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta}\r\n"
            f"--{boundary}\r\nContent-Type: application/octet-stream\r\n\r\n"
        ).encode() + content + f"\r\n--{boundary}--".encode()
        headers = {
            "Authorization": f"Bearer {connection.access_token}",
            "Content-Type": f"multipart/related; boundary={boundary}",
        }
        r = requests.post("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
                          headers=headers, data=body, timeout=30)
        return r.json()
    if connection.provider == "ONEDRIVE":
        headers = {
            "Authorization": f"Bearer {connection.access_token}",
            "Content-Type": "application/octet-stream",
        }
        url = f"https://graph.microsoft.com/v1.0/me/drive/root:{folder}/{filename}:/content"
        r = requests.put(url, headers=headers, data=content, timeout=30)
        return r.json()
    raise ValueError(f"Unknown provider: {connection.provider}")
