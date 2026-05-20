from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.utils.text import slugify


# ─────────────────────────────────────────────────────────────────
# Organization (multi-tenant root)
# ─────────────────────────────────────────────────────────────────

class Organization(models.Model):
    """
    A tenant. Every Lead / Deal / Task / Pipeline belongs to one Organization.
    Super-platform admins (User.is_superuser=True) can span organizations.
    """

    INDUSTRY_CHOICES = [
        ("GENERAL", "General"),
        ("SOLAR", "Solar / Renewable Energy"),
        ("REAL_ESTATE", "Real Estate"),
        ("HEALTHCARE", "Healthcare"),
        ("EDUCATION", "Education"),
        ("LOGISTICS", "Logistics"),
        ("ECOMMERCE", "E-commerce"),
        ("MANUFACTURING", "Manufacturing"),
        ("AGENCY", "Agency / Marketing"),
        ("FINANCE", "Finance"),
        ("INSURANCE", "Insurance"),
        ("B2B_SALES", "B2B Sales"),
        ("SERVICES", "Service Business"),
        ("OTHER", "Other"),
    ]

    PLAN_CHOICES = [
        ("FREE", "Free"),
        ("PRO", "Pro"),
        ("ENTERPRISE", "Enterprise"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("SUSPENDED", "Suspended"),
        ("TRIAL", "Trial"),
        ("CANCELLED", "Cancelled"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    industry = models.CharField(max_length=30, choices=INDUSTRY_CHOICES, default="GENERAL")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="FREE")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    owner = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        related_name="owned_organizations",
        null=True,
        blank=True,
    )

    # Branding
    logo = models.ImageField(upload_to="org_logos/", null=True, blank=True)
    primary_color = models.CharField(max_length=20, default="#facc15")
    accent_color = models.CharField(max_length=20, default="#38bdf8")

    # Quotas (enforced softly at view level)
    max_users = models.PositiveIntegerField(default=5)
    max_leads = models.PositiveIntegerField(default=500)
    max_storage_mb = models.PositiveIntegerField(default=500)

    # Contact
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    trial_ends_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["plan"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or "org"
            slug = base
            i = 2
            while Organization.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────────────────────────
# Custom User
# ─────────────────────────────────────────────────────────────────

class User(AbstractUser):

    ROLE_CHOICES = [
        ("OWNER", "Organization Owner"),
        ("ADMIN", "Admin"),
        ("MANAGER", "Manager"),
        ("TEAM_LEAD", "Team Lead"),
        ("SALES", "Sales Agent"),
        ("SUPPORT", "Support Agent"),
        ("EMPLOYEE", "Employee"),
        ("VIEWER", "Viewer"),
        # legacy values kept for backwards compatibility
        ("DEALER", "Dealer"),
        ("CHANNEL PARTNER", "Channel Partner"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    # Tenant — null only for platform super-admins.
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default="SALES")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    territory = models.ForeignKey(
        "Teritories",
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )

    company_name = models.CharField(max_length=255, default="", blank=True, null=True)
    gst_number = models.CharField(max_length=15, default="", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


# ─────────────────────────────────────────────────────────────────
# Territories (per organization)
# ─────────────────────────────────────────────────────────────────

class Teritories(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="territories",
        null=True, blank=True,
    )

    state = models.CharField(max_length=100, default="")
    district = models.CharField(max_length=100, default="")
    city = models.CharField(max_length=100, default="")
    pincode = models.CharField(max_length=6, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.state} {self.district} {self.city} {self.pincode}"


# ─────────────────────────────────────────────────────────────────
# Pipelines & Stages (replaces hardcoded status enums)
# ─────────────────────────────────────────────────────────────────

class Pipeline(models.Model):
    """
    Configurable pipeline per organization per module.
    Module = 'lead' / 'deal' / 'task' (extendable).
    """

    MODULE_CHOICES = [
        ("lead", "Lead"),
        ("deal", "Deal"),
        ("task", "Task"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="pipelines",
    )
    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("organization", "module", "name")]
        indexes = [models.Index(fields=["organization", "module", "is_default"])]

    def __str__(self):
        return f"{self.organization.slug}/{self.module}/{self.name}"


class PipelineStage(models.Model):
    pipeline = models.ForeignKey(
        Pipeline, on_delete=models.CASCADE, related_name="stages",
    )
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=80)
    color = models.CharField(max_length=20, default="#38bdf8")
    order = models.PositiveIntegerField(default=0)
    is_closed_won = models.BooleanField(default=False)
    is_closed_lost = models.BooleanField(default=False)

    class Meta:
        ordering = ["order", "id"]
        unique_together = [("pipeline", "slug")]

    def __str__(self):
        return f"{self.pipeline} → {self.name}"


# ─────────────────────────────────────────────────────────────────
# Leads (industry-agnostic; choices removed)
# ─────────────────────────────────────────────────────────────────

class Leads(models.Model):

    SOURCE_CHOICES = [
        ("WEBSITE", "Website"),
        ("REFERRAL", "Referral"),
        ("SOCIAL_MEDIA", "Social Media"),
        ("DEALER", "Dealer"),
        ("PHONE", "Phone"),
        ("EMAIL", "Email"),
        ("EVENT", "Event"),
        ("OTHER", "Other"),
    ]

    # Tenant
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="leads",
        null=True, blank=True,
    )

    leads_source = models.CharField(max_length=30, default="WEBSITE")  # free text in DB; choices are UI hints
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=10, blank=True, default="")

    # Free-text fields (no longer locked to solar enums)
    brand_name = models.CharField(max_length=60, blank=True, default="")
    model_name = models.CharField(max_length=60, blank=True, default="")
    watt_capacity = models.CharField(max_length=60, blank=True, default="")

    # Generic product/service description fields (replaces solar-specific watt/brand)
    product_name = models.CharField(max_length=200, blank=True, default="")
    product_category = models.CharField(max_length=100, blank=True, default="")

    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Tags (comma separated) — quick filter alternative
    tags = models.CharField(max_length=500, blank=True, default="")

    # Notes
    notes = models.TextField(blank=True, default="")

    assigned_to = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        related_name="leads",
        null=True,
        blank=True,
    )

    # Status is now free-text — actual valid stages come from the org's lead Pipeline
    status = models.CharField(max_length=60, default="NEW")

    pipeline = models.ForeignKey(
        Pipeline, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="leads",
    )

    # Lead scoring (0-100). Updated by signals on activity events. See LeadScoreRule.
    score = models.IntegerField(default=0)
    # Categorical priority derived from score: HOT (>=70), WARM (>=40), COLD (<40)
    priority = models.CharField(max_length=10, default="COLD")
    last_activity_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "assigned_to"]),
            models.Index(fields=["organization", "created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.name} | {self.status}"


# ─────────────────────────────────────────────────────────────────
# Deals
# ─────────────────────────────────────────────────────────────────

class Deal(models.Model):

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="deals",
        null=True, blank=True,
    )
    lead = models.ForeignKey("Leads", on_delete=models.CASCADE, related_name="deals")

    assigned_to = models.ForeignKey(
        "User", on_delete=models.SET_NULL, related_name="deals",
        null=True, blank=True,
    )

    deal_value = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Free text — driven by org's deal Pipeline
    status = models.CharField(max_length=60, default="OPEN")
    pipeline = models.ForeignKey(
        Pipeline, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="deals",
    )

    expected_close_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "assigned_to"]),
            models.Index(fields=["organization", "created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Deal #{self.id} - {self.status} - ₹{self.deal_value}"


# ─────────────────────────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────────────────────────

class Payment(models.Model):

    PAYMENT_CHOICES = [
        ("CASH", "Cash"),
        ("CHEQUE", "Cheque"),
        ("ONLINE", "Online Transfer"),
        ("FINANCE", "Finance"),
        ("UPI", "UPI"),
        ("CARD", "Card"),
    ]

    BOOKING_CHOICES = [
        ("BOOKED", "Booked"),
        ("PARTIAL", "Partial Payment"),
        ("FULL", "Full Payment"),
    ]

    deal = models.ForeignKey("Deal", on_delete=models.PROTECT, related_name="payments")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_stage = models.CharField(max_length=20, choices=BOOKING_CHOICES)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference_number = models.CharField(max_length=255, blank=True, null=True)
    payment_screenshot = models.ImageField(
        upload_to="payment_screenshots/", null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["payment_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Payment #{self.id} - {self.payment_type} - ₹{self.amount_paid}"


# ─────────────────────────────────────────────────────────────────
# Documents (KYC)
# ─────────────────────────────────────────────────────────────────

class Document(models.Model):

    DOCUMENT_CHOICES = [
        ("AADHAAR", "Aadhar Card"),
        ("PAN", "PAN Card"),
        ("ADDRESS_PROOF", "Address Proof"),
        ("INCOME_PROOF", "Income Proof"),
        ("PASSBOOK", "Passbook"),
        ("CONTRACT", "Contract"),
        ("INVOICE", "Invoice"),
        ("OTHER", "Other"),
    ]

    lead = models.ForeignKey("Leads", on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=60, choices=DOCUMENT_CHOICES)
    document_file = models.FileField(
        upload_to="documents/",
        validators=[FileExtensionValidator(["pdf", "jpg", "jpeg", "png"])],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["document_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.lead.name}"


# ─────────────────────────────────────────────────────────────────
# Tasks
# ─────────────────────────────────────────────────────────────────

class Task(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="tasks",
        null=True, blank=True,
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    assigned_to = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="tasks",
    )
    created_by = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="created_tasks",
    )

    due_date = models.DateField(null=True, blank=True)

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="MEDIUM")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "assigned_to"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.status}"


class TaskMessage(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="messages")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)

        if is_new and self.task_id:
            msg = (self.message or "").lower()
            new_status = None
            if "complete" in msg:
                new_status = "COMPLETED"
            elif "nhi hua" in msg or "not done" in msg:
                new_status = "PENDING"
            elif "working" in msg or "progress" in msg:
                new_status = "IN_PROGRESS"
            if new_status and self.task.status != new_status:
                self.task.status = new_status
                self.task.save(update_fields=["status", "updated_at"])


# ════════════════════════════════════════════════════════════════
#  PLATFORM EXTENSIONS — skeleton/scaffold features
#  Models are wired through migrations + serializers + URL routes
#  + UI placeholders, but the heavy execution logic (rule engine,
#  WhatsApp API send, Razorpay checkout, 2FA verify, etc.) is
#  stubbed. Fill in business logic in dedicated future passes.
# ════════════════════════════════════════════════════════════════


# ─── 1. Automation engine ────────────────────────────────────────

class AutomationRule(models.Model):
    """Org-scoped if-this-then-that automation rules. Execution engine: NOT IMPLEMENTED yet."""

    EVENT_CHOICES = [
        ("lead_created",           "Lead created"),
        ("lead_status_changed",    "Lead status changed"),
        ("lead_assigned",          "Lead assigned"),
        ("deal_won",               "Deal won"),
        ("deal_lost",              "Deal lost"),
        ("payment_received",       "Payment received"),
        ("task_overdue",           "Task overdue"),
        ("task_completed",         "Task completed"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="automation_rules")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    trigger_event = models.CharField(max_length=40, choices=EVENT_CHOICES)
    conditions = models.JSONField(default=dict, blank=True)  # {"field": "status", "op": "eq", "value": "WON"}
    actions = models.JSONField(default=list, blank=True)     # [{"type": "send_email", "to": "..."}]
    is_active = models.BooleanField(default=True)

    last_run_at = models.DateTimeField(null=True, blank=True)
    run_count = models.PositiveIntegerField(default=0)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="automation_rules")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["organization", "is_active", "trigger_event"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.organization.slug} / {self.name}"


# ─── 2. WhatsApp integration ─────────────────────────────────────

class WhatsAppConfig(models.Model):
    """Per-org WhatsApp Business API credentials. Actual send: NOT IMPLEMENTED."""
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="whatsapp_config")
    is_enabled = models.BooleanField(default=False)
    phone_number_id = models.CharField(max_length=80, blank=True)
    business_account_id = models.CharField(max_length=80, blank=True)
    access_token = models.CharField(max_length=400, blank=True)  # encrypt at rest in prod
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"WhatsApp config — {self.organization.slug}"


class WhatsAppMessage(models.Model):
    DIRECTION_CHOICES = [("INBOUND", "Inbound"), ("OUTBOUND", "Outbound")]
    STATUS_CHOICES = [
        ("PENDING",   "Pending"),
        ("SENT",      "Sent"),
        ("DELIVERED", "Delivered"),
        ("READ",      "Read"),
        ("FAILED",    "Failed"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="whatsapp_messages")
    lead = models.ForeignKey(Leads, on_delete=models.SET_NULL, null=True, blank=True, related_name="whatsapp_messages")
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="whatsapp_messages")
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default="OUTBOUND")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    to_number = models.CharField(max_length=20)
    body = models.TextField()
    template_name = models.CharField(max_length=120, blank=True)
    external_id = models.CharField(max_length=120, blank=True)
    error_message = models.CharField(max_length=400, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["status"]),
        ]


