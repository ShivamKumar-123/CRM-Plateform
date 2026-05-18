"""
Tenant scoping helpers.

Every API view that operates on tenant-scoped data (Leads, Deal, Task, Payment,
Document, Pipeline, Territory, organization-scoped Users) MUST use these helpers
to filter querysets and to attach `organization` to newly-created records.

Rules:
    - Platform super-admins (User.is_superuser=True) can either:
        a) Pass `?org=<slug>` (or `?org_id=<id>`) on the request → scope to that org
        b) Omit it → see across ALL organizations
    - Regular users are ALWAYS scoped to their own user.organization. Any attempt
      to override is ignored.
    - Tenant FK is denormalised onto each top-level model (Leads, Deal, Task)
      so filtering is one indexed FK lookup. Child models (Payment, Document,
      TaskMessage) traverse the parent FK.
"""

from django.shortcuts import get_object_or_404
from .models import Organization


def get_request_org(request, allow_cross_tenant=True):
    """
    Resolve the Organization the request is targeting.

    Returns Organization | None.
    None means: super-admin asked to see everything (no scoping).

    Raises 404 if a super-admin asks for a specific org that doesn't exist.
    """
    user = request.user
    if not user.is_authenticated:
        return None

    if not user.is_superuser:
        return user.organization  # may be None if mis-configured; views must guard

    if not allow_cross_tenant:
        return user.organization

    slug = request.query_params.get("org") if hasattr(request, "query_params") else request.GET.get("org")
    org_id = (request.query_params.get("org_id") if hasattr(request, "query_params")
              else request.GET.get("org_id"))

    if slug:
        return get_object_or_404(Organization, slug=slug)
    if org_id:
        return get_object_or_404(Organization, id=org_id)

    return None  # cross-tenant view (super-admin without filter)


def scope_qs(qs, request, *, field="organization"):
    """
    Apply tenant filter to a queryset.

    - Super-admin without ?org param: returns qs unchanged.
    - Super-admin with ?org=slug: filters to that org.
    - Regular user: filters to user's org. If user has no org, returns qs.none().
    """
    user = request.user
    if user.is_superuser:
        org = get_request_org(request, allow_cross_tenant=True)
        if org is None:
            return qs
        return qs.filter(**{field: org})

    if not user.organization_id:
        return qs.none()

    return qs.filter(**{field: user.organization_id})


def require_org(request):
    """
    For mutating endpoints — pick the org to write to.

    Regular user → their own org.
    Super-admin → ?org= param required (otherwise we wouldn't know where to put it).
    """
    user = request.user
    if user.is_superuser:
        org = get_request_org(request, allow_cross_tenant=True)
        if org is None:
            return None  # caller should error out
        return org
    return user.organization
