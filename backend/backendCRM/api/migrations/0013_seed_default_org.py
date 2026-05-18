from django.db import migrations


# Default pipeline for a new organization — used to seed both lead & deal pipelines.
DEFAULT_LEAD_STAGES = [
    ("NEW",            "New",            "#38bdf8", 0,  False, False),
    ("CONTACTED",      "Contacted",      "#3b82f6", 1,  False, False),
    ("QUALIFIED",      "Qualified",      "#a78bfa", 2,  False, False),
    ("PROPOSAL_SENT",  "Proposal Sent",  "#facc15", 3,  False, False),
    ("NEGOTIATION",    "Negotiation",    "#f59e0b", 4,  False, False),
    ("WON",            "Won",            "#10b981", 5,  True,  False),
    ("LOST",           "Lost",           "#ef4444", 6,  False, True),
]

DEFAULT_DEAL_STAGES = [
    ("OPEN",       "Open",       "#38bdf8", 0, False, False),
    ("WON",        "Won",        "#10b981", 1, True,  False),
    ("CANCELLED",  "Cancelled",  "#ef4444", 2, False, True),
]


def _create_default_pipelines(Pipeline, PipelineStage, org):
    """Idempotent: creates 'Default' lead + deal pipelines with stages."""
    for module, stages in (("lead", DEFAULT_LEAD_STAGES), ("deal", DEFAULT_DEAL_STAGES)):
        pipeline, _ = Pipeline.objects.get_or_create(
            organization=org, module=module, name="Default",
            defaults={"is_default": True},
        )
        for slug, name, color, order, won, lost in stages:
            PipelineStage.objects.get_or_create(
                pipeline=pipeline, slug=slug,
                defaults={
                    "name": name, "color": color, "order": order,
                    "is_closed_won": won, "is_closed_lost": lost,
                },
            )


def backfill_default_org(apps, schema_editor):
    Organization  = apps.get_model("api", "Organization")
    User          = apps.get_model("api", "User")
    Leads         = apps.get_model("api", "Leads")
    Deal          = apps.get_model("api", "Deal")
    Task          = apps.get_model("api", "Task")
    Teritories    = apps.get_model("api", "Teritories")
    Pipeline      = apps.get_model("api", "Pipeline")
    PipelineStage = apps.get_model("api", "PipelineStage")

    # Create default org if missing
    default_org, _ = Organization.objects.get_or_create(
        slug="default",
        defaults={
            "name": "Default Organization",
            "industry": "SOLAR",  # the existing data is solar — preserve that context
            "plan": "ENTERPRISE",
            "status": "ACTIVE",
            "max_users": 9999,
            "max_leads": 999999,
            "max_storage_mb": 99999,
        },
    )

    # Pick an owner — first superuser if available
    if not default_org.owner_id:
        admin = User.objects.filter(is_superuser=True).order_by("id").first()
        if admin:
            default_org.owner = admin
            default_org.save(update_fields=["owner"])

    # Backfill: any user/lead/deal/task/territory without an org → default
    User.objects.filter(organization__isnull=True, is_superuser=False).update(organization=default_org)
    # superusers stay org-less so they can span tenants
    Leads.objects.filter(organization__isnull=True).update(organization=default_org)
    Deal.objects.filter(organization__isnull=True).update(organization=default_org)
    Task.objects.filter(organization__isnull=True).update(organization=default_org)
    Teritories.objects.filter(organization__isnull=True).update(organization=default_org)

    # Default pipelines for the default org
    _create_default_pipelines(Pipeline, PipelineStage, default_org)

    # Attach leads/deals to their org's default pipeline if not set
    lead_pipe = Pipeline.objects.filter(organization=default_org, module="lead", is_default=True).first()
    deal_pipe = Pipeline.objects.filter(organization=default_org, module="deal", is_default=True).first()
    if lead_pipe:
        Leads.objects.filter(organization=default_org, pipeline__isnull=True).update(pipeline=lead_pipe)
    if deal_pipe:
        Deal.objects.filter(organization=default_org, pipeline__isnull=True).update(pipeline=deal_pipe)


def noop_reverse(apps, schema_editor):
    """Reverse is a no-op — we won't delete the seeded data on rollback."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_organization_pipeline_pipelinestage_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_default_org, noop_reverse),
    ]
