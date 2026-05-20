"""AI provider abstraction — OpenAI + Anthropic.

Reads `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` from settings. Falls back to a
deterministic stub when neither is set so the UI flows in dev.

Every call logs to `AIRequest` for usage tracking.

Public:
    summarize_lead(lead, user, org)
    suggest_followup(lead, user, org)
    predict_deal_risk(deal, user, org)
    draft_email(context, user, org)
    summarize_meeting(transcript, user, org)
    chat(messages, user, org)
"""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def _has_openai() -> bool:
    return bool(getattr(settings, "OPENAI_API_KEY", "") or "")


def _has_anthropic() -> bool:
    return bool(getattr(settings, "ANTHROPIC_API_KEY", "") or "")


def _preferred_provider() -> str:
    pref = (getattr(settings, "AI_PROVIDER", "") or "").lower()
    if pref in ("openai", "anthropic"):
        return pref
    if _has_anthropic():
        return "anthropic"
    if _has_openai():
        return "openai"
    return "stub"


def _call_openai(prompt: str, system: str = "") -> tuple[str, int]:
    """Hit OpenAI Chat Completions. Returns (text, tokens)."""
    import requests
    key = settings.OPENAI_API_KEY
    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    body = {
        "model": model,
        "messages": [m for m in [
            {"role": "system", "content": system} if system else None,
            {"role": "user", "content": prompt},
        ] if m],
        "temperature": 0.3,
        "max_tokens": 700,
    }
    r = requests.post(
        "https://api.openai.com/v1/chat/completions",
        json=body,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    text = (data.get("choices", [{}])[0].get("message") or {}).get("content", "")
    tokens = (data.get("usage") or {}).get("total_tokens", 0)
    return text, tokens


def _call_anthropic(prompt: str, system: str = "") -> tuple[str, int]:
    import requests
    key = settings.ANTHROPIC_API_KEY
    model = getattr(settings, "ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
    body = {
        "model": model,
        "max_tokens": 700,
        "system": system or "You are a helpful CRM assistant.",
        "messages": [{"role": "user", "content": prompt}],
    }
    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        json=body,
        headers={
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    text_parts = data.get("content", [])
    text = " ".join(p.get("text", "") for p in text_parts)
    tokens = (data.get("usage") or {}).get("input_tokens", 0) + (data.get("usage") or {}).get("output_tokens", 0)
    return text, tokens


def _generate(prompt: str, system: str = "") -> tuple[str, int, str, str]:
    """Returns (response, tokens, provider, model_label)."""
    provider = _preferred_provider()
    try:
        if provider == "openai":
            text, tokens = _call_openai(prompt, system)
            return text, tokens, "openai", getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
        if provider == "anthropic":
            text, tokens = _call_anthropic(prompt, system)
            return text, tokens, "anthropic", getattr(settings, "ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
    except Exception as exc:  # noqa: BLE001
        logger.warning("AI call failed: %s", exc)
        return f"[AI provider error: {exc}]", 0, provider, ""

    # Stub fallback.
    stub = _stub_response(prompt)
    return stub, 0, "stub", ""


def _stub_response(prompt: str) -> str:
    return (
        "(AI stub mode — no provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.)\n\n"
        f"Echo of context: {prompt[:200]}…"
    )


def _log(kind: str, user, org, prompt: str, response: str, tokens: int,
         provider: str, model_label: str, context: dict, error: str = ""):
    from ..models import AIRequest
    return AIRequest.objects.create(
        organization=org,
        user=user,
        kind=kind,
        provider=provider,
        model=model_label,
        prompt=prompt[:8000],
        response=response[:8000],
        context=context,
        tokens_used=tokens,
        success=not bool(error),
        error_message=error,
    )


# ─── Public prompt builders ──────────────────────────────────────


def summarize_lead(lead, user=None, org=None) -> dict:
    org = org or getattr(lead, "organization", None)
    prompt = (
        f"Summarize this CRM lead in 3 bullets focused on: who they are, their interest, and the recommended next step.\n\n"
        f"Name: {lead.name}\nCompany: {getattr(lead, 'company_name', '') or '—'}\n"
        f"Stage: {lead.status} · Score: {lead.score} ({lead.priority})\n"
        f"Source: {lead.leads_source}\n"
        f"Product interest: {lead.product_name or '—'} · {lead.product_category or '—'}\n"
        f"Notes: {(lead.notes or '')[:600]}\n"
        f"Tags: {lead.tags or '—'}\n"
    )
    text, tokens, provider, model_label = _generate(prompt, system="You are a senior CRM analyst.")
    _log("LEAD_SUMMARY", user, org, prompt, text, tokens, provider, model_label, {"lead_id": lead.id})
    return {"summary": text, "tokens": tokens, "provider": provider}


def suggest_followup(lead, user=None, org=None) -> dict:
    org = org or getattr(lead, "organization", None)
    prompt = (
        f"Draft a short, friendly follow-up message (under 80 words) for this lead. "
        f"Use the lead's stage and notes for personalization.\n\n"
        f"Name: {lead.name}\nStage: {lead.status}\nProduct interest: {lead.product_name or '—'}\n"
        f"Last note: {(lead.notes or '')[:400]}"
    )
    text, tokens, provider, model_label = _generate(prompt)
    _log("FOLLOW_UP", user, org, prompt, text, tokens, provider, model_label, {"lead_id": lead.id})
    return {"followup": text, "tokens": tokens, "provider": provider}


def predict_deal_risk(deal, user=None, org=None) -> dict:
    org = org or getattr(deal, "organization", None)
    prompt = (
        f"Assess the likelihood that this deal will close, on a 0-100 scale. "
        f"Return a single integer on the first line, then 2 bullets explaining your reasoning.\n\n"
        f"Status: {deal.status}\nValue: ₹{deal.deal_value}\nCost: ₹{deal.cost_price}\n"
        f"Expected close: {deal.expected_close_date}\nNotes: {(deal.notes or '')[:400]}"
    )
    text, tokens, provider, model_label = _generate(prompt, system="You are a risk-aware sales coach.")
    # Try to parse the first line as a confidence number.
    confidence = 50
    try:
        first = text.strip().split("\n")[0]
        confidence = int("".join(c for c in first if c.isdigit())[:3])
    except Exception:  # noqa: BLE001
        pass
    _log("DEAL_RISK", user, org, prompt, text, tokens, provider, model_label, {"deal_id": deal.id, "confidence": confidence})
    return {"confidence": confidence, "reasoning": text, "tokens": tokens, "provider": provider}


def draft_email(context: dict, user=None, org=None) -> dict:
    prompt = (
        f"Draft a professional email for a CRM follow-up.\n\n"
        f"To: {context.get('to', '')}\nSubject hint: {context.get('subject', '')}\n"
        f"Context: {context.get('context', '')}\n"
        f"Tone: {context.get('tone', 'professional and warm')}"
    )
    text, tokens, provider, model_label = _generate(prompt)
    _log("EMAIL_DRAFT", user, org, prompt, text, tokens, provider, model_label, context)
    return {"email": text, "tokens": tokens, "provider": provider}


def summarize_meeting(transcript: str, user=None, org=None) -> dict:
    prompt = (
        "Summarize this sales meeting in 3 sections: Key points · Action items · Risks.\n\n"
        f"Transcript:\n{transcript[:6000]}"
    )
    text, tokens, provider, model_label = _generate(prompt, system="You are an executive assistant.")
    _log("MEETING_SUMMARY", user, org, prompt, text, tokens, provider, model_label, {})
    return {"summary": text, "tokens": tokens, "provider": provider}


def chat(messages: list[dict], user=None, org=None) -> dict:
    """Free-form chat. `messages` is a list of {role, content} pairs;
    only the last user message is sent through the prompt builder."""
    last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    text, tokens, provider, model_label = _generate(
        last_user,
        system="You are a CRM assistant. Be concise and actionable.",
    )
    _log("CHATBOT", user, org, last_user, text, tokens, provider, model_label, {"history_length": len(messages)})
    return {"reply": text, "tokens": tokens, "provider": provider}