# ─── 3. Billing / subscriptions ──────────────────────────────────

class Plan(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    price_monthly_inr = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly_inr = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_users = models.PositiveIntegerField(default=5)
    max_leads = models.PositiveIntegerField(default=500)
    max_storage_mb = models.PositiveIntegerField(default=500)
    features = models.JSONField(default=list, blank=True)  # ["WhatsApp", "Automation", ...]
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["price_monthly_inr"]

    def __str__(self):
        return f"{self.name} — ₹{self.price_monthly_inr}/mo"


class Subscription(models.Model):
    STATUS_CHOICES = [
        ("TRIAL",     "Trial"),
        ("ACTIVE",    "Active"),
        ("PAST_DUE",  "Past due"),
        ("CANCELLED", "Cancelled"),
    ]
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TRIAL")
    razorpay_subscription_id = models.CharField(max_length=120, blank=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.organization.slug} — {self.plan.name} ({self.status})"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("DRAFT",   "Draft"),
        ("ISSUED",  "Issued"),
        ("PAID",    "Paid"),
        ("OVERDUE", "Overdue"),
        ("VOID",    "Void"),
    ]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="invoices")
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    invoice_number = models.CharField(max_length=40, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    issued_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=120, blank=True)
    pdf_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "status"])]


# ─── 4. Custom Fields engine ─────────────────────────────────────

