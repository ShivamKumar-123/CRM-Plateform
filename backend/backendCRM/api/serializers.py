from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Leads, Deal, Payment, Document, Task, TaskMessage,
    Organization, Pipeline, PipelineStage,
    AutomationRule, WhatsAppConfig, WhatsAppMessage,
    Plan, Subscription, Invoice,
    CustomField, CustomFieldValue,
    AuditLog, TwoFactorSecret, Notification,
    LeadScoreRule, LeadScoreHistory,
    SalesTarget, SavedView, CallLog,
    # Phase 6
    ImportJob, DistributionRule, AssignmentLog, UserSession,
    ApprovalRequest, ApprovalStep, APIKey,
    # Phase 7
    AutomationRun, Department, SLAPolicy, Ticket, TicketMessage,
    CannedReply, PortalToken,
    # Phase 8
    KbCategory, KbArticle, Form, FormField, FormSubmission,
    SignatureRequest, SignatureSigner, SignatureEvent,
    BackupJob, CloudConnection, AIRequest, Plugin, PushSubscription,
    DashboardLayout,
)

User = get_user_model()


# ─── Organization & Pipeline ─────────────────────────────────────

class OrganizationSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    user_count  = serializers.IntegerField(read_only=True)
    lead_count  = serializers.IntegerField(read_only=True)
    deal_count  = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id", "name", "slug", "industry", "plan", "status",
            "owner", "owner_username",
            "primary_color", "accent_color",
            "max_users", "max_leads", "max_storage_mb",
            "email", "phone", "address",
            "trial_ends_at",
            "user_count", "lead_count", "deal_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["slug", "created_at", "updated_at"]


class PipelineStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipelineStage
        fields = ["id", "name", "slug", "color", "order", "is_closed_won", "is_closed_lost"]


class PipelineSerializer(serializers.ModelSerializer):
    stages = PipelineStageSerializer(many=True, read_only=True)

    class Meta:
        model = Pipeline
        fields = ["id", "module", "name", "is_default", "stages", "created_at"]


class MeSerializer(serializers.ModelSerializer):
    """Current logged-in user — returned by /api/me/."""
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "status", "company_name", "gst_number",
            "is_staff", "is_superuser", "is_active",
            "date_joined", "last_login",
            "organization",
        ]
        read_only_fields = fields


class AdminUserListSerializer(serializers.ModelSerializer):
    """Lightweight row for the super-admin users table."""
    lead_count = serializers.IntegerField(read_only=True)
    deal_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "status", "is_staff", "is_superuser", "is_active",
            "company_name", "gst_number",
            "date_joined", "last_login",
            "lead_count", "deal_count",
        ]


class AdminUserWriteSerializer(serializers.ModelSerializer):
    """Used for PATCH updates from super admin (role, status, flags, password)."""
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = [
            "username", "email", "first_name", "last_name",
            "role", "status", "is_active", "is_staff", "is_superuser",
            "company_name", "gst_number", "password",
        ]

    def update(self, instance, validated_data):
        pw = validated_data.pop("password", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if pw:
            instance.set_password(pw)
        instance.save()
        return instance

class DashboardSerializer(serializers.Serializer):
    total_leads = serializers.IntegerField()
    total_deals = serializers.IntegerField()
    won_deals = serializers.IntegerField()
    cancelled_deals = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=15, decimal_places=2)


# for admin and staff to view all the details of the leads

