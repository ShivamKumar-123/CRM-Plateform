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
