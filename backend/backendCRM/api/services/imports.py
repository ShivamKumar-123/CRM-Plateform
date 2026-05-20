"""CSV / Excel import + export engine.

Stateless service functions called by the views layer. Excel support is optional
— if `openpyxl` is not installed, we fall back to CSV only. All imports respect
tenant scope (caller passes the org), enforce field whitelists per module, and
provide a dry-run preview before commit.

Public entry points:

    preview(file_obj, filename, module, mapping)   → returns up to 20 parsed rows + errors
    run(import_job)                                → mutates the DB; populates ImportJob counters
    rollback(import_job)                           → deletes records created by that job
    export_csv(queryset, module)                   → bytes of a CSV ready to ship to the browser
"""

from __future__ import annotations

import csv
import io
from typing import Iterable

from django.utils import timezone

from .. import models

try:
    from openpyxl import load_workbook
    EXCEL_AVAILABLE = True
except Exception:  # pragma: no cover
    EXCEL_AVAILABLE = False


# Importable fields per module. Keep narrow on purpose.
IMPORTABLE_FIELDS = {
    "lead": [
        "name", "email", "phone", "city", "state", "pincode",
        "leads_source", "status", "product_name", "product_category",
        "brand_name", "model_name", "watt_capacity", "base_price",
        "tags", "notes", "score",
    ],
    "deal": ["status", "deal_value", "cost_price", "expected_close_date", "notes"],
    "customer": ["name", "email", "phone", "city", "state", "tags", "notes"],
    "task": ["title", "description", "status", "priority", "due_date"],
}

EXPORTABLE_FIELDS = IMPORTABLE_FIELDS  # mirror for now


# ─── Public API ──────────────────────────────────────────────────


def parse_file(file_obj, filename: str) -> tuple[list[str], list[dict]]:
    """Return (headers, rows). Detects format by extension."""
    name = (filename or "").lower()
    if name.endswith(".xlsx"):
        if not EXCEL_AVAILABLE:
            raise ValueError("Excel support not installed. pip install openpyxl.")
        return _parse_xlsx(file_obj)
    return _parse_csv(file_obj)


def preview(file_obj, filename: str, module: str, mapping: dict) -> dict:
    """Return up to 20 mapped + validated preview rows."""
    headers, rows = parse_file(file_obj, filename)
    sample = rows[:20]

    allowed = set(IMPORTABLE_FIELDS.get(module, []))
    valid_mapping = {csv_col: model_field for csv_col, model_field in (mapping or {}).items()
                     if model_field in allowed}

    mapped = []
    errors = []
    for i, row in enumerate(sample, start=1):
        record = _apply_mapping(row, valid_mapping)
        problems = _validate_record(record, module)
        if problems:
            errors.append({"row": i, "errors": problems})
        mapped.append(record)

    return {
        "headers": headers,
        "total_rows": len(rows),
        "preview": mapped,
        "errors": errors,
        "valid_mapping": valid_mapping,
    }


def run(import_job: "models.ImportJob") -> None:
    """Execute a real import. Updates counters and created_record_ids on the job."""
    if not import_job.file:
        import_job.status = "FAILED"
        import_job.error_log = [{"row": 0, "error": "no file attached"}]
        import_job.save()
        return

    module = import_job.module
    org = import_job.organization
    user = import_job.user
    mapping = import_job.mapping or {}
    options = import_job.options or {}
    dry_run = bool(options.get("dry_run"))

    try:
        headers, rows = parse_file(import_job.file, import_job.original_filename or import_job.file.name)
    except Exception as exc:  # noqa: BLE001
        import_job.status = "FAILED"
        import_job.error_log = [{"row": 0, "error": str(exc)}]
        import_job.completed_at = timezone.now()
        import_job.save()
        return

    allowed = set(IMPORTABLE_FIELDS.get(module, []))
    valid_mapping = {k: v for k, v in mapping.items() if v in allowed}

    import_job.total_rows = len(rows)
    import_job.processed_rows = 0
    import_job.succeeded_rows = 0
    import_job.failed_rows = 0
    import_job.error_log = []
    created_ids: list[int] = []

    import_job.status = "RUNNING"
    import_job.save()

    Model = _model_for(module)
    extra_defaults = _extra_defaults(module, org, user)

    for idx, row in enumerate(rows, start=1):
        record = _apply_mapping(row, valid_mapping)
        record = _coerce_types(record, module)
        problems = _validate_record(record, module)
        import_job.processed_rows = idx

        if problems:
            import_job.failed_rows += 1
            import_job.error_log.append({"row": idx, "errors": problems})
            continue

        if dry_run:
            import_job.succeeded_rows += 1
            continue

        try:
            obj = Model.objects.create(organization=org, **record, **extra_defaults)
            created_ids.append(obj.id)
            import_job.succeeded_rows += 1
        except Exception as exc:  # noqa: BLE001
            import_job.failed_rows += 1
            import_job.error_log.append({"row": idx, "errors": [str(exc)]})

    import_job.created_record_ids = created_ids
    import_job.status = "COMPLETED"
    import_job.completed_at = timezone.now()
    import_job.save()


