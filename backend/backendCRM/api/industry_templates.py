"""
Industry preset templates.

Each template defines:
  - lead pipeline stages (slug, name, color, is_closed_won/lost)
  - deal pipeline stages
  - custom fields for the lead module (so Real Estate gets BHK/area, Healthcare
    gets patient ID/specialty, etc.)
  - default lead-scoring rules (event → points)

apply_template_to_org(org, slug) overlays a template onto an existing org —
idempotent, won't duplicate stages/fields that already exist by slug.
"""

from django.utils.text import slugify


# ─────────────────────────────────────────────────────────────────
# Template definitions
# ─────────────────────────────────────────────────────────────────

DEFAULT_LEAD_STAGES = [
    ("NEW",            "New",            "#38bdf8", False, False),
    ("CONTACTED",      "Contacted",      "#3b82f6", False, False),
    ("QUALIFIED",      "Qualified",      "#a78bfa", False, False),
    ("PROPOSAL_SENT",  "Proposal Sent",  "#facc15", False, False),
    ("NEGOTIATION",    "Negotiation",    "#f59e0b", False, False),
    ("WON",            "Won",            "#10b981", True,  False),
    ("LOST",           "Lost",           "#ef4444", False, True),
]

DEFAULT_DEAL_STAGES = [
    ("OPEN",       "Open",       "#38bdf8", False, False),
    ("WON",        "Won",        "#10b981", True,  False),
    ("CANCELLED",  "Cancelled",  "#ef4444", False, True),
]

DEFAULT_SCORE_RULES = [
    ("lead_created",         5,   "Base score for new leads"),
    ("status_changed",       3,   "Pipeline movement"),
    ("deal_created",         15,  "Deal opened on this lead"),
    ("deal_won",             40,  "Deal closed-won"),
    ("payment_received",     20,  "Payment recorded"),
    ("document_uploaded",    5,   "KYC/document uploaded"),
    ("task_completed",       3,   "Task completed for lead"),
    ("email_opened",         2,   "Email opened"),
    ("email_replied",        10,  "Email replied"),
    ("meeting_booked",       15,  "Meeting booked"),
    ("quotation_viewed",     8,   "Quotation viewed"),
    ("payment_initiated",    25,  "Payment process initiated"),
    ("inactivity_penalty",   -5,  "30+ days no activity"),
]