class CustomField(models.Model):
    """Per-org, per-module custom field definition."""

    FIELD_TYPE_CHOICES = [
        ("text",         "Text"),
        ("textarea",     "Textarea"),
        ("number",       "Number"),
        ("date",         "Date"),
        ("datetime",     "DateTime"),
        ("select",       "Select (single)"),
        ("multiselect",  "Select (multi)"),
        ("checkbox",     "Checkbox"),
        ("email",        "Email"),
        ("phone",        "Phone"),
        ("url",          "URL"),
    ]
    MODULE_CHOICES = [
        ("lead",     "Lead"),
        ("deal",     "Deal"),
        ("task",     "Task"),
        ("customer", "Customer"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="custom_fields")
    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=80)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES, default="text")
    required = models.BooleanField(default=False)
    choices = models.JSONField(default=list, blank=True)  # for select / multiselect
    default_value = models.CharField(max_length=400, blank=True)
    placeholder = models.CharField(max_length=200, blank=True)
    help_text = models.CharField(max_length=400, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("organization", "module", "slug")]
        ordering = ["module", "position", "id"]
        indexes = [models.Index(fields=["organization", "module", "is_active"])]

    def __str__(self):
        return f"{self.organization.slug}/{self.module}/{self.slug}"


class CustomFieldValue(models.Model):
    """Per-record value for a CustomField. Reader / writer wiring: NOT IMPLEMENTED."""
    custom_field = models.ForeignKey(CustomField, on_delete=models.CASCADE, related_name="values")
    lead = models.ForeignKey(Leads, on_delete=models.CASCADE, null=True, blank=True, related_name="custom_values")
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, null=True, blank=True, related_name="custom_values")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name="custom_values")
    value_text = models.TextField(blank=True, default="")
    value_number = models.DecimalField(max_digits=20, decimal_places=6, null=True, blank=True)
    value_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["custom_field", "lead"]),
            models.Index(fields=["custom_field", "deal"]),
            models.Index(fields=["custom_field", "task"]),
        ]


# ─── 5. Audit logs ───────────────────────────────────────────────

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("CREATE",  "Create"),
        ("UPDATE",  "Update"),
        ("DELETE",  "Delete"),
        ("LOGIN",   "Login"),
        ("LOGOUT",  "Logout"),
        ("EXPORT",  "Export"),
        ("IMPORT",  "Import"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True, related_name="audit_logs")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=80, blank=True)
    object_id = models.CharField(max_length=80, blank=True)
    object_repr = models.CharField(max_length=200, blank=True)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=400, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["model_name", "object_id"]),
        ]

    def __str__(self):
        return f"{self.action} {self.model_name}#{self.object_id} by {self.user_id}"


# ─── 6. Two-Factor Authentication ────────────────────────────────