def rollback(import_job: "models.ImportJob") -> int:
    """Delete records this job created. Returns count deleted."""
    if not import_job.created_record_ids:
        return 0
    Model = _model_for(import_job.module)
    qs = Model.objects.filter(id__in=import_job.created_record_ids)
    if import_job.organization_id:
        qs = qs.filter(organization=import_job.organization)
    count = qs.count()
    qs.delete()
    import_job.status = "ROLLED_BACK"
    import_job.save()
    return count


def export_csv(queryset, module: str) -> bytes:
    """Serialize a queryset to CSV bytes."""
    fields = EXPORTABLE_FIELDS.get(module, [])
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for obj in queryset:
        row = {f: _stringify(getattr(obj, f, "")) for f in fields}
        writer.writerow(row)
    return buf.getvalue().encode("utf-8")


# ─── internals ───────────────────────────────────────────────────


def _parse_csv(file_obj) -> tuple[list[str], list[dict]]:
    text = _read_text(file_obj)
    reader = csv.DictReader(io.StringIO(text))
    rows = [dict(r) for r in reader]
    headers = reader.fieldnames or (list(rows[0].keys()) if rows else [])
    return headers, rows


def _parse_xlsx(file_obj) -> tuple[list[str], list[dict]]:
    wb = load_workbook(file_obj, read_only=True, data_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    try:
        headers = [str(h or "").strip() for h in next(rows_iter)]
    except StopIteration:
        return [], []
    rows = []
    for row in rows_iter:
        if not row or all((c is None or c == "") for c in row):
            continue
        rows.append({headers[i]: _stringify(row[i]) for i in range(min(len(headers), len(row)))})
    return headers, rows


def _read_text(file_obj) -> str:
    data = file_obj.read()
    if isinstance(data, bytes):
        # Tolerate BOM + cp1252 fallback for Windows-Excel CSVs.
        for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
            try:
                return data.decode(enc)
            except UnicodeDecodeError:
                continue
        return data.decode("utf-8", errors="replace")
    return data


def _apply_mapping(row: dict, mapping: dict) -> dict:
    """Translate CSV columns → model fields using the mapping dict."""
    out = {}
    for csv_col, model_field in mapping.items():
        val = row.get(csv_col)
        if val is not None:
            out[model_field] = val
    return out


def _model_for(module: str):
    return {
        "lead": models.Leads,
        "deal": models.Deal,
        "customer": models.Leads,   # customers are leads w/ specific status in this codebase
        "task": models.Task,
    }[module]


def _extra_defaults(module: str, org, user) -> dict:
    # For tasks we need created_by; leads/deals get sensible defaults via the model.
    if module == "task":
        return {"created_by": user} if user else {}
    return {}


def _validate_record(record: dict, module: str) -> list[str]:
    errors = []
    if module == "lead":
        if not record.get("name"):
            errors.append("name is required")
        if not record.get("phone"):
            errors.append("phone is required")
    if module == "deal":
        if not record.get("status"):
            record["status"] = "OPEN"
    if module == "task":
        if not record.get("title"):
            errors.append("title is required")
    return errors


def _coerce_types(record: dict, module: str) -> dict:
    numeric = {"score", "base_price", "deal_value", "cost_price", "watt_capacity"}
    for key in list(record.keys()):
        if key in numeric:
            try:
                record[key] = float(record[key]) if record[key] not in (None, "") else 0
            except (TypeError, ValueError):
                record[key] = 0
    return record


def _stringify(v) -> str:
    if v is None:
        return ""
    return str(v)