class LeadAdminAndStaffSerializer(serializers.ModelSerializer):

    assigned_to_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True
    )
    organization_slug = serializers.CharField(
        source='organization.slug',
        read_only=True,
    )
    # Bundle CustomFieldValue rows as a flat {slug: value} dict.
    custom_fields = serializers.SerializerMethodField()

    def get_custom_fields(self, obj):
        result = {}
        for cv in obj.custom_values.select_related("custom_field").all():
            slug = cv.custom_field.slug
            ft = cv.custom_field.field_type
            if ft == "number":
                result[slug] = float(cv.value_number) if cv.value_number is not None else None
            elif ft in ("date", "datetime"):
                result[slug] = cv.value_date.isoformat() if cv.value_date else None
            elif ft == "checkbox":
                result[slug] = (cv.value_text or "").lower() in ("true", "1", "yes")
            elif ft == "multiselect":
                result[slug] = [v for v in (cv.value_text or "").split("||") if v]
            else:
                result[slug] = cv.value_text or ""
        return result

    class Meta:
        model = Leads
        fields = [
            'id',
            'leads_source',
            'name',
            'email',
            'phone',
            'city',
            'state',
            'pincode',
            'brand_name',
            'model_name',
            'watt_capacity',
            'product_name',
            'product_category',
            'base_price',
            'tags',
            'notes',
            'status',
            'pipeline',
            'score',
            'priority',
            'last_activity_at',
            'assigned_to',
            'assigned_to_username',
            'organization',
            'organization_slug',
            'custom_fields',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['organization', 'score', 'priority', 'last_activity_at']

#auto foreign key set karne ke liye based on username

# class LeadAdminAndStaffSerializer(serializers.ModelSerializer):

#     assigned_to = serializers.SlugRelatedField(
#         queryset=User.objects.all(),
#         slug_field='username'
#     )

#     assigned_to_username = serializers.CharField(
#         source='assigned_to.username',
#         read_only=True
#     )

#     class Meta:
#         model = Leads
#         fields = [
#             'id',
#             'leads_source',
#             'name',
#             'email',
#             'phone',
#             'city',
#             'state',
#             'pincode',
#             'brand_name',
#             'model_name',
#             'watt_capacity',
#             'base_price',
#             'status',
#             'assigned_to',              # now expects username
#             'assigned_to_username',     # read only display
#             'created_at',
#             'updated_at',
#         ]


# for other users to view only limited details of the leads

class LeadOtherSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Leads
        fields = [
            'id',
            'leads_source',
            'name',
            'email',
            'phone',
            'city',
            'state',
            'pincode',
            'brand_name',
            'model_name',
            'watt_capacity',
            'product_name',
            'product_category',
            'tags',
            'notes',
            'base_price',
            'status',
            'pipeline',
            'score',
            'priority',
            'assigned_to_username',
            'created_at',
        ]



class DealAdminSerializer(serializers.ModelSerializer):
    
    name = serializers.CharField(source='lead.name', read_only=True)
    phone = serializers.CharField(source='lead.phone', read_only=True)
    city = serializers.CharField(source='lead.city', read_only=True)
    state = serializers.CharField(source='lead.state', read_only=True)
    brand_name = serializers.CharField(source='lead.brand_name', read_only=True)
    model_name = serializers.CharField(source='lead.model_name', read_only=True)
    waatt_capacity = serializers.CharField(source='lead.watt_capacity', read_only=True)
    base_price = serializers.DecimalField(source='lead.base_price', max_digits=10, decimal_places=2, read_only=True)



    class Meta:
        model = Deal
        fields = '__all__'


class DealOtherSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='lead.name', read_only=True)
    phone = serializers.CharField(source='lead.phone', read_only=True)
    city = serializers.CharField(source='lead.city', read_only=True)
    state = serializers.CharField(source='lead.state', read_only=True)
    brand_name = serializers.CharField(source='lead.brand_name', read_only=True)
    model_name = serializers.CharField(source='lead.model_name', read_only=True)
    waatt_capacity = serializers.CharField(source='lead.watt_capacity', read_only=True)
    base_price = serializers.DecimalField(source='lead.base_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Deal
        fields = [
            'id',
            'name',
            'phone',
            'city',
            'state',
            'brand_name',
            'model_name',
            'waatt_capacity',
            'base_price',
            'deal_value',
            'cost_price',
            'expected_close_date',
            'status',
            'created_at'
        ]


class DocumentAdminSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='lead.name', read_only=True)
    phone = serializers.CharField(source='lead.phone', read_only=True)
    city = serializers.CharField(source='lead.city', read_only=True)
    state = serializers.CharField(source='lead.state', read_only=True)
    brand_name = serializers.CharField(source='lead.brand_name', read_only=True)
    model_name = serializers.CharField(source='lead.model_name', read_only=True)
    watt_capacity = serializers.CharField(source='lead.watt_capacity', read_only=True)

    class Meta:
        model = Document
        fields = '__all__'



class DocumentOtherSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='lead.name', read_only=True)
    phone = serializers.CharField(source='lead.phone', read_only=True)
    city = serializers.CharField(source='lead.city', read_only=True)
    state = serializers.CharField(source='lead.state', read_only=True)
    brand_name = serializers.CharField(source='lead.brand_name', read_only=True)
    model_name = serializers.CharField(source='lead.model_name', read_only=True)
    watt_capacity = serializers.CharField(source='lead.watt_capacity', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id',
            'name',
            'phone',
            'city',
            'state',
            'brand_name',
            'model_name',
            'watt_capacity',
            'document_type',
            'document_file',
            'created_at'
        ]



class PaymentSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='deal.lead.name', read_only=True)
    phone = serializers.CharField(source='deal.lead.phone', read_only=True)
    city = serializers.CharField(source='deal.lead.city', read_only=True)
    state = serializers.CharField(source='deal.lead.state', read_only=True)

    brand_name = serializers.CharField(source='deal.lead.brand_name', read_only=True)
    model_name = serializers.CharField(source='deal.lead.model_name', read_only=True)
    watt_capacity = serializers.CharField(source='deal.lead.watt_capacity', read_only=True)

    deal_value = serializers.DecimalField(
        source='deal.deal_value',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'



# Task Serializer 

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'



# task messege serializer

class TaskMessageSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = TaskMessage
        fields = "__all__"
        read_only_fields = ["user", "task", "created_at"]


# ════════════════════════════════════════════════════════════════
#  Platform extension serializers (stub-level)
# ════════════════════════════════════════════════════════════════

class AutomationRuleSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = AutomationRule
        fields = "__all__"
        read_only_fields = ["organization", "created_by", "last_run_at", "run_count", "created_at", "updated_at"]


class WhatsAppConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppConfig
        fields = "__all__"
        read_only_fields = ["organization", "created_at", "updated_at"]
        extra_kwargs = {"access_token": {"write_only": True}}


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = "__all__"
        read_only_fields = ["organization", "status", "external_id", "sent_at", "created_at"]


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    organization_slug = serializers.CharField(source="organization.slug", read_only=True)

    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ["organization", "razorpay_subscription_id", "created_at", "updated_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    organization_slug = serializers.CharField(source="organization.slug", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["organization", "created_at"]


class CustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomField
        fields = "__all__"
        read_only_fields = ["organization", "created_at", "updated_at"]


class CustomFieldValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldValue
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    organization_slug = serializers.SerializerMethodField()

    def get_user_username(self, obj):
        return obj.user.username if obj.user_id else None

    def get_organization_slug(self, obj):
        return obj.organization.slug if obj.organization_id else None

    class Meta:
        model = AuditLog
        fields = [
            "id", "organization", "organization_slug",
            "user", "user_username",
            "action", "model_name", "object_id", "object_repr",
            "changes", "ip_address", "user_agent", "created_at",
        ]
        read_only_fields = fields


class TwoFactorStatusSerializer(serializers.ModelSerializer):
    """Read-only — never expose the secret over the wire."""
    class Meta:
        model = TwoFactorSecret
        fields = ["is_enabled", "enabled_at", "last_used_at", "created_at"]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["user", "organization", "created_at", "read_at"]


# ════════════════════════════════════════════════════════════════
#  PHASE 5 — Enterprise Foundation Pack serializers
# ════════════════════════════════════════════════════════════════

class LeadScoreRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadScoreRule
        fields = "__all__"
        read_only_fields = ["organization", "created_at", "updated_at"]


class LeadScoreHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadScoreHistory
        fields = [
            "id", "lead", "event", "points_delta",
            "score_before", "score_after", "reason", "created_at",
        ]
        read_only_fields = [
            "id", "lead", "event", "points_delta",
            "score_before", "score_after", "reason", "created_at",
        ]


class SalesTargetSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    # Derived fields — computed at read time
    achieved_amount = serializers.SerializerMethodField()
    achievement_pct = serializers.SerializerMethodField()
    commission_earned = serializers.SerializerMethodField()

    def _won_deals_qs(self, obj):
        """Won deals for this user inside the target's period."""
        from datetime import date, timedelta
        from .models import Deal
        start = obj.period_start
        if obj.period == "MONTH":
            # Next month's first day
            if start.month == 12:
                end = start.replace(year=start.year + 1, month=1)
            else:
                end = start.replace(month=start.month + 1)
        elif obj.period == "QUARTER":
            month = start.month + 3
            year = start.year + (month - 1) // 12
            month = ((month - 1) % 12) + 1
            end = start.replace(year=year, month=month)
        else:  # YEAR
            end = start.replace(year=start.year + 1)

        return Deal.objects.filter(
            organization=obj.organization,
            assigned_to=obj.user,
            status="WON",
            created_at__date__gte=start,
            created_at__date__lt=end,
        )

    def get_achieved_amount(self, obj):
        total = sum((d.deal_value for d in self._won_deals_qs(obj)), 0)
        return float(total)

    def get_achievement_pct(self, obj):
        achieved = self.get_achieved_amount(obj)
        target = float(obj.target_amount) or 1
        return round((achieved / target) * 100, 1)

    def get_commission_earned(self, obj):
        achieved = self.get_achieved_amount(obj)
        return round(achieved * float(obj.commission_pct) / 100, 2)

    class Meta:
        model = SalesTarget
        fields = [
            "id", "organization", "user", "user_username",
            "period", "period_start", "target_amount", "commission_pct",
            "notes",
            "achieved_amount", "achievement_pct", "commission_earned",
            "created_at", "updated_at",
        ]
        read_only_fields = ["organization", "created_at", "updated_at"]


class SavedViewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = SavedView
        fields = "__all__"
        read_only_fields = ["organization", "created_at", "updated_at"]


class CallLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    lead_name = serializers.CharField(source="lead.name", read_only=True)
    deal_id = serializers.IntegerField(source="deal.id", read_only=True)

    class Meta:
        model = CallLog
        fields = "__all__"
        read_only_fields = ["organization", "user", "created_at"]


# ═══════════════════════════════════════════════════════════════════
# Phase 6 — Enterprise Operations Pack
# ═══════════════════════════════════════════════════════════════════


class ImportJobSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ImportJob
        fields = "__all__"
        read_only_fields = [
            "organization", "user", "status",
            "total_rows", "processed_rows", "succeeded_rows", "failed_rows",
            "error_log", "created_record_ids", "created_at", "completed_at",
        ]

    def get_file_url(self, obj):
        try:
            return obj.file.url if obj.file else None
        except Exception:
            return None


class DistributionRuleSerializer(serializers.ModelSerializer):
    eligible_user_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), required=False,
        source="eligible_users", write_only=True,
    )
    eligible_users_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DistributionRule
        fields = [
            "id", "name", "strategy", "is_active", "priority",
            "match_filter", "weights", "skills_required",
            "rr_cursor", "eligible_user_ids", "eligible_users_detail",
            "created_at", "updated_at",
        ]
        read_only_fields = ["rr_cursor", "created_at", "updated_at"]

    def get_eligible_users_detail(self, obj):
        return [
            {"id": u.id, "username": u.username, "role": u.role}
            for u in obj.eligible_users.all()
        ]


class AssignmentLogSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)
    lead_name = serializers.CharField(source="lead.name", read_only=True)
    rule_name = serializers.CharField(source="rule.name", read_only=True)

    class Meta:
        model = AssignmentLog
        fields = "__all__"


class UserSessionSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = UserSession
        fields = [
            "id", "user", "user_username", "jti", "user_agent", "ip_address",
            "device_label", "is_active", "revoked_at", "last_seen_at", "created_at",
            "is_current",
        ]
        read_only_fields = fields

    def get_is_current(self, obj):
        current_jti = self.context.get("current_jti")
        return bool(current_jti and current_jti == obj.jti)


class ApprovalStepSerializer(serializers.ModelSerializer):
    approver_username = serializers.CharField(source="approver.username", read_only=True)

    class Meta:
        model = ApprovalStep
        fields = "__all__"


class ApprovalRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    steps = ApprovalStepSerializer(many=True, read_only=True)
    current_approver = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRequest
        fields = [
            "id", "request_type", "title", "description", "payload",
            "approver_chain", "current_step", "status",
            "requester", "requester_username", "current_approver",
            "steps", "decided_at", "created_at", "updated_at",
        ]
        read_only_fields = ["requester", "current_step", "status", "decided_at", "created_at", "updated_at"]

    def get_current_approver(self, obj):
        chain = obj.approver_chain or []
        if obj.status != "PENDING" or obj.current_step >= len(chain):
            return None
        uid = chain[obj.current_step]
        user = User.objects.filter(pk=uid).first()
        return {"id": user.id, "username": user.username} if user else None


class APIKeySerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    key_preview = serializers.SerializerMethodField()

    class Meta:
        model = APIKey
        fields = [
            "id", "name", "key", "key_preview",
            "can_read", "can_write", "allowed_modules",
            "is_active", "last_used_at", "revoked_at", "expires_at",
            "created_by", "created_by_username", "created_at",
        ]
        read_only_fields = ["key", "key_preview", "last_used_at", "revoked_at", "created_by", "created_at"]

    def get_key_preview(self, obj):
        if not obj.key:
            return ""
        # Show only the first/last 4 chars in lists; full key returned only on creation.
        return f"{obj.key[:4]}…{obj.key[-4:]}"


# ═══════════════════════════════════════════════════════════════════
# Phase 7 — Enterprise Integrations Pack
# ═══════════════════════════════════════════════════════════════════


class AutomationRunSerializer(serializers.ModelSerializer):
    rule_name = serializers.CharField(source="rule.name", read_only=True)

    class Meta:
        model = AutomationRun
        fields = "__all__"


class DepartmentSerializer(serializers.ModelSerializer):
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), required=False,
        source="members", write_only=True,
    )
    member_count = serializers.SerializerMethodField()
    ticket_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "id", "name", "description", "email", "color", "is_active",
            "default_assignee", "member_ids", "member_count", "ticket_count",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_ticket_count(self, obj):
        return obj.tickets.count()


class SLAPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = SLAPolicy
        fields = "__all__"


class TicketMessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = TicketMessage
        fields = "__all__"
        read_only_fields = ["author", "author_type", "created_at"]


class TicketSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id", "number", "subject", "description",
            "status", "priority", "source",
            "department", "department_name",
            "assigned_to", "assigned_to_username",
            "customer_email", "customer_name", "customer_phone", "customer_lead",
            "sla_policy", "first_response_due", "resolution_due",
            "first_response_at", "resolved_at", "sla_breached", "escalated",
            "tags",
            "message_count", "last_message_at",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "number", "first_response_due", "resolution_due",
            "first_response_at", "resolved_at", "sla_breached", "escalated",
            "created_at", "updated_at",
        ]

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message_at(self, obj):
        last = obj.messages.order_by("-created_at").first()
        return last.created_at if last else None


