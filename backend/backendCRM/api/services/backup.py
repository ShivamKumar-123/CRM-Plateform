"""Backup & restore service — wraps Django's dumpdata / loaddata.

Each `BackupJob` produces a JSON snapshot of the org's core tables. Files are
written to `MEDIA_ROOT/backups/`. Retention is enforced by `retention_days`.

Encryption uses Fernet (symmetric AES) if the `cryptography` lib is installed
and `BACKUP_ENCRYPTION_KEY` is set; otherwise files are plain JSON.

Restore loads a JSON dump back into the database — intended for admins
recovering from data loss, NOT for moving data between orgs.
"""

from __future__ import annotations

import io
import json
import logging
import os
import tempfile

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.utils import timezone

logger = logging.getLogger(__name__)

# Apps + models that get backed up.
BACKUP_TARGETS = [
    "api.Organization", "api.User", "api.Pipeline", "api.PipelineStage",
    "api.Leads", "api.Deal", "api.Payment", "api.Document", "api.Task", "api.TaskMessage",
    "api.CustomField", "api.CustomFieldValue", "api.Notification", "api.AuditLog",
    "api.LeadScoreRule", "api.LeadScoreHistory", "api.SalesTarget", "api.SavedView",
    "api.CallLog", "api.AutomationRule", "api.AutomationRun",
    "api.Ticket", "api.TicketMessage", "api.Department", "api.SLAPolicy", "api.CannedReply",
    "api.KbArticle", "api.KbCategory",
]


def _encrypt(data: bytes) -> tuple[bytes, bool]:
    key = getattr(settings, "BACKUP_ENCRYPTION_KEY", "") or ""
    if not key:
        return data, False
    try:
        from cryptography.fernet import Fernet
        return Fernet(key.encode()).encrypt(data), True
    except Exception:  # noqa: BLE001
        logger.warning("BACKUP_ENCRYPTION_KEY set but cryptography unavailable — writing plain")
        return data, False


def _decrypt(data: bytes) -> bytes:
    key = getattr(settings, "BACKUP_ENCRYPTION_KEY", "") or ""
    if not key:
        return data
    try:
        from cryptography.fernet import Fernet
        return Fernet(key.encode()).decrypt(data)
    except Exception:  # noqa: BLE001
        return data


def run_backup(job) -> None:
    """Execute a backup. Mutates the job row with status + file."""
    job.status = "RUNNING"
    job.save(update_fields=["status"])
    try:
        buf = io.StringIO()
        call_command("dumpdata", *BACKUP_TARGETS, indent=2, stdout=buf)
        raw = buf.getvalue().encode("utf-8")
        encrypted, was_encrypted = _encrypt(raw)
        filename = f"backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}_org{job.organization_id or 'all'}.json"
        if was_encrypted:
            filename += ".enc"
        job.file.save(filename, ContentFile(encrypted), save=False)
        job.file_size_bytes = len(encrypted)
        # Rough record count
        try:
            job.record_count = sum(1 for _ in json.loads(raw))
        except Exception:  # noqa: BLE001
            job.record_count = 0
        job.encryption_enabled = was_encrypted
        job.status = "COMPLETED"
        job.completed_at = timezone.now()
    except Exception as exc:  # noqa: BLE001
        logger.exception("backup failed")
        job.status = "FAILED"
        job.error_message = str(exc)
    job.save()


def restore_backup(job) -> dict:
    """Load `job.file` back into the database."""
    if not job.file:
        return {"ok": False, "error": "no file"}
    data = job.file.read()
    raw = _decrypt(data)
    with tempfile.NamedTemporaryFile("wb", delete=False, suffix=".json") as fp:
        fp.write(raw)
        tmp_path = fp.name
    try:
        call_command("loaddata", tmp_path)
        job.status = "RESTORED"
        job.save(update_fields=["status"])
        return {"ok": True}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)}
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def prune_expired(org=None) -> int:
    """Delete BackupJob rows whose retention has passed. Returns count deleted."""
    from ..models import BackupJob
    qs = BackupJob.objects.all()
    if org:
        qs = qs.filter(organization=org)
    deleted = 0
    now = timezone.now()
    for j in qs:
        if not j.completed_at:
            continue
        age_days = (now - j.completed_at).days
        if age_days > (j.retention_days or 30):
            try:
                if j.file:
                    j.file.delete(save=False)
            except Exception:  # noqa: BLE001
                pass
            j.delete()
            deleted += 1
    return deleted
