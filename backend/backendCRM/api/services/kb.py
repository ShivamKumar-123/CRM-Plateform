"""Knowledge base helpers — search + view tracking."""

from __future__ import annotations

from django.db.models import F, Q


def search_articles(org, query: str, public_only: bool = False):
    from ..models import KbArticle
    qs = KbArticle.objects.filter(organization=org, status="PUBLISHED")
    if public_only:
        qs = qs.filter(is_public=True)
    if query:
        qs = qs.filter(
            Q(title__icontains=query) |
            Q(body__icontains=query) |
            Q(tags__icontains=query) |
            Q(excerpt__icontains=query)
        )
    return qs.select_related("category").order_by("-is_featured", "-updated_at")


def track_view(article) -> None:
    from ..models import KbArticle
    KbArticle.objects.filter(pk=article.pk).update(view_count=F("view_count") + 1)


def vote(article, helpful: bool) -> None:
    from ..models import KbArticle
    field = "helpful_count" if helpful else "not_helpful_count"
    KbArticle.objects.filter(pk=article.pk).update(**{field: F(field) + 1})


def related_articles(article, limit: int = 5):
    """Articles sharing tags + same category. Excludes the article itself."""
    from ..models import KbArticle
    tags = [t.strip() for t in (article.tags or "").split(",") if t.strip()]
    qs = KbArticle.objects.filter(
        organization=article.organization, status="PUBLISHED",
    ).exclude(pk=article.pk)

    if article.category_id:
        qs = qs.filter(category_id=article.category_id)
    if tags:
        tag_q = Q()
        for t in tags:
            tag_q |= Q(tags__icontains=t)
        qs = qs.filter(tag_q)
    return qs.order_by("-view_count")[:limit]