class TwoFactorSecret(models.Model):
    """TOTP secret per user. Verify on login: NOT IMPLEMENTED yet."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="two_factor")
    secret = models.CharField(max_length=64)  # base32 TOTP secret
    is_enabled = models.BooleanField(default=False)
    backup_codes = models.JSONField(default=list, blank=True)
    enabled_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# ─── 7. Notifications ────────────────────────────────────────────

class Notification(models.Model):
    TYPE_CHOICES = [
        ("info",             "Info"),
        ("success",          "Success"),
        ("warning",          "Warning"),
        ("error",            "Error"),
        ("lead_assigned",    "Lead assigned"),
        ("deal_won",         "Deal won"),
        ("task_due",         "Task due"),
        ("payment_received", "Payment received"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True, related_name="notifications")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default="info")
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    link = models.CharField(max_length=400, blank=True)
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "read", "-created_at"]),
            models.Index(fields=["organization", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.title}"


# ════════════════════════════════════════════════════════════════
#  PHASE 5 — Enterprise Foundation Pack
# ════════════════════════════════════════════════════════════════


# ─── 1. Lead Scoring ─────────────────────────────────────────────

class LeadScoreRule(models.Model):
    """
    Org-scoped scoring rule. When an EVENT happens on a lead, lead.score is
    adjusted by `points` (positive or negative). Signals in api/signals.py
    consume these rules.
    """

    EVENT_CHOICES = [
        ("lead_created",         "Lead created"),
        ("status_changed",       "Status changed"),
        ("deal_created",         "Deal created"),
        ("deal_won",             "Deal won"),
        ("payment_received",     "Payment received"),
        ("document_uploaded",    "Document uploaded"),
        ("task_completed",       "Task completed"),
        # Manual / future-ready
        ("email_opened",         "Email opened"),
        ("email_replied",        "Email replied"),
        ("meeting_booked",       "Meeting booked"),
        ("quotation_viewed",     "Quotation viewed"),
        ("payment_initiated",    "Payment initiated"),
        ("inactivity_penalty",   "Inactivity penalty"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="score_rules")
    event = models.CharField(max_length=40, choices=EVENT_CHOICES)
    points = models.IntegerField(default=0)  # +ve adds, -ve subtracts
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("organization", "event")]
        ordering = ["event"]


class LeadScoreHistory(models.Model):
    """Audit trail for score changes — show 'why' on a lead's profile."""
    lead = models.ForeignKey(Leads, on_delete=models.CASCADE, related_name="score_history")
    event = models.CharField(max_length=40)
    points_delta = models.IntegerField()
    score_before = models.IntegerField()
    score_after = models.IntegerField()
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["lead", "-created_at"])]


# ─── 2. Sales Targets & Commissions ──────────────────────────────

class SalesTarget(models.Model):
    PERIOD_CHOICES = [
        ("MONTH",   "Monthly"),
        ("QUARTER", "Quarterly"),
        ("YEAR",    "Yearly"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="sales_targets")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sales_targets")
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default="MONTH")
    # Period anchor — for monthly it's the first day of the month, etc.
    period_start = models.DateField()
    target_amount = models.DecimalField(max_digits=14, decimal_places=2)
    commission_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # e.g. 5.00 = 5%

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("organization", "user", "period", "period_start")]
        ordering = ["-period_start"]
        indexes = [models.Index(fields=["organization", "user", "period_start"])]


# ─── 3. Saved Views ──────────────────────────────────────────────

class SavedView(models.Model):
    MODULE_CHOICES = [
        ("lead", "Lead"),
        ("deal", "Deal"),
        ("task", "Task"),
        ("customer", "Customer"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="saved_views")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="saved_views")
    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    name = models.CharField(max_length=120)
    # Filters: {field: {op: "eq"|"in"|"gt"|...|"icontains", value: ...}, ...}
    # Or grouped: {logic: "AND", conditions: [...]}
    filters = models.JSONField(default=dict, blank=True)
    sort = models.CharField(max_length=80, blank=True, default="-created_at")
    is_shared = models.BooleanField(default=False)  # If True, all org users can use it
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["module", "name"]
        indexes = [
            models.Index(fields=["organization", "module"]),
            models.Index(fields=["user", "module"]),
        ]


# ─── 4. Call Logs & Voice Notes ──────────────────────────────────

class CallLog(models.Model):
    DIRECTION_CHOICES = [
        ("INBOUND",  "Inbound"),
        ("OUTBOUND", "Outbound"),
    ]
    OUTCOME_CHOICES = [
        ("CONNECTED",     "Connected"),
        ("NO_ANSWER",     "No answer"),
        ("BUSY",          "Busy"),
        ("VOICEMAIL",     "Voicemail"),
        ("WRONG_NUMBER",  "Wrong number"),
        ("CALLBACK",      "Callback requested"),
        ("INTERESTED",    "Interested"),
        ("NOT_INTERESTED","Not interested"),
        ("CONVERTED",     "Converted to deal"),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="call_logs")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="call_logs")
    lead = models.ForeignKey(Leads, on_delete=models.SET_NULL, null=True, blank=True, related_name="call_logs")
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="call_logs")

    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, default="OUTBOUND")
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES, default="CONNECTED")
    duration_seconds = models.PositiveIntegerField(default=0)
    phone_number = models.CharField(max_length=20, blank=True)

    notes = models.TextField(blank=True)
    voice_note_url = models.URLField(blank=True)  # for future Twilio/Exotel recording links

    next_action = models.CharField(max_length=200, blank=True)
    next_action_at = models.DateTimeField(null=True, blank=True)

    called_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-called_at"]
        indexes = [
            models.Index(fields=["organization", "-called_at"]),
            models.Index(fields=["user", "-called_at"]),
            models.Index(fields=["lead", "-called_at"]),
        ]


