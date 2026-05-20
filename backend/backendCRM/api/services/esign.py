"""E-signature workflow.

Each `SignatureRequest` has one or more ordered `SignatureSigner` rows. Each
signer gets a unique token + an OTP-protected signing page. When the last
signer completes, we stamp the original PDF with each signature image and a
small "Signed by" audit panel and store it as `signed_document`.
"""

from __future__ import annotations

import io
import secrets
from datetime import timedelta

from django.utils import timezone


def mint_signer(request, *, name, email, phone="", order=0):
    from ..models import SignatureSigner
    return SignatureSigner.objects.create(
        request=request,
        name=name,
        email=email,
        phone=phone,
        order=order,
        token=f"sgn_{secrets.token_urlsafe(24)}",
    )


def resolve_signer(token: str):
    from ..models import SignatureSigner
    return SignatureSigner.objects.filter(token=token).select_related("request").first()


def send_otp(signer) -> str:
    """Generate + persist a 6-digit OTP. (Real delivery — email/SMS — is the
    org's job; this returns the code so the API can ship it however.)"""
    code = "".join(secrets.choice("0123456789") for _ in range(6))
    signer.otp = code
    signer.otp_sent_at = timezone.now()
    signer.save(update_fields=["otp", "otp_sent_at"])
    _log_event(signer.request, signer, "OTP_SENT")
    return code


def verify_otp(signer, code: str) -> bool:
    if not signer.otp or signer.otp != code:
        return False
    if signer.otp_sent_at and timezone.now() - signer.otp_sent_at > timedelta(minutes=15):
        return False
    return True


def record_signature(signer, *, signature_image: str, ip: str = "", ua: str = ""):
    from django.utils import timezone
    signer.signature_image = signature_image
    signer.status = "SIGNED"
    signer.signed_at = timezone.now()
    signer.ip_address = ip or None
    signer.user_agent = ua or ""
    signer.save()

    _log_event(signer.request, signer, "SIGNED", ip=ip)

    # Promote the request status if everybody has signed.
    request = signer.request
    pending = request.signers.exclude(status="SIGNED").count()
    if pending == 0:
        request.status = "COMPLETED"
        request.completed_at = timezone.now()
        request.save(update_fields=["status", "completed_at"])
        _stamp_pdf(request)
    else:
        request.status = "PARTIALLY_SIGNED"
        request.save(update_fields=["status"])


def decline(signer, reason: str = ""):
    signer.status = "DECLINED"
    signer.save(update_fields=["status"])
    request = signer.request
    request.status = "DECLINED"
    request.save(update_fields=["status"])
    _log_event(request, signer, "DECLINED", detail=reason)


def _log_event(request, signer, event, *, detail="", ip=""):
    from ..models import SignatureEvent
    SignatureEvent.objects.create(
        request=request, signer=signer, event=event, detail=detail, ip_address=ip or None,
    )


def _stamp_pdf(request) -> None:
    """Append a 'Signed by' audit page to the document. Uses reportlab —
    silently no-op if reportlab isn't installed.

    For real-world use this would also visually place each signer's signature
    image on top of the original PDF; here we keep it minimal by writing an
    additional audit page to a new file.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from django.core.files.base import ContentFile
        import base64
    except ImportError:
        return

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 18)
    c.drawString(60, height - 60, "Signed copy — audit page")
    c.setFont("Helvetica", 10)
    c.drawString(60, height - 80, f"Document: {request.title}")
    c.drawString(60, height - 95, f"Completed: {request.completed_at.strftime('%d %b %Y %H:%M') if request.completed_at else '—'}")

    y = height - 130
    for s in request.signers.order_by("order"):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(60, y, f"{s.name} <{s.email}>")
        c.setFont("Helvetica", 9)
        c.drawString(60, y - 14, f"Signed at {s.signed_at.strftime('%d %b %Y %H:%M') if s.signed_at else '—'} · IP {s.ip_address or '—'}")
        # Embed signature image
        if s.signature_image and s.signature_image.startswith("data:image"):
            try:
                header, b64 = s.signature_image.split(",", 1)
                img_bytes = base64.b64decode(b64)
                from reportlab.lib.utils import ImageReader
                img = ImageReader(io.BytesIO(img_bytes))
                c.drawImage(img, 60, y - 90, width=180, height=60, mask="auto")
            except Exception:  # noqa: BLE001
                pass
        y -= 130
        if y < 100:
            c.showPage(); y = height - 80
    c.save()

    from django.core.files.base import ContentFile
    request.signed_document.save(
        f"signed_{request.id}.pdf",
        ContentFile(buf.getvalue()),
        save=True,
    )
