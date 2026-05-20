"""Advanced business analytics — forecasting, cohorts, churn, funnel.

All metrics are computed live against the org's data. No background jobs.

Public entry points return dicts ready for the frontend Recharts pages.
"""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Count, Sum, Q, F, DecimalField, Value
from django.db.models.functions import Coalesce, TruncMonth, TruncWeek


def revenue_forecast(org, months: int = 12) -> dict:
    """Linear-regression forecast on monthly closed-won revenue."""
    from ..models import Deal
    from django.utils import timezone

    start = timezone.now() - timedelta(days=365 * 2)
    rows = (
        Deal.objects.filter(organization=org, status="WON", updated_at__gte=start)
        .annotate(m=TruncMonth("updated_at"))
        .values("m")
        .annotate(total=Coalesce(Sum("deal_value"), Value(0), output_field=DecimalField()))
        .order_by("m")
    )
    history = [{"month": r["m"].strftime("%b %Y"), "revenue": float(r["total"])} for r in rows]
    if len(history) < 2:
        return {"history": history, "forecast": []}

    # Simple least-squares slope/intercept.
    xs = list(range(len(history)))
    ys = [h["revenue"] for h in history]
    n = len(xs)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    num = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    den = sum((x - mean_x) ** 2 for x in xs) or 1
    slope = num / den
    intercept = mean_y - slope * mean_x

    forecast = []
    last_idx = len(history) - 1
    for i in range(1, months + 1):
        x = last_idx + i
        predicted = max(0.0, slope * x + intercept)
        forecast.append({"month_offset": i, "predicted_revenue": round(predicted)})

    return {"history": history, "forecast": forecast, "slope": slope, "intercept": intercept}


def churn_metrics(org) -> dict:
    """Coarse churn signal — leads that haven't been touched in 30+ days."""
    from ..models import Leads
    from django.utils import timezone

    total = Leads.objects.filter(organization=org).count()
    stale_cutoff = timezone.now() - timedelta(days=30)
    stale = Leads.objects.filter(
        organization=org,
    ).filter(
        Q(last_activity_at__lt=stale_cutoff) | Q(last_activity_at__isnull=True),
    ).exclude(status__in=["WON", "LOST", "CANCELLED"]).count()
    active = total - stale
    churn_rate = (stale / total * 100) if total else 0
    return {
        "total": total,
        "active": active,
        "stale": stale,
        "churn_rate_pct": round(churn_rate, 1),
    }


def cohort_analysis(org, weeks: int = 8) -> list[dict]:
    """Group leads by created-week, then count how many won/lost within N weeks."""
    from ..models import Leads, Deal
    from django.utils import timezone

    start = timezone.now() - timedelta(weeks=weeks)
    cohorts = (
        Leads.objects.filter(organization=org, created_at__gte=start)
        .annotate(week=TruncWeek("created_at"))
        .values("week")
        .annotate(cohort_size=Count("id"))
        .order_by("week")
    )

    out = []
    for c in cohorts:
        won = Deal.objects.filter(
            organization=org, status="WON",
            created_at__gte=c["week"], created_at__lt=c["week"] + timedelta(weeks=weeks),
        ).count()
        out.append({
            "cohort": c["week"].strftime("%b %d"),
            "size": c["cohort_size"],
            "won_within_window": won,
            "conversion_pct": round((won / c["cohort_size"] * 100) if c["cohort_size"] else 0, 1),
        })
    return out


def funnel_intelligence(org) -> list[dict]:
    """Conversion percentage at each pipeline stage."""
    from ..models import Leads

    qs = Leads.objects.filter(organization=org)
    by_status = (
        qs.values("status")
        .annotate(count=Count("id"))
        .order_by("-count")
    )
    total = qs.count()
    out = []
    for row in by_status:
        out.append({
            "stage": row["status"],
            "count": row["count"],
            "percentage": round((row["count"] / total * 100) if total else 0, 1),
        })
    return out


def executive_summary(org) -> dict:
    """One-shot KPI bundle for an executive dashboard."""
    from ..models import Leads, Deal, Payment
    from django.utils import timezone

    now = timezone.now()
    last_30 = now - timedelta(days=30)
    prev_30 = now - timedelta(days=60)

    new_leads_30 = Leads.objects.filter(organization=org, created_at__gte=last_30).count()
    new_leads_prev = Leads.objects.filter(organization=org, created_at__gte=prev_30, created_at__lt=last_30).count()

    won_30 = Deal.objects.filter(organization=org, status="WON", updated_at__gte=last_30)
    won_revenue = won_30.aggregate(s=Coalesce(Sum("deal_value"), Value(0), output_field=DecimalField()))["s"]
    won_prev = Deal.objects.filter(organization=org, status="WON",
                                    updated_at__gte=prev_30, updated_at__lt=last_30
    ).aggregate(s=Coalesce(Sum("deal_value"), Value(0), output_field=DecimalField()))["s"]

    payments_30 = Payment.objects.filter(
        deal__organization=org, created_at__gte=last_30,
    ).aggregate(s=Coalesce(Sum("amount_paid"), Value(0), output_field=DecimalField()))["s"]

    def _delta(curr, prev):
        if prev == 0:
            return None
        return round((float(curr - prev) / float(prev)) * 100, 1)

    return {
        "period_days": 30,
        "new_leads": new_leads_30,
        "new_leads_delta_pct": _delta(new_leads_30, new_leads_prev),
        "won_revenue": float(won_revenue),
        "won_revenue_delta_pct": _delta(won_revenue, won_prev),
        "payments_collected": float(payments_30),
        "churn": churn_metrics(org),
    }