# ─── 5. Duplicate Match Cache (optional — duplicates detected on the fly) ──

# Duplicate detection is computed live on query — no model needed.
# See views._find_duplicates() and DuplicateLeads endpoint.


# ─── 6. Industry Templates ───────────────────────────────────────

# Industry templates are static fixture data, not a DB model.
# See api/industry_templates.py for the data + apply_template() helper.


# ═══════════════════════════════════════════════════════════════════
# PHASE 6 — Enterprise Operations Pack
# ═══════════════════════════════════════════════════════════════════
#
# Six features added together in migration 0016:
#   - Advanced Filter Builder      → no model (uses SavedView for persistence)
#   - Import / Export Engine       → ImportJob
#   - Lead Distribution Engine     → DistributionRule, AssignmentLog
#   - Session & Device Management  → UserSession
#   - Approval Workflows           → ApprovalRequest, ApprovalStep
#   - Public API Docs / API Keys   → APIKey
# ═══════════════════════════════════════════════════════════════════


# ─── 6.1 Import jobs ─────────────────────────────────────────────

class ImportJob(models.Model):
    """A single CSV/Excel import attempt — uploaded file, mapping, status, log."""

    MODULE_CHOICES = [
        ("lead", "Lead"),
        ("deal", "Deal"),
        ("customer", "Customer"),
        ("task", "Task"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PREVIEW", "Preview ready"),
        ("RUNNING", "Running"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
        ("ROLLED_BACK", "Rolled back"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="import_jobs",
        null=True, blank=True,
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="import_jobs")
    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    file = models.FileField(upload_to="imports/", null=True, blank=True)
    original_filename = models.CharField(max_length=255, blank=True, default="")

    # Mapping: { "csv_column": "model_field" }
    mapping = models.JSONField(default=dict, blank=True)
    # Options: { "skip_duplicates": true, "dry_run": true }
    options = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="PENDING")
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    succeeded_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    error_log = models.JSONField(default=list, blank=True)  # [{"row": 3, "error": "..."}, ...]

    # IDs of records created so we can roll back.
    created_record_ids = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.module} import #{self.id} ({self.status})"


# ─── 6.2 Lead Distribution ───────────────────────────────────────

class DistributionRule(models.Model):
    """A rule controlling auto-assignment of newly created leads."""

    STRATEGY_CHOICES = [
        ("ROUND_ROBIN", "Round robin"),
        ("LEAST_LOADED", "Least loaded"),
        ("TERRITORY", "Territory based"),
        ("WEIGHTED", "Weighted"),
        ("SKILL", "Skill based"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="distribution_rules",
        null=True, blank=True,
    )
    name = models.CharField(max_length=120)
    strategy = models.CharField(max_length=20, choices=STRATEGY_CHOICES, default="ROUND_ROBIN")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)  # lower number → checked first

    # Match filter for which leads this rule applies to (uses Filter DSL JSON).
    # Empty {} = matches every lead.
    match_filter = models.JSONField(default=dict, blank=True)

    # Eligible users (M2M of User). For TERRITORY: also reads user.territory.
    # For WEIGHTED: pair with `weights` JSON.
    eligible_users = models.ManyToManyField(User, blank=True, related_name="distribution_rules")
    weights = models.JSONField(default=dict, blank=True)  # {"user_id": 5, ...}
    skills_required = models.JSONField(default=list, blank=True)

    # Stateful round-robin pointer (index into eligible_users).
    rr_cursor = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["priority", "id"]
        indexes = [
            models.Index(fields=["organization", "is_active", "priority"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.strategy})"


class AssignmentLog(models.Model):
    """Audit row written every time a lead is auto-assigned by a rule."""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="assignment_logs",
        null=True, blank=True,
    )
    lead = models.ForeignKey(Leads, on_delete=models.CASCADE, related_name="assignment_logs")
    rule = models.ForeignKey(
        DistributionRule, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="assignment_logs",
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="received_assignments",
    )
    strategy = models.CharField(max_length=20, blank=True, default="")
    reason = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
            models.Index(fields=["lead"]),
        ]


# ─── 6.3 Session & Device management ──────────────────────────────