class TicketDetailSerializer(TicketSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ["messages"]


class CannedReplySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = CannedReply
        fields = "__all__"
        read_only_fields = ["created_by", "usage_count", "created_at"]


class PortalTokenSerializer(serializers.ModelSerializer):
    token_preview = serializers.SerializerMethodField()
    linked_lead_name = serializers.CharField(source="linked_lead.name", read_only=True)
    magic_link = serializers.SerializerMethodField()

    class Meta:
        model = PortalToken
        fields = [
            "id", "email", "name", "token_preview", "magic_link",
            "linked_lead", "linked_lead_name",
            "is_active", "expires_at", "last_used_at", "created_at",
        ]
        read_only_fields = ["token_preview", "magic_link", "last_used_at", "created_at"]

    def get_token_preview(self, obj):
        return f"{obj.token[:6]}…{obj.token[-4:]}" if obj.token else ""

    def get_magic_link(self, obj):
        # Frontend Vite app should pick this up. The host is environment-specific
        # so we build a relative path; clients can prepend their PORTAL_BASE_URL.
        return f"/portal/login?t={obj.token}"


# ═══════════════════════════════════════════════════════════════════
# Phase 8 — Ecosystem & Intelligence Pack
# ═══════════════════════════════════════════════════════════════════


class KbCategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = KbCategory
        fields = "__all__"

    def get_article_count(self, obj):
        return obj.articles.filter(status="PUBLISHED").count()


class KbArticleListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = KbArticle
        fields = [
            "id", "title", "slug", "excerpt", "tags", "status", "is_public", "is_featured",
            "category", "category_name", "author", "author_username",
            "view_count", "helpful_count", "not_helpful_count",
            "published_at", "created_at", "updated_at",
        ]


class KbArticleDetailSerializer(KbArticleListSerializer):
    class Meta(KbArticleListSerializer.Meta):
        fields = KbArticleListSerializer.Meta.fields + ["body"]


class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = "__all__"


class FormSerializer(serializers.ModelSerializer):
    fields_detail = FormFieldSerializer(many=True, read_only=True, source="fields")

    class Meta:
        model = Form
        fields = [
            "id", "name", "slug", "description", "success_message", "redirect_url",
            "create_lead", "notify_email", "notify_user",
            "is_active", "submission_count",
            "fields_detail", "created_at", "updated_at",
        ]
        read_only_fields = ["submission_count", "created_at", "updated_at"]


class FormSubmissionSerializer(serializers.ModelSerializer):
    form_name = serializers.CharField(source="form.name", read_only=True)
    lead_name = serializers.CharField(source="lead.name", read_only=True)

    class Meta:
        model = FormSubmission
        fields = "__all__"


class SignatureSignerSerializer(serializers.ModelSerializer):
    sign_link = serializers.SerializerMethodField()

    class Meta:
        model = SignatureSigner
        fields = [
            "id", "name", "email", "phone", "order", "status",
            "signed_at", "ip_address", "sign_link",
        ]
        read_only_fields = fields

    def get_sign_link(self, obj):
        return f"/sign/{obj.token}"


class SignatureRequestSerializer(serializers.ModelSerializer):
    signers = SignatureSignerSerializer(many=True, read_only=True)
    requested_by_username = serializers.CharField(source="requested_by.username", read_only=True)

    class Meta:
        model = SignatureRequest
        fields = "__all__"
        read_only_fields = ["status", "completed_at", "signed_document", "created_at", "updated_at"]


class BackupJobSerializer(serializers.ModelSerializer):
    initiated_by_username = serializers.CharField(source="initiated_by.username", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = BackupJob
        fields = "__all__"
        read_only_fields = ["status", "file", "file_size_bytes", "record_count",
                             "error_message", "started_at", "completed_at"]

    def get_file_url(self, obj):
        try:
            return obj.file.url if obj.file else None
        except Exception:
            return None


class CloudConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudConnection
        fields = [
            "id", "provider", "account_email", "account_name",
            "scope", "is_active", "last_synced_at", "created_at",
            "token_expires_at",
        ]
        read_only_fields = fields


class AIRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = AIRequest
        fields = [
            "id", "kind", "provider", "model", "prompt", "response",
            "context", "tokens_used", "cost_cents", "success", "error_message",
            "user", "user_username", "created_at",
        ]


class PluginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plugin
        fields = "__all__"


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = [
            "id", "platform", "endpoint", "device_label",
            "is_active", "last_used_at", "created_at",
        ]
        read_only_fields = ["last_used_at", "created_at"]


class DashboardLayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardLayout
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]