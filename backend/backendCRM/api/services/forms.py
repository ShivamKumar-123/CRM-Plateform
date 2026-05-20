"""Form-builder runtime — public submission handler."""

from __future__ import annotations


def submit(form, data: dict, *, ip: str = "", ua: str = "", referrer: str = ""):
    """Validate + persist a submission. Creates a Lead when `form.create_lead` is True.

    Returns the FormSubmission row.
    """
    from ..models import FormSubmission, Leads

    cleaned = {}
    errors = {}

    for field in form.fields.all():
        value = (data.get(field.field_key) or "").strip() if isinstance(data.get(field.field_key), str) else data.get(field.field_key)
        if field.is_required and not value:
            errors[field.field_key] = f"{field.label} is required."
        cleaned[field.field_key] = value

    if errors:
        from django.core.exceptions import ValidationError
        raise ValidationError(errors)

    submission = FormSubmission.objects.create(
        form=form,
        organization=form.organization,
        data=cleaned,
        referrer=referrer,
        ip_address=ip or None,
        user_agent=ua or "",
    )

    # Auto-create lead.
    lead = None
    if form.create_lead and form.organization_id:
        lead_data = _to_lead_payload(form, cleaned)
        if lead_data.get("name") and lead_data.get("phone"):
            lead = Leads.objects.create(
                organization=form.organization,
                leads_source="WEBSITE",
                **lead_data,
            )
            submission.lead = lead
            submission.save(update_fields=["lead"])

    # Bump submission count.
    from django.db.models import F
    form.__class__.objects.filter(pk=form.pk).update(
        submission_count=F("submission_count") + 1,
    )

    # Notify configured user / email.
    if form.notify_user_id:
        from ..models import Notification
        Notification.objects.create(
            user=form.notify_user,
            organization=form.organization,
            type="form_submission",
            title=f"New form submission: {form.name}",
            body=str(cleaned)[:200],
            link=f"/admin/forms",
        )

    return submission


def _to_lead_payload(form, cleaned: dict) -> dict:
    """Map form fields → Lead fields using FormField.maps_to overrides + sensible defaults."""
    out = {}
    for field in form.fields.all():
        if not field.maps_to:
            # Sensible defaults.
            if field.field_type == "email" and not out.get("email"):
                out["email"] = cleaned.get(field.field_key, "")
                continue
            if field.field_type == "phone" and not out.get("phone"):
                out["phone"] = cleaned.get(field.field_key, "")
                continue
            if field.field_key in ("name", "full_name") and not out.get("name"):
                out["name"] = cleaned.get(field.field_key, "")
                continue
            continue
        out[field.maps_to] = cleaned.get(field.field_key, "")

    # Tag with form name so the team knows where the lead came from.
    notes = out.get("notes", "")
    out["notes"] = (notes + f"\nForm: {form.name}").strip()
    return out