class UserSession(models.Model):
    """One row per active JWT refresh-token jti. Updated on every request."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    jti = models.CharField(max_length=128, unique=True, db_index=True)
    user_agent = models.CharField(max_length=512, blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Coarse device parsing (browser / OS / device).
    device_label = models.CharField(max_length=120, blank=True, default="")

    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_seen_at"]
        indexes = [
            models.Index(fields=["user", "is_active"]),
        ]

    def __str__(self):
        return f"{self.user.username} · {self.device_label or 'session'} · {self.jti[:8]}"


# ─── 6.4 Approval Workflows ──────────────────────────────────────

class ApprovalRequest(models.Model):
    """A multi-step approval chain — discount, contract, refund, leave, etc."""

    TYPE_CHOICES = [
        ("DISCOUNT", "Discount"),
        ("CONTRACT", "Contract"),
        ("PAYMENT", "Payment"),
        ("LEAVE", "Leave"),
        ("REFUND", "Refund"),
        ("OTHER", "Other"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("CANCELLED", "Cancelled"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="approval_requests",
        null=True, blank=True,
    )
    requester = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="requested_approvals")
    request_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="OTHER")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)  # arbitrary context (deal_id, amount, etc.)

    # The chain itself — ordered list of approver user IDs.
    approver_chain = models.JSONField(default=list, blank=True)  # [user_id, user_id, ...]
    current_step = models.IntegerField(default=0)               # index into chain

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="PENDING")
    decided_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["requester", "status"]),
        ]

    def __str__(self):
        return f"{self.request_type}: {self.title} ({self.status})"


class ApprovalStep(models.Model):
    """One action by one approver inside an ApprovalRequest chain."""

    ACTION_CHOICES = [
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("COMMENT", "Comment"),
    ]

    request = models.ForeignKey(ApprovalRequest, on_delete=models.CASCADE, related_name="steps")
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approval_actions")
    step_index = models.IntegerField(default=0)
    action = models.CharField(max_length=15, choices=ACTION_CHOICES)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


# ─── 6.5 Public API — API Keys ───────────────────────────────────

class APIKey(models.Model):
    """A per-org API key for external integrations + webhook clients."""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="api_keys",
        null=True, blank=True,
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="api_keys_created")
    name = models.CharField(max_length=120)
    key = models.CharField(max_length=64, unique=True, db_index=True)  # opaque token

    # Coarse scope flags — keep simple, expand later.
    can_read = models.BooleanField(default=True)
    can_write = models.BooleanField(default=False)
    allowed_modules = models.JSONField(default=list, blank=True)  # ["leads", "deals"]

    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({'active' if self.is_active else 'revoked'})"


# ═══════════════════════════════════════════════════════════════════
# PHASE 7 — Enterprise Integrations Pack
# ═══════════════════════════════════════════════════════════════════
#
# Five major features layered on top of the scaffolds from Phase 3:
#   - Automation Execution Engine  → AutomationRun
#   - Real WhatsApp Cloud API      → uses existing WhatsAppConfig/Message
#   - Razorpay Billing             → extends Subscription/Invoice
#   - Helpdesk / Ticketing         → Department, Ticket, TicketMessage,
#                                    CannedReply, SLAPolicy
#   - Customer Portal              → PortalToken
# ═══════════════════════════════════════════════════════════════════


# ─── 7.1 Automation execution ─────────────────────────────────────

class AutomationRun(models.Model):
    """One execution attempt of an AutomationRule. Stores trigger payload,
    per-action results, and any error. Used for the activity log on the
    automation page."""

    STATUS_CHOICES = [
        ("SUCCESS", "Success"),
        ("PARTIAL", "Partial"),
        ("FAILED", "Failed"),
        ("RETRYING", "Retrying"),
    ]

    rule = models.ForeignKey(
        AutomationRule, on_delete=models.CASCADE, related_name="runs",
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="automation_runs",
        null=True, blank=True,
    )
    trigger_event = models.CharField(max_length=50)
    payload = models.JSONField(default=dict, blank=True)
    actions_log = models.JSONField(default=list, blank=True)  # [{"action": "...", "status": "ok|error", "detail": "..."}]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="SUCCESS")
    error_message = models.TextField(blank=True, default="")
    retry_count = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["organization", "-started_at"]),
            models.Index(fields=["rule", "-started_at"]),
            models.Index(fields=["status"]),
        ]


# ─── 7.2 Helpdesk / Ticketing ────────────────────────────────────

class Department(models.Model):
    """A support department — Sales, Billing, Technical etc."""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="departments",
        null=True, blank=True,
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True, default="")
    email = models.EmailField(blank=True, default="")
    default_assignee = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="default_for_departments",
    )
    members = models.ManyToManyField(
        User, blank=True, related_name="departments",
    )
    color = models.CharField(max_length=20, default="#facc15")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["organization", "is_active"])]

    def __str__(self):
        return self.name


class SLAPolicy(models.Model):
    """SLA timers attached to a Department + priority bucket."""

    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("NORMAL", "Normal"),
        ("HIGH", "High"),
        ("URGENT", "Urgent"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="sla_policies",
        null=True, blank=True,
    )
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="sla_policies",
        null=True, blank=True,
    )
    name = models.CharField(max_length=120)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="NORMAL")
    first_response_minutes = models.IntegerField(default=60)
    resolution_minutes = models.IntegerField(default=1440)  # 24h
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["priority"]


class Ticket(models.Model):
    """A customer support ticket."""

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In progress"),
        ("WAITING", "Waiting on customer"),
        ("RESOLVED", "Resolved"),
        ("CLOSED", "Closed"),
    ]
    PRIORITY_CHOICES = SLAPolicy.PRIORITY_CHOICES
    SOURCE_CHOICES = [
        ("WEB", "Web form"),
        ("EMAIL", "Email"),
        ("PORTAL", "Customer portal"),
        ("PHONE", "Phone"),
        ("CHAT", "Chat"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="tickets",
        null=True, blank=True,
    )
    number = models.CharField(max_length=20, unique=True, db_index=True)
    subject = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="OPEN")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="NORMAL")
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="WEB")

    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="tickets",
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="assigned_tickets",
    )

    # Customer side — either a portal user or a free-text contact.
    customer_email = models.EmailField(blank=True, default="")
    customer_name = models.CharField(max_length=120, blank=True, default="")
    customer_phone = models.CharField(max_length=30, blank=True, default="")
    customer_lead = models.ForeignKey(
        Leads, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="tickets",
    )

    # SLA tracking
    sla_policy = models.ForeignKey(SLAPolicy, on_delete=models.SET_NULL, null=True, blank=True)
    first_response_due = models.DateTimeField(null=True, blank=True)
    resolution_due = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    sla_breached = models.BooleanField(default=False)
    escalated = models.BooleanField(default=False)

    tags = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["customer_email"]),
            models.Index(fields=["department", "status"]),
        ]

    def __str__(self):
        return f"{self.number} · {self.subject[:50]}"


class TicketMessage(models.Model):
    """A reply on a ticket — internal note or customer-visible message."""

    AUTHOR_TYPE_CHOICES = [
        ("AGENT", "Agent"),
        ("CUSTOMER", "Customer"),
        ("SYSTEM", "System"),
    ]

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="ticket_messages")
    author_type = models.CharField(max_length=10, choices=AUTHOR_TYPE_CHOICES, default="AGENT")
    author_name = models.CharField(max_length=120, blank=True, default="")  # cached for customer messages
    body = models.TextField()
    is_internal = models.BooleanField(default=False)  # internal notes invisible to customer
    attachment = models.FileField(upload_to="tickets/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["ticket", "created_at"])]


class CannedReply(models.Model):
    """Reusable response snippet for agents."""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="canned_replies",
        null=True, blank=True,
    )
    title = models.CharField(max_length=120)
    body = models.TextField()
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="canned_replies",
    )
    usage_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]


# ─── 7.3 Customer Portal ──────────────────────────────────────────

class PortalToken(models.Model):
    """An opaque login token for a customer (no password).

    Customers identify by email; clicking the magic link lands them in the
    portal with this token in `Authorization: Portal <token>`.

    Linked to a Lead OR Deal OR a free-floating email — the portal queries
    show everything tied to that email within the org.
    """

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="portal_tokens",
        null=True, blank=True,
    )
    email = models.EmailField(db_index=True)
    name = models.CharField(max_length=120, blank=True, default="")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    linked_lead = models.ForeignKey(
        Leads, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="portal_tokens",
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="portal_tokens_created",
    )
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "email"]),
            models.Index(fields=["token"]),
        ]

    def __str__(self):
        return f"portal: {self.email}"


# ═══════════════════════════════════════════════════════════════════
# PHASE 8 — Ecosystem & Intelligence Pack
# ═══════════════════════════════════════════════════════════════════
#
# Eleven features layered on top of Phase 7:
#   - Knowledge Base       → KbCategory, KbArticle
#   - Form Builder         → Form, FormField, FormSubmission
#   - E-Signature          → SignatureRequest, SignatureSigner, SignatureEvent
#   - Backup & Restore     → BackupJob
#   - Cloud Storage        → CloudConnection
#   - AI CRM Features      → AIRequest
#   - Plugin Marketplace   → Plugin
#   - Push Notifications   → PushSubscription
#   - Dashboard Builder    → DashboardLayout
#   - Advanced Analytics   → no model (computed live)
#   - Multi-language i18n  → no model (translation files only)
# ═══════════════════════════════════════════════════════════════════


# ─── 8.1 Knowledge Base ──────────────────────────────────────────

class KbCategory(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="kb_categories",
        null=True, blank=True,
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=40, blank=True, default="BookOpen")
    order = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]
        unique_together = [("organization", "slug")]

    def __str__(self):
        return self.name


class KbArticle(models.Model):
    STATUS_CHOICES = [("DRAFT", "Draft"), ("PUBLISHED", "Published"), ("ARCHIVED", "Archived")]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="kb_articles",
        null=True, blank=True,
    )
    category = models.ForeignKey(KbCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles")
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280)
    body = models.TextField(blank=True, default="")  # markdown
    excerpt = models.CharField(max_length=400, blank=True, default="")
    tags = models.CharField(max_length=400, blank=True, default="")  # comma-separated
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="DRAFT")
    is_public = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="kb_articles")

    view_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = [("organization", "slug")]
        indexes = [
            models.Index(fields=["organization", "status", "is_public"]),
            models.Index(fields=["category", "status"]),
        ]

    def __str__(self):
        return self.title


# ─── 8.2 Form Builder ────────────────────────────────────────────

class Form(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="forms",
        null=True, blank=True,
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=240, unique=True)
    description = models.TextField(blank=True, default="")
    success_message = models.TextField(blank=True, default="Thank you! We'll be in touch shortly.")
    redirect_url = models.URLField(blank=True, default="")

    # What to do when a submission lands.
    create_lead = models.BooleanField(default=True)
    notify_email = models.EmailField(blank=True, default="")
    notify_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="form_notifications")

    is_active = models.BooleanField(default=True)
    submission_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


class FormField(models.Model):
    FIELD_TYPES = [
        ("text", "Text"), ("textarea", "Textarea"), ("email", "Email"),
        ("phone", "Phone"), ("number", "Number"), ("date", "Date"),
        ("select", "Select"), ("checkbox", "Checkbox"), ("radio", "Radio"),
        ("hidden", "Hidden"),
    ]

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="fields")
    label = models.CharField(max_length=200)
    field_key = models.SlugField(max_length=120)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default="text")
    placeholder = models.CharField(max_length=200, blank=True, default="")
    help_text = models.CharField(max_length=400, blank=True, default="")
    is_required = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    options = models.JSONField(default=list, blank=True)  # for select/radio
    maps_to = models.CharField(max_length=60, blank=True, default="")  # lead field mapping

    class Meta:
        ordering = ["order"]
        unique_together = [("form", "field_key")]


class FormSubmission(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="submissions")
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="form_submissions",
        null=True, blank=True,
    )
    data = models.JSONField(default=dict)
    lead = models.ForeignKey(Leads, on_delete=models.SET_NULL, null=True, blank=True, related_name="form_submissions")
    referrer = models.URLField(blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default="")
    is_spam = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["form", "-created_at"])]


# ─── 8.3 E-Signature ─────────────────────────────────────────────

class SignatureRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PARTIALLY_SIGNED", "Partially signed"),
        ("COMPLETED", "Completed"),
        ("DECLINED", "Declined"),
        ("EXPIRED", "Expired"),
        ("CANCELLED", "Cancelled"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="signature_requests",
        null=True, blank=True,
    )
    title = models.CharField(max_length=240)
    description = models.TextField(blank=True, default="")
    document = models.FileField(upload_to="esign/", null=True, blank=True)
    signed_document = models.FileField(upload_to="esign/signed/", null=True, blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="signature_requests")
    related_lead = models.ForeignKey(Leads, on_delete=models.SET_NULL, null=True, blank=True, related_name="signature_requests")
    related_deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="signature_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    expires_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "status"])]


class SignatureSigner(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("VIEWED", "Viewed"),
        ("SIGNED", "Signed"),
        ("DECLINED", "Declined"),
    ]

    request = models.ForeignKey(SignatureRequest, on_delete=models.CASCADE, related_name="signers")
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default="")
    order = models.IntegerField(default=0)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="PENDING")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    otp = models.CharField(max_length=6, blank=True, default="")
    otp_sent_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    signature_image = models.TextField(blank=True, default="")  # base64 PNG
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default="")

    class Meta:
        ordering = ["order"]


class SignatureEvent(models.Model):
    """Audit trail row for an e-sign workflow."""
    request = models.ForeignKey(SignatureRequest, on_delete=models.CASCADE, related_name="events")
    signer = models.ForeignKey(SignatureSigner, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    event = models.CharField(max_length=40)  # SENT, VIEWED, OTP_SENT, SIGNED, DECLINED
    detail = models.TextField(blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


# ─── 8.4 Backup & Restore ────────────────────────────────────────

class BackupJob(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("RUNNING", "Running"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
        ("RESTORED", "Restored"),
    ]
    KIND_CHOICES = [("FULL", "Full"), ("INCREMENTAL", "Incremental"), ("MANUAL", "Manual")]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="backup_jobs",
        null=True, blank=True,
    )
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    kind = models.CharField(max_length=12, choices=KIND_CHOICES, default="MANUAL")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="PENDING")
    file = models.FileField(upload_to="backups/", null=True, blank=True)
    file_size_bytes = models.BigIntegerField(default=0)
    record_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default="")
    encryption_enabled = models.BooleanField(default=False)
    retention_days = models.IntegerField(default=30)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]


# ─── 8.5 Cloud Storage Connections ────────────────────────────────

class CloudConnection(models.Model):
    PROVIDER_CHOICES = [
        ("GOOGLE_DRIVE", "Google Drive"),
        ("DROPBOX", "Dropbox"),
        ("ONEDRIVE", "OneDrive"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="cloud_connections",
        null=True, blank=True,
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cloud_connections")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    account_email = models.EmailField(blank=True, default="")
    account_name = models.CharField(max_length=200, blank=True, default="")
    access_token = models.TextField(blank=True, default="")
    refresh_token = models.TextField(blank=True, default="")
    token_expires_at = models.DateTimeField(null=True, blank=True)
    scope = models.CharField(max_length=400, blank=True, default="")
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "provider")]


# ─── 8.6 AI request log ──────────────────────────────────────────

class AIRequest(models.Model):
    KIND_CHOICES = [
        ("LEAD_SUMMARY", "Lead summary"),
        ("FOLLOW_UP", "Follow-up draft"),
        ("DEAL_RISK", "Deal risk prediction"),
        ("EMAIL_DRAFT", "Email draft"),
        ("MEETING_SUMMARY", "Meeting summary"),
        ("CHATBOT", "Chatbot"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="ai_requests",
        null=True, blank=True,
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_requests")
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    provider = models.CharField(max_length=20, default="openai")  # openai | anthropic
    model = models.CharField(max_length=80, blank=True, default="")
    prompt = models.TextField(blank=True, default="")
    response = models.TextField(blank=True, default="")
    context = models.JSONField(default=dict, blank=True)
    tokens_used = models.IntegerField(default=0)
    cost_cents = models.IntegerField(default=0)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "-created_at"])]


# ─── 8.7 Plugin registry ─────────────────────────────────────────

class Plugin(models.Model):
    STATUS_CHOICES = [
        ("ENABLED", "Enabled"),
        ("DISABLED", "Disabled"),
        ("ERROR", "Error"),
    ]

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="plugins",
        null=True, blank=True,
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120)
    version = models.CharField(max_length=20, default="1.0.0")
    description = models.TextField(blank=True, default="")
    author = models.CharField(max_length=120, blank=True, default="")
    homepage = models.URLField(blank=True, default="")
    icon = models.CharField(max_length=40, blank=True, default="Puzzle")
    hooks = models.JSONField(default=list, blank=True)  # ["lead_created", "deal_won"]
    config = models.JSONField(default=dict, blank=True)
    permissions = models.JSONField(default=list, blank=True)  # ["read_leads", "write_deals"]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="DISABLED")
    is_official = models.BooleanField(default=False)
    install_count = models.IntegerField(default=0)
    installed_at = models.DateTimeField(auto_now_add=True)
    last_run_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("organization", "slug")]


# ─── 8.8 Push subscriptions ──────────────────────────────────────

class PushSubscription(models.Model):
    PLATFORM_CHOICES = [
        ("WEB", "Browser (Web Push)"),
        ("EXPO", "Expo / Mobile"),
        ("FCM", "Firebase Cloud Messaging"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="push_subscriptions")
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="push_subscriptions",
        null=True, blank=True,
    )
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, default="WEB")
    endpoint = models.TextField()  # browser push endpoint URL OR Expo token
    p256dh = models.CharField(max_length=400, blank=True, default="")
    auth = models.CharField(max_length=400, blank=True, default="")
    device_label = models.CharField(max_length=200, blank=True, default="")
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "is_active"])]


# ─── 8.9 Dashboard layouts ───────────────────────────────────────

class DashboardLayout(models.Model):
    """A saved react-grid-layout for a user (or a role-shared template)."""

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="dashboard_layouts",
        null=True, blank=True,
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dashboard_layouts", null=True, blank=True)
    name = models.CharField(max_length=120)
    is_default = models.BooleanField(default=False)
    shared_with_role = models.CharField(max_length=30, blank=True, default="")
    layout = models.JSONField(default=list)  # react-grid-layout JSON
    widgets = models.JSONField(default=list)  # [{"id": "...", "type": "kpi", "config": {...}}]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