INDUSTRY_TEMPLATES = {
    "GENERAL": {
        "name": "General Business",
        "lead_stages": DEFAULT_LEAD_STAGES,
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [],
    },

    "SOLAR": {
        "name": "Solar / Renewables",
        "lead_stages": [
            ("NEW",             "New Inquiry",      "#38bdf8", False, False),
            ("CONTACTED",       "Contacted",        "#3b82f6", False, False),
            ("SITE_VISIT",      "Site Visit",       "#a78bfa", False, False),
            ("QUOTATION_SENT",  "Quotation Sent",   "#facc15", False, False),
            ("NEGOTIATION",     "Negotiation",      "#f59e0b", False, False),
            ("WON",             "Installation",     "#10b981", True,  False),
            ("LOST",            "Lost",             "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("watt_capacity",    "Watt Capacity",   "select", ["3KW", "5KW", "7KW", "10KW", "10KW_PLUS"]),
            ("roof_type",        "Roof Type",       "select", ["Concrete", "Metal", "Tile", "Tin"]),
            ("brand",            "Brand",           "text",   None),
            ("subsidy_eligible", "Subsidy Eligible","checkbox", None),
        ],
    },

    "REAL_ESTATE": {
        "name": "Real Estate",
        "lead_stages": [
            ("NEW",             "New Inquiry",      "#38bdf8", False, False),
            ("CONTACTED",       "Contacted",        "#3b82f6", False, False),
            ("SITE_VISIT",      "Property Visit",   "#a78bfa", False, False),
            ("OFFER_MADE",      "Offer Made",       "#facc15", False, False),
            ("NEGOTIATION",     "Negotiation",      "#f59e0b", False, False),
            ("BOOKED",          "Booked",           "#10b981", True,  False),
            ("LOST",            "Lost",             "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("property_type",    "Property Type",   "select", ["Apartment", "Villa", "Plot", "Commercial", "Warehouse"]),
            ("bhk",              "BHK",             "select", ["1RK", "1BHK", "2BHK", "3BHK", "4BHK+"]),
            ("carpet_area_sqft", "Carpet Area (sqft)", "number", None),
            ("budget_lakhs",     "Budget (₹ lakhs)","number", None),
            ("possession_date",  "Possession Date", "date",   None),
        ],
    },

    "HEALTHCARE": {
        "name": "Healthcare / Clinic",
        "lead_stages": [
            ("INQUIRY",         "Inquiry",          "#38bdf8", False, False),
            ("CONSULTATION",    "Consultation",     "#3b82f6", False, False),
            ("DIAGNOSIS",       "Diagnosis",        "#a78bfa", False, False),
            ("TREATMENT_PLAN",  "Treatment Plan",   "#facc15", False, False),
            ("ADMITTED",        "Under Treatment",  "#f59e0b", False, False),
            ("DISCHARGED",      "Discharged",       "#10b981", True,  False),
            ("DECLINED",        "Declined",         "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("patient_id",       "Patient ID",      "text",   None),
            ("age",              "Age",             "number", None),
            ("specialty",        "Specialty",       "select", ["General", "Cardiology", "Orthopedics", "Pediatrics", "Dental", "ENT", "Dermatology"]),
            ("insurance_provider","Insurance",      "text",   None),
            ("emergency",        "Emergency",       "checkbox", None),
        ],
    },

    "INSURANCE": {
        "name": "Insurance",
        "lead_stages": [
            ("NEW",             "New Lead",         "#38bdf8", False, False),
            ("CONTACTED",       "Contacted",        "#3b82f6", False, False),
            ("NEEDS_ANALYSIS",  "Needs Analysis",   "#a78bfa", False, False),
            ("QUOTE_SENT",      "Quote Sent",       "#facc15", False, False),
            ("UNDERWRITING",    "Underwriting",     "#f59e0b", False, False),
            ("POLICY_ISSUED",   "Policy Issued",    "#10b981", True,  False),
            ("LOST",            "Lost",             "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("policy_type",      "Policy Type",     "select", ["Life", "Health", "Vehicle", "Term", "Travel", "Property"]),
            ("sum_assured",      "Sum Assured (₹)", "number", None),
            ("premium",          "Annual Premium",  "number", None),
            ("renewal_date",     "Renewal Date",    "date",   None),
            ("nominee",          "Nominee Name",    "text",   None),
        ],
    },

    "LOGISTICS": {
        "name": "Logistics / Transport",
        "lead_stages": [
            ("NEW",             "New Inquiry",      "#38bdf8", False, False),
            ("QUOTE_REQUESTED", "Quote Requested",  "#3b82f6", False, False),
            ("QUOTE_SENT",      "Quote Sent",       "#facc15", False, False),
            ("BOOKED",          "Booked",           "#a78bfa", False, False),
            ("IN_TRANSIT",      "In Transit",       "#f59e0b", False, False),
            ("DELIVERED",       "Delivered",        "#10b981", True,  False),
            ("CANCELLED",       "Cancelled",        "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("origin_city",      "Origin",          "text",   None),
            ("destination_city", "Destination",     "text",   None),
            ("weight_kg",        "Weight (kg)",     "number", None),
            ("cargo_type",       "Cargo Type",      "select", ["Documents", "Parcel", "FTL", "LTL", "Container", "Fragile"]),
            ("pickup_date",      "Pickup Date",     "date",   None),
        ],
    },

    "EDUCATION": {
        "name": "Education / Coaching",
        "lead_stages": [
            ("INQUIRY",         "Inquiry",          "#38bdf8", False, False),
            ("COUNSELLING",     "Counselling",      "#3b82f6", False, False),
            ("DEMO_BOOKED",     "Demo Booked",      "#a78bfa", False, False),
            ("DEMO_ATTENDED",   "Demo Attended",    "#facc15", False, False),
            ("FEE_QUOTED",      "Fee Quoted",       "#f59e0b", False, False),
            ("ENROLLED",        "Enrolled",         "#10b981", True,  False),
            ("LOST",            "Lost",             "#ef4444", False, True),
        ],
        "deal_stages": DEFAULT_DEAL_STAGES,
        "custom_fields": [
            ("course",           "Course",          "text",   None),
            ("batch",            "Preferred Batch", "select", ["Morning", "Afternoon", "Evening", "Weekend", "Online"]),
            ("student_age",      "Student Age",     "number", None),
            ("class_grade",      "Class / Grade",   "text",   None),
            ("parent_name",      "Parent Name",     "text",   None),
        ],
    },
}


# ─────────────────────────────────────────────────────────────────
# Application logic
# ─────────────────────────────────────────────────────────────────

def apply_template_to_org(org, template_slug, replace_pipelines=False):
    """
    Idempotently apply a template's stages + fields + scoring rules to an org.

    `replace_pipelines=False` (default) — only adds missing stages by slug; existing stages are untouched.
    `replace_pipelines=True` — drops existing default pipelines and recreates from template.

    Returns dict {pipelines_touched, stages_added, fields_added, rules_added}.
    """
    from .models import Pipeline, PipelineStage, CustomField, LeadScoreRule

    template = INDUSTRY_TEMPLATES.get(template_slug.upper())
    if not template:
        raise ValueError(f"Unknown template: {template_slug}")

    summary = {"pipelines_touched": 0, "stages_added": 0, "fields_added": 0, "rules_added": 0}

    # ── Pipelines + stages ───────────────────────────────────────
    for module, stages in (("lead", template["lead_stages"]), ("deal", template["deal_stages"])):
        pipeline, created = Pipeline.objects.get_or_create(
            organization=org, module=module, name="Default",
            defaults={"is_default": True},
        )
        summary["pipelines_touched"] += 1

        if replace_pipelines and not created:
            pipeline.stages.all().delete()

        for order, (slug, name, color, won, lost) in enumerate(stages):
            _, stage_created = PipelineStage.objects.get_or_create(
                pipeline=pipeline, slug=slug,
                defaults={
                    "name": name, "color": color, "order": order,
                    "is_closed_won": won, "is_closed_lost": lost,
                },
            )
            if stage_created:
                summary["stages_added"] += 1

    # ── Custom fields ────────────────────────────────────────────
    for position, field_def in enumerate(template.get("custom_fields", [])):
        slug, name, field_type, choices = field_def
        _, created = CustomField.objects.get_or_create(
            organization=org, module="lead", slug=slug,
            defaults={
                "name": name,
                "field_type": field_type,
                "choices": choices or [],
                "position": position,
                "is_active": True,
            },
        )
        if created:
            summary["fields_added"] += 1

    # ── Default scoring rules ────────────────────────────────────
    for event, points, description in DEFAULT_SCORE_RULES:
        _, created = LeadScoreRule.objects.get_or_create(
            organization=org, event=event,
            defaults={
                "points": points,
                "description": description,
                "is_active": True,
            },
        )
        if created:
            summary["rules_added"] += 1

    return summary
