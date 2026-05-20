from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, F, DecimalField, Value, Q
from django.db.models.functions import Coalesce, TruncMonth
from django.shortcuts import get_object_or_404

from .models import (
    Leads, Deal, Payment, Document, Task, TaskMessage,
    Organization, Pipeline, PipelineStage,
    AutomationRule, WhatsAppConfig, WhatsAppMessage,
    Plan, Subscription, Invoice,
    CustomField, CustomFieldValue,
    AuditLog, TwoFactorSecret, Notification,
    LeadScoreRule, LeadScoreHistory,
    SalesTarget, SavedView, CallLog,
)
from .serializers import (
    DashboardSerializer,
    LeadAdminAndStaffSerializer, LeadOtherSerializer,
    DealAdminSerializer, DealOtherSerializer,
    DocumentAdminSerializer, PaymentSerializer,
    TaskSerializer, TaskMessageSerializer,
    MeSerializer, AdminUserListSerializer, AdminUserWriteSerializer,
    OrganizationSerializer, PipelineSerializer,
    AutomationRuleSerializer, WhatsAppConfigSerializer, WhatsAppMessageSerializer,
    PlanSerializer, SubscriptionSerializer, InvoiceSerializer,
    CustomFieldSerializer, CustomFieldValueSerializer,
    AuditLogSerializer, TwoFactorStatusSerializer, NotificationSerializer,
    LeadScoreRuleSerializer, LeadScoreHistorySerializer,
    SalesTargetSerializer, SavedViewSerializer, CallLogSerializer,
)
from .tenancy import scope_qs, require_org, get_request_org
from .industry_templates import INDUSTRY_TEMPLATES, apply_template_to_org

User = get_user_model()


# ─────────────────────────────────────────────────────────────────
# Custom field write helper
# ─────────────────────────────────────────────────────────────────

def _save_custom_field_values(record, module, values_dict, organization):
    """Persist a {slug: value} dict into CustomFieldValue rows for a given record."""
    if not values_dict or not isinstance(values_dict, dict):
        return

    fields = {
        f.slug: f
        for f in CustomField.objects.filter(
            organization=organization, module=module, is_active=True,
        )
    }
    if not fields:
        return

    target_kwarg = {"lead": "lead", "deal": "deal", "task": "task"}.get(module)
    if not target_kwarg:
        return

    for slug, raw in values_dict.items():
        cf = fields.get(slug)
        if not cf:
            continue  # unknown slug — ignore (don't crash)

        defaults = {"value_text": "", "value_number": None, "value_date": None}

        if cf.field_type == "number":
            try:
                defaults["value_number"] = float(raw) if raw not in (None, "") else None
            except (TypeError, ValueError):
                continue
        elif cf.field_type in ("date", "datetime"):
            if raw:
                from django.utils.dateparse import parse_datetime, parse_date
                dt = parse_datetime(str(raw)) or parse_date(str(raw))
                if dt:
                    defaults["value_date"] = dt
        elif cf.field_type == "multiselect":
            defaults["value_text"] = "||".join(raw) if isinstance(raw, list) else str(raw or "")
        elif cf.field_type == "checkbox":
            defaults["value_text"] = "true" if raw in (True, "true", "1", 1, "yes") else "false"
        else:
            defaults["value_text"] = str(raw) if raw is not None else ""

        CustomFieldValue.objects.update_or_create(
            custom_field=cf, **{target_kwarg: record},
            defaults=defaults,
        )


class IsSuperUser(BasePermission):
    """Allow only Django superusers."""
    message = "Super admin access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )




# dashboard data 

# class Dashboard(APIView):

    # def get(self, request):

    #     # 1️⃣ Total Leads
    #     total_leads = Leads.objects.count()

    #     # 2️⃣ Total Deals
    #     total_deals = Deal.objects.count()

    #     # 3️⃣ Won Deals
    #     won_deals = Deal.objects.filter(status='WON').count()

    #     # 4️⃣ Cancelled Deals
    #     cancelled_deals = Deal.objects.filter(status='CANCELLED').count()

    #     # 5️⃣ Total Revenue (related_name: payments)
    #     total_revenue = Payment.objects.filter(
    #         deal__status='WON'
    #     ).aggregate(
    #         total=Coalesce(
    #             Sum('amount_paid'),
    #             Value(0),
    #             output_field=DecimalField()
    #         )
    #     )['total']

    #     # 6️⃣ Total Profit
    #     total_profit = Deal.objects.filter(
    #         status='WON'
    #     ).aggregate(
    #         profit=Coalesce(
    #             Sum(
    #                 F('deal_value') - Coalesce(
    #                     F('cost_price'),
    #                     Value(0),
    #                     output_field=DecimalField()
    #                 )
    #             ),
    #             Value(0),
    #             output_field=DecimalField()
    #         )
    #     )['profit']

    

        

    #     dashboard_data = {
    #         "total_leads": total_leads,
    #         "total_deals": total_deals,
    #         "won_deals": won_deals,
    #         "cancelled_deals": cancelled_deals,
    #         "total_revenue": total_revenue,
    #         "total_profit": total_profit,
            
    #     }

    #     serializer = DashboardSerializer(dashboard_data)

    #     return Response(serializer.data)

class Dashboard(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        leads_qs = scope_qs(Leads.objects.all(), request)
        deals_qs = scope_qs(Deal.objects.all(), request)
        payments_qs = Payment.objects.filter(deal__in=deals_qs)

        # Leads
        total_leads = leads_qs.count()

        # Deals
        total_deals = deals_qs.count()
        won_deals = deals_qs.filter(status="WON").count()
        cancelled_deals = deals_qs.filter(status="CANCELLED").count()

        # Revenue
        total_revenue = payments_qs.aggregate(
            total=Coalesce(
                Sum("amount_paid"),
                Value(0),
                output_field=DecimalField()
            )
        )["total"]

        # Profit
        total_profit = deals_qs.filter(status="WON").aggregate(
            profit=Coalesce(
                Sum(
                    F("deal_value") - Coalesce(
                        F("cost_price"),
                        Value(0),
                        output_field=DecimalField()
                    )
                ),
                Value(0),
                output_field=DecimalField()
            )
        )["profit"]

        dashboard_data = {
            "total_leads": total_leads,
            "total_deals": total_deals,
            "won_deals": won_deals,
            "cancelled_deals": cancelled_deals,
            "total_revenue": total_revenue,
            "total_profit": total_profit,
        }

        return Response(dashboard_data)

# lead data 

class LeadsData(APIView):

    permission_classes = [IsAuthenticated]

    # def get(self, request, lead_id=None):

    #     user = request.user

    #     if user.is_staff or user.role == 'ADMIN':
    #         queryset = Leads.objects.select_related('assigned_to').all()
    #         serializer_class = LeadAdminAndStaffSerializer
    #     else:
    #         queryset = Leads.objects.select_related('assigned_to').filter(
    #             assigned_to=user
    #         )
    #         serializer_class = LeadOtherSerializer

    #     # single lead
    #     if lead_id:
    #         lead = get_object_or_404(queryset, id=lead_id)
    #         serializer = serializer_class(lead)
    #         return Response(serializer.data)

    #     # list
    #     serializer = serializer_class(queryset, many=True)
    #     return Response(serializer.data)

    def get(self, request, lead_id=None):

        user = request.user

        base = scope_qs(
            Leads.objects.select_related("assigned_to", "organization"), request
        )

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            queryset = base
            serializer_class = LeadAdminAndStaffSerializer
        else:
            queryset = base.filter(assigned_to=user)
            serializer_class = LeadOtherSerializer

        if lead_id:
            lead = get_object_or_404(queryset, id=lead_id)
            return Response(serializer_class(lead).data)

        # Stats — uses dynamic statuses from queryset
        stats = queryset.aggregate(
            total_leads=Count("id"),
            new_leads=Count("id", filter=Q(status__iexact="NEW")),
            contacted_leads=Count("id", filter=Q(status__iexact="CONTACTED")),
            site_visit=Count("id", filter=Q(status__iexact="SITE_VISIT")),
            quotation_sent=Count("id", filter=Q(status__iexact="QUOTATION_SENT")),
            dealed=Count("id", filter=Q(status__in=["DEALED", "WON"])),
            cancelled=Count("id", filter=Q(status__in=["CANCELLED", "LOST"])),
        )

        return Response({
            "stats": stats,
            "leads": serializer_class(queryset, many=True).data,
        })

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response(
                {"error": "Super admin must include ?org=<slug> when creating tenant data."},
                status=400,
            )

        # Custom field values come in as {custom_fields: {slug: value, ...}}
        custom_values = request.data.get("custom_fields") if isinstance(request.data, dict) else None

        serializer = LeadAdminAndStaffSerializer(data=request.data)
        if serializer.is_valid():
            save_kwargs = {"organization": org}
            if not (request.user.is_staff or request.user.is_superuser
                    or request.user.role in ("ADMIN", "OWNER")):
                save_kwargs["assigned_to"] = request.user
            lead = serializer.save(**save_kwargs)
            _save_custom_field_values(lead, "lead", custom_values, org)
            # Re-serialize to include the custom field values we just wrote
            return Response(
                {"message": "Lead created successfully",
                 "lead": LeadAdminAndStaffSerializer(lead).data},
                status=201,
            )
        return Response(serializer.errors, status=400)

    def put(self, request, lead_id):
        user = request.user
        qs = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(qs, id=lead_id)

        if not (user.is_staff or user.is_superuser
                or user.role in ("ADMIN", "OWNER", "MANAGER")):
            if lead.assigned_to != user:
                return Response({"error": "Permission denied"}, status=403)

        custom_values = request.data.get("custom_fields") if isinstance(request.data, dict) else None

        serializer = LeadAdminAndStaffSerializer(lead, data=request.data, partial=True)
        if serializer.is_valid():
            lead = serializer.save()
            _save_custom_field_values(lead, "lead", custom_values, lead.organization)
            return Response(LeadAdminAndStaffSerializer(lead).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, lead_id):
        user = request.user
        qs = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(qs, id=lead_id)

        if not (user.is_staff or user.is_superuser
                or user.role in ("ADMIN", "OWNER", "MANAGER")):
            if lead.assigned_to != user:
                return Response({"error": "Permission denied"}, status=403)

        lead.delete()
        return Response({"message": "Lead deleted successfully"}, status=200)

# deal data 

class DealData(APIView):

    permission_classes = [IsAuthenticated]
    
    # def get(self, request, deal_id=None):
    #         user = request.user
    #         print("User in DealData GET:", user)

    #         # list all deal data 

    #         if user.is_staff or user.role == 'ADMIN':
    #             queryset = Deal.objects.select_related('lead').all()
    #             serializer = DealAdminSerializer(queryset, many=True)

    #         else:
    #             queryset = Deal.objects.select_related('lead').filter(
    #                 assigned_to=user
    #             )
    #             serializer = DealOtherSerializer(queryset, many=True)

    #         # single deal data
    #         if deal_id:
    #             if user.is_staff or user.role == 'ADMIN':
    #                 deal = get_object_or_404(Deal, id=deal_id)
    #                 serializer = DealAdminSerializer(deal)

    #             else:
    #                 deal = get_object_or_404(
    #                     Deal,
    #                     id=deal_id,
    #                     assigned_to=user
    #                 )
    #                 serializer = DealOtherSerializer(deal)

    #         return Response(serializer.data)

    def get(self, request, deal_id=None):

        user = request.user
        base = scope_qs(
            Deal.objects.select_related("lead", "assigned_to", "organization"), request
        )

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            queryset = base
            serializer_class = DealAdminSerializer
        else:
            queryset = base.filter(assigned_to=user)
            serializer_class = DealOtherSerializer

        if deal_id:
            deal = get_object_or_404(queryset, id=deal_id)
            return Response(serializer_class(deal).data)

        stats = queryset.aggregate(
            total_deals=Count("id"),
            open_deals=Count("id", filter=Q(status="OPEN")),
            won_deals=Count("id", filter=Q(status="WON")),
            cancelled_deals=Count("id", filter=Q(status="CANCELLED")),
        )
        return Response({
            "stats": stats,
            "deals": serializer_class(queryset, many=True).data,
        })

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response(
                {"error": "Super admin must include ?org=<slug> when creating tenant data."},
                status=400,
            )

        serializer = DealAdminSerializer(data=request.data)
        if serializer.is_valid():
            save_kwargs = {"organization": org}
            if not (request.user.is_staff or request.user.is_superuser
                    or request.user.role in ("ADMIN", "OWNER")):
                save_kwargs["assigned_to"] = request.user
            serializer.save(**save_kwargs)
            return Response(
                {"message": "Deal created successfully", "deal": serializer.data},
                status=201,
            )
        return Response({"error": "Invalid data", "details": serializer.errors}, status=400)

    def put(self, request, deal_id):
        user = request.user
        qs = scope_qs(Deal.objects.all(), request)

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            deal = get_object_or_404(qs, id=deal_id)
        else:
            deal = get_object_or_404(qs, id=deal_id, assigned_to=user)

        serializer = DealAdminSerializer(deal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Deal updated successfully", "deal": serializer.data})
        return Response({"error": "Invalid data", "details": serializer.errors}, status=400)

    def delete(self, request, deal_id):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER")):
            return Response({"error": "Permission denied"}, status=403)

        qs = scope_qs(Deal.objects.all(), request)
        deal = get_object_or_404(qs, id=deal_id)
        deal.delete()
        return Response({"message": "Deal deleted successfully"}, status=200)
            
        


class DocumnetData(APIView):

    permission_classes = [IsAuthenticated]

    # 🔹 LIST or RETRIEVE
    def get(self, request, doc_id=None):

        user = request.user
        base = Document.objects.select_related("lead")
        # Tenant scope via lead.organization
        base = scope_qs(base, request, field="lead__organization")

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            queryset = base
        else:
            queryset = base.filter(lead__assigned_to=user)

        # 👉 Single Document
        if doc_id:
            document = get_object_or_404(queryset, id=doc_id)
            serializer = DocumentAdminSerializer(document)
            return Response(serializer.data)

        # 👉 List
        serializer = DocumentAdminSerializer(queryset, many=True)
        return Response(serializer.data)
    
    # create document

    def post(self, request):

        user = request.user
        serializer = DocumentAdminSerializer(data=request.data)

        if serializer.is_valid():

            lead = serializer.validated_data.get("lead")

            # Non-admin user check
            if not (user.is_staff or user.role == "ADMIN"):
                if lead.assigned_to != user:
                    return Response(
                        {"error": "You can only add document to your assigned leads"},
                        status=403
                    )

            serializer.save()

            return Response({
                "message": "Document created successfully",
                "data": serializer.data
            }, status=201)
        
        return Response({
            "error": "Invalid Data",
            "details": serializer.errors
        }, status=400)

    # 🔹 UPDATE
    def put(self, request, doc_id):

        user = request.user
        base = scope_qs(Document.objects.all(), request, field="lead__organization")

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            document = get_object_or_404(base, id=doc_id)
        else:
            document = get_object_or_404(base, id=doc_id, lead__assigned_to=user)

        serializer = DocumentAdminSerializer(document, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Document updated successfully",
                "data": serializer.data
            })

        return Response({
            "error": "Invalid Data",
            "details": serializer.errors
        }, status=400)

    # 🔹 DELETE
    def delete(self, request, doc_id):

        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER")):
            return Response({"error": "Permission denied"}, status=403)

        base = scope_qs(Document.objects.all(), request, field="lead__organization")
        document = get_object_or_404(base, id=doc_id)
        document.delete()
        return Response({"message": "Document deleted successfully"})
    


# Payment Document view here

class PaymentDocuments(APIView):
    
    permission_classes = [IsAuthenticated]

    # get all data or single data

    # def get(self, request, payment_id = None):
    #     user = request.user

    #     # for all user show all data 

    #     if user.is_staff or user.role == 'ADMIN':
    #         queryset = Payment.objects.select_related('deal').all()
    #     else:
    #         queryset = Payment.objects.select_related('deal').filter(
    #             deal__assigned_to=user
    #         )

    #     # for single data
    #     if payment_id:
    #         payment = get_object_or_404(queryset, id=payment_id)
    #         serializer = PaymentSerializer(payment)
    #         return Response(serializer.data)
        
    #     serializer = PaymentSerializer(queryset, many=True)

    #     return Response(serializer.data)
        
    def get(self, request, payment_id=None):

        user = request.user
        base = scope_qs(
            Payment.objects.select_related("deal"), request, field="deal__organization"
        )

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            queryset = base
        else:
            queryset = base.filter(deal__assigned_to=user)

        # single payment
        if payment_id:
            payment = get_object_or_404(queryset, id=payment_id)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)

        # payment stats
        stats = queryset.aggregate(
            total_payments=Count("id"),
            booked_payments=Count("id", filter=Q(payment_stage="BOOKED")),
            partial_payments=Count("id", filter=Q(payment_stage="PARTIAL")),
            full_payments=Count("id", filter=Q(payment_stage="FULL")),
            total_amount_paid=Sum("amount_paid"),
        )

        serializer = PaymentSerializer(queryset, many=True)

        return Response({
            "stats": stats,
            "payments": serializer.data
        })


    # create payment data = any one can create payment data but if user is admin or staff then they can assign payment to any one but if user is other than admin or staff then payment will be automatically assigned to them based on deal assigned to them

    def post(self, request):
        user = request.user
        serializer = PaymentSerializer(data=request.data)

        if serializer.is_valid():

            deal = serializer.validated_data.get("deal")

            # Non-admin user check

            if not (user.is_staff or user.role == "ADMIN"):
                if deal.assigned_to != user:
                    return Response(
                        {"error": "You can only add payment to your assigned deals"},
                        status=403
                    )
            serializer.save()
            return Response({
                "message": "Payment created successfully",
                "data": serializer.data
            }, status=201)

        return Response({
            "error": "Invalid Data",
            "details": serializer.errors
        }, status=400)

    # update payment data = any one can update payment data but if user is admin or staff then they can update any payment data but if user is other than admin or staff then they can update only their assigned payment data based on deal assigned to them

    def put(self, request, payment_id):
        user = request.user
        base = scope_qs(Payment.objects.all(), request, field="deal__organization")

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            payment = get_object_or_404(base, id=payment_id)
        else:
            payment = get_object_or_404(base, id=payment_id, deal__assigned_to=user)

        serializer = PaymentSerializer(payment, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Payment updated successfully",
                "data": serializer.data
            })
        
        return Response({
            "error": "Invalid Data",
            "details": serializer.errors
        }, status=400)

    # delete payment data = only admin or staff can delete payment data
    def delete(self, request, payment_id):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER")):
            return Response({"error": "Permission denied"}, status=403)

        base = scope_qs(Payment.objects.all(), request, field="deal__organization")
        payment = get_object_or_404(base, id=payment_id)
        payment.delete()
        return Response({"message": "Payment deleted successfully"}, status=200)





# Task assign here 

class TaskData(APIView):

    permission_classes = [IsAuthenticated]

    # GET tasks
    def get(self, request, task_id=None):

        user = request.user
        base = scope_qs(
            Task.objects.select_related("assigned_to", "created_by", "organization"),
            request,
        )

        if user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER"):
            queryset = base
        else:
            queryset = base.filter(assigned_to=user)

        # single task
        if task_id:
            task = get_object_or_404(queryset, id=task_id)
            serializer = TaskSerializer(task)
            return Response(serializer.data)

        # task statistics
        stats = queryset.aggregate(
            total_tasks=Count("id"),
            pending_tasks=Count("id", filter=Q(status="PENDING")),
            in_progress_tasks=Count("id", filter=Q(status="IN_PROGRESS")),
            completed_tasks=Count("id", filter=Q(status="COMPLETED")),
        )

        serializer = TaskSerializer(queryset, many=True)

        return Response({
            "stats": stats,
            "tasks": serializer.data
        })
    
    # CREATE task
    def post(self, request):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER")):
            return Response({"error": "Only admin / manager can create tasks"}, status=403)

        org = require_org(request)
        if org is None:
            return Response(
                {"error": "Super admin must include ?org=<slug> when creating tenant data."},
                status=400,
            )

        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=user, organization=org)
            return Response({"message": "Task created successfully", "data": serializer.data}, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, task_id):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER")):
            return Response({"error": "Only admin / manager can update tasks"}, status=403)

        qs = scope_qs(Task.objects.all(), request)
        task = get_object_or_404(qs, id=task_id)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Task updated successfully", "data": serializer.data})
        return Response(serializer.errors, status=400)

    def delete(self, request, task_id):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER")):
            return Response({"error": "Permission denied"}, status=403)

        qs = scope_qs(Task.objects.all(), request)
        task = get_object_or_404(qs, id=task_id)
        task.delete()
        return Response({"message": "Task deleted successfully"})
    


# task messege

class TaskMessageView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):

        qs = scope_qs(Task.objects.all(), request)
        task = get_object_or_404(qs, id=task_id)

        serializer = TaskMessageSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(
                user=request.user,
                task=task
            )

            return Response({
                "message": "Message sent successfully",
                "data": serializer.data
            }, status=201)

        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────────────────────────
# Current user
# ─────────────────────────────────────────────────────────────────

class Me(APIView):
    """Return the profile of the currently authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


# ─────────────────────────────────────────────────────────────────
# SUPER-ADMIN endpoints
# ─────────────────────────────────────────────────────────────────

class AdminSystemStats(APIView):
    """Aggregated stats for the super-admin overview.

    Super-admin sees platform-wide totals by default. Pass ?org=<slug> to scope
    everything to a single tenant.
    """
    permission_classes = [IsSuperUser]

    def get(self, request):
        org = get_request_org(request, allow_cross_tenant=True)

        users_qs    = User.objects.all() if org is None else User.objects.filter(organization=org)
        leads_qs    = Leads.objects.all() if org is None else Leads.objects.filter(organization=org)
        deals_qs    = Deal.objects.all() if org is None else Deal.objects.filter(organization=org)
        tasks_qs    = Task.objects.all() if org is None else Task.objects.filter(organization=org)
        payments_qs = Payment.objects.all() if org is None else Payment.objects.filter(deal__organization=org)
        documents_qs = Document.objects.all() if org is None else Document.objects.filter(lead__organization=org)

        users_by_role = list(
            users_qs.values("role").annotate(count=Count("id")).order_by("role")
        )
        users_total = users_qs.count()
        users_active = users_qs.filter(is_active=True).count()
        users_admins = users_qs.filter(is_superuser=True).count()

        leads_total = leads_qs.count()
        leads_by_status = list(
            leads_qs.values("status").annotate(count=Count("id")).order_by("status")
        )
        leads_by_source = list(
            leads_qs.values("leads_source").annotate(count=Count("id"))
        )
        leads_by_brand = list(
            leads_qs.exclude(brand_name="").values("brand_name").annotate(count=Count("id"))
        )

        deals_total = deals_qs.count()
        deals_by_status = list(
            deals_qs.values("status").annotate(count=Count("id"))
        )
        deal_value = deals_qs.aggregate(
            won=Coalesce(
                Sum("deal_value", filter=Q(status="WON")),
                Value(0), output_field=DecimalField(),
            ),
            open=Coalesce(
                Sum("deal_value", filter=Q(status="OPEN")),
                Value(0), output_field=DecimalField(),
            ),
        )

        payments_total = payments_qs.count()
        revenue = payments_qs.aggregate(
            total=Coalesce(Sum("amount_paid"), Value(0), output_field=DecimalField())
        )["total"]

        profit = deals_qs.filter(status="WON").aggregate(
            p=Coalesce(
                Sum(F("deal_value") - Coalesce(
                    F("cost_price"), Value(0), output_field=DecimalField()
                )),
                Value(0), output_field=DecimalField(),
            )
        )["p"]

        top_performers = list(
            deals_qs
            .filter(status="WON", assigned_to__isnull=False)
            .values("assigned_to__username")
            .annotate(won_value=Sum("deal_value"), won_count=Count("id"))
            .order_by("-won_value")[:5]
        )

        deals_by_month = list(
            deals_qs
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"), value=Sum("deal_value"))
            .order_by("-month")[:6]
        )

        documents_total = documents_qs.count()
        tasks_total = tasks_qs.count()
        tasks_by_status = list(
            tasks_qs.values("status").annotate(count=Count("id"))
        )

        return Response({
            "scope": {"org": org.slug if org else None},
            "users": {
                "total": users_total,
                "active": users_active,
                "superusers": users_admins,
                "by_role": users_by_role,
            },
            "leads": {
                "total": leads_total,
                "by_status": leads_by_status,
                "by_source": leads_by_source,
                "by_brand": leads_by_brand,
            },
            "deals": {
                "total": deals_total,
                "by_status": deals_by_status,
                "won_value": deal_value["won"],
                "open_value": deal_value["open"],
                "profit": profit,
                "by_month": deals_by_month,
            },
            "payments": {
                "total": payments_total,
                "revenue": revenue,
            },
            "documents": {"total": documents_total},
            "tasks": {
                "total": tasks_total,
                "by_status": tasks_by_status,
            },
            "top_performers": top_performers,
        })


class AdminUsers(APIView):
    """Super-admin: list users + create."""
    permission_classes = [IsSuperUser]

    def get(self, request):
        org = get_request_org(request, allow_cross_tenant=True)
        qs = User.objects.all() if org is None else User.objects.filter(organization=org)
        qs = (
            qs.select_related("organization")
              .annotate(
                  lead_count=Count("leads", distinct=True),
                  deal_count=Count("deals", distinct=True),
              )
              .order_by("-date_joined")
        )
        return Response(AdminUserListSerializer(qs, many=True).data)

    def post(self, request):
        data = request.data.copy()
        password = data.pop("password", None)
        if not password or len(str(password)) < 8:
            return Response(
                {"error": "password is required and must be at least 8 characters"},
                status=400,
            )

        # Attach organization
        org_slug = data.pop("org", None)
        organization = None
        if org_slug:
            organization = get_object_or_404(Organization, slug=org_slug)
        else:
            organization = require_org(request)

        serializer = AdminUserWriteSerializer(data=data)
        if serializer.is_valid():
            payload = dict(serializer.validated_data)
            user = User(**payload)
            if organization:
                user.organization = organization
            user.set_password(password if isinstance(password, str) else password[0])
            user.save()
            return Response(
                {"message": "User created", "user": MeSerializer(user).data},
                status=201,
            )
        return Response(serializer.errors, status=400)


class AdminUserDetail(APIView):
    """Super-admin: update / delete a single user."""
    permission_classes = [IsSuperUser]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        return Response(MeSerializer(user).data)

    def patch(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        serializer = AdminUserWriteSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User updated",
                "user": MeSerializer(user).data,
            })
        return Response(serializer.errors, status=400)

    def delete(self, request, user_id):
        if request.user.id == user_id:
            return Response({"error": "You cannot delete yourself."}, status=400)
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({"message": "User deleted"}, status=200)


# ─────────────────────────────────────────────────────────────────
# Pipelines (per-org configurable status pipelines)
# ─────────────────────────────────────────────────────────────────

class PipelineList(APIView):
    """List pipelines for the requesting user's org. Optionally filter by module."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(Pipeline.objects.all(), request).prefetch_related("stages")
        module = request.query_params.get("module")
        if module:
            qs = qs.filter(module=module)
        return Response(PipelineSerializer(qs, many=True).data)


# ─────────────────────────────────────────────────────────────────
# Organizations (super-admin platform management)
# ─────────────────────────────────────────────────────────────────

class OrganizationList(APIView):
    """Super-admin: list all organizations + create new."""
    permission_classes = [IsSuperUser]

    def get(self, request):
        qs = (
            Organization.objects
            .select_related("owner")
            .annotate(
                user_count=Count("users", distinct=True),
                lead_count=Count("leads", distinct=True),
                deal_count=Count("deals", distinct=True),
            )
            .order_by("-created_at")
        )
        return Response(OrganizationSerializer(qs, many=True).data)

    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            org = serializer.save()
            # Seed default pipelines for the new org
            for module, stages in (
                ("lead", [
                    ("NEW", "New", "#38bdf8", 0, False, False),
                    ("CONTACTED", "Contacted", "#3b82f6", 1, False, False),
                    ("QUALIFIED", "Qualified", "#a78bfa", 2, False, False),
                    ("PROPOSAL_SENT", "Proposal Sent", "#facc15", 3, False, False),
                    ("WON", "Won", "#10b981", 4, True, False),
                    ("LOST", "Lost", "#ef4444", 5, False, True),
                ]),
                ("deal", [
                    ("OPEN", "Open", "#38bdf8", 0, False, False),
                    ("WON", "Won", "#10b981", 1, True, False),
                    ("CANCELLED", "Cancelled", "#ef4444", 2, False, True),
                ]),
            ):
                pipe = Pipeline.objects.create(
                    organization=org, module=module, name="Default", is_default=True
                )
                for slug, name, color, order, won, lost in stages:
                    PipelineStage.objects.create(
                        pipeline=pipe, slug=slug, name=name, color=color,
                        order=order, is_closed_won=won, is_closed_lost=lost,
                    )
            return Response(
                {"message": "Organization created", "organization": OrganizationSerializer(org).data},
                status=201,
            )
        return Response(serializer.errors, status=400)


class OrganizationDetail(APIView):
    """Super-admin: update / suspend / delete an org."""
    permission_classes = [IsSuperUser]

    def get(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        return Response(OrganizationSerializer(org).data)

    def patch(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        serializer = OrganizationSerializer(org, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Organization updated", "organization": serializer.data})
        return Response(serializer.errors, status=400)

    def delete(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        if org.slug == "default":
            return Response({"error": "Cannot delete the default organization."}, status=400)
        org.delete()
        return Response({"message": "Organization deleted"}, status=200)


# ════════════════════════════════════════════════════════════════
#  PLATFORM EXTENSIONS — stub views
#  Persist + serve data; heavy execution NOT implemented yet.
# ════════════════════════════════════════════════════════════════


# ─── 1. Automation rules ─────────────────────────────────────────

class AutomationRuleList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(AutomationRule.objects.all(), request).order_by("-created_at")
        return Response(AutomationRuleSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        s = AutomationRuleSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org, created_by=request.user)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AutomationRuleDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, rule_id):
        rule = get_object_or_404(scope_qs(AutomationRule.objects.all(), request), id=rule_id)
        return Response(AutomationRuleSerializer(rule).data)

    def patch(self, request, rule_id):
        rule = get_object_or_404(scope_qs(AutomationRule.objects.all(), request), id=rule_id)
        s = AutomationRuleSerializer(rule, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, rule_id):
        rule = get_object_or_404(scope_qs(AutomationRule.objects.all(), request), id=rule_id)
        rule.delete()
        return Response({"message": "Rule deleted"})


# ─── 2. WhatsApp ─────────────────────────────────────────────────

class WhatsAppConfigView(APIView):
    """GET / PUT the WhatsApp config for the current org. Send: NOT IMPLEMENTED."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        cfg, _ = WhatsAppConfig.objects.get_or_create(organization=org)
        return Response(WhatsAppConfigSerializer(cfg).data)

    def put(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        cfg, _ = WhatsAppConfig.objects.get_or_create(organization=org)
        s = WhatsAppConfigSerializer(cfg, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)


class WhatsAppMessageList(APIView):
    """List + log messages. Actual WhatsApp Business API integration: NOT IMPLEMENTED."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(WhatsAppMessage.objects.all(), request)[:200]
        return Response(WhatsAppMessageSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        s = WhatsAppMessageSerializer(data=request.data)
        if s.is_valid():
            # Stub: persist as PENDING, do NOT actually call WhatsApp API.
            msg = s.save(organization=org, status="PENDING")
            return Response(
                {"message": "Logged (stub — WhatsApp send not yet implemented)",
                 "data": WhatsAppMessageSerializer(msg).data},
                status=201,
            )
        return Response(s.errors, status=400)


# ─── 3. Billing ──────────────────────────────────────────────────

class PlanList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PlanSerializer(Plan.objects.filter(is_active=True), many=True).data)


class CurrentSubscription(APIView):
    """GET / POST subscription for the requesting org. Razorpay: NOT IMPLEMENTED."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        sub = Subscription.objects.filter(organization=org).first()
        if not sub:
            return Response({"detail": "No subscription"}, status=404)
        return Response(SubscriptionSerializer(sub).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        plan_slug = request.data.get("plan")
        plan = get_object_or_404(Plan, slug=plan_slug)
        sub, _ = Subscription.objects.update_or_create(
            organization=org,
            defaults={"plan": plan, "status": "TRIAL"},
        )
        return Response({
            "message": "Subscription set (stub — Razorpay checkout not yet implemented)",
            "data": SubscriptionSerializer(sub).data,
        }, status=201)


class InvoiceList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(Invoice.objects.all(), request).order_by("-created_at")
        return Response(InvoiceSerializer(qs, many=True).data)


class BillingCheckout(APIView):
    """Razorpay checkout creation. Currently returns a stub response."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({
            "stub": True,
            "message": "Razorpay checkout not implemented yet.",
            "next_steps": [
                "Wire RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET into .env",
                "Use razorpay-python SDK to create Subscription / Order",
                "Implement /api/billing/webhook/ for payment status callbacks",
            ],
        }, status=200)


# ─── 4. Custom Fields ────────────────────────────────────────────

class CustomFieldList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(CustomField.objects.all(), request).filter(is_active=True)
        module = request.query_params.get("module")
        if module:
            qs = qs.filter(module=module)
        return Response(CustomFieldSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required."}, status=400)
        s = CustomFieldSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class CustomFieldDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, field_id):
        f = get_object_or_404(scope_qs(CustomField.objects.all(), request), id=field_id)
        s = CustomFieldSerializer(f, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, field_id):
        f = get_object_or_404(scope_qs(CustomField.objects.all(), request), id=field_id)
        f.delete()
        return Response({"message": "Custom field deleted"})


# ─── 5. Audit logs ───────────────────────────────────────────────

class AuditLogList(APIView):
    """Read-only. Super-admin sees all; org users see only their org."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(AuditLog.objects.select_related("user", "organization"), request)
        qs = qs.order_by("-created_at")[:500]
        return Response(AuditLogSerializer(qs, many=True).data)


# ─── 6. Two-Factor Authentication ────────────────────────────────

class TwoFactorStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        secret = TwoFactorSecret.objects.filter(user=request.user).first()
        if not secret:
            return Response({"is_enabled": False, "configured": False})
        return Response({
            **TwoFactorStatusSerializer(secret).data,
            "configured": True,
        })


class TwoFactorSetup(APIView):
    """Generate a fresh TOTP secret + otpauth:// URI for QR display.

    Flow:
      1. POST /api/2fa/setup/  → returns {secret, otpauth_uri, qr_png_base64}
      2. User scans QR with Google Authenticator / Authy / 1Password
      3. POST /api/2fa/verify/ with the 6-digit code → enables 2FA
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        import base64, io
        import pyotp
        import qrcode

        # Always issue a fresh secret on setup (overwrites any prior unverified attempt)
        secret_b32 = pyotp.random_base32()
        TwoFactorSecret.objects.update_or_create(
            user=request.user,
            defaults={"secret": secret_b32, "is_enabled": False},
        )

        issuer = "CRM Suite"
        label = f"{issuer}:{request.user.username}"
        otpauth_uri = pyotp.totp.TOTP(secret_b32).provisioning_uri(
            name=request.user.username, issuer_name=issuer,
        )

        # Render QR as PNG → base64 (frontend renders <img src="data:image/png;base64,...">)
        img = qrcode.make(otpauth_uri)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        qr_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        return Response({
            "secret": secret_b32,           # show once so user can also enter manually
            "otpauth_uri": otpauth_uri,
            "qr_png_base64": qr_b64,
            "issuer": issuer,
            "label": label,
        })


class TwoFactorVerify(APIView):
    """Verify a 6-digit TOTP code. On success, mark is_enabled=True and emit backup codes."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        import pyotp, secrets
        from django.utils import timezone

        code = str(request.data.get("code", "")).strip().replace(" ", "")
        if not code or not code.isdigit() or len(code) != 6:
            return Response({"error": "Enter the 6-digit code from your authenticator app."}, status=400)

        tf = TwoFactorSecret.objects.filter(user=request.user).first()
        if not tf:
            return Response({"error": "Run /api/2fa/setup/ first."}, status=400)

        totp = pyotp.TOTP(tf.secret)
        if not totp.verify(code, valid_window=1):  # ±30s leeway
            return Response({"error": "Invalid code. Try again."}, status=400)

        # Generate backup codes only on first enable
        if not tf.is_enabled:
            tf.backup_codes = [
                "-".join([secrets.token_hex(2).upper() for _ in range(3)])  # AB12-CD34-EF56
                for _ in range(8)
            ]

        tf.is_enabled = True
        tf.enabled_at = timezone.now()
        tf.last_used_at = timezone.now()
        tf.save()

        return Response({
            "message": "2FA enabled successfully.",
            "backup_codes": tf.backup_codes,  # show once; user must save them
        })


class TwoFactorDisable(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        TwoFactorSecret.objects.filter(user=request.user).delete()
        return Response({"message": "2FA disabled. Your account no longer requires a second factor."})


# ─── 7. Notifications ────────────────────────────────────────────

class NotificationList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user).order_by("-created_at")[:100]
        unread = Notification.objects.filter(user=request.user, read=False).count()
        return Response({
            "unread_count": unread,
            "notifications": NotificationSerializer(qs, many=True).data,
        })


class NotificationMarkRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        from django.utils import timezone
        n = get_object_or_404(Notification, id=notification_id, user=request.user)
        if not n.read:
            n.read = True
            n.read_at = timezone.now()
            n.save(update_fields=["read", "read_at"])
        return Response(NotificationSerializer(n).data)


class NotificationMarkAllRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.utils import timezone
        updated = Notification.objects.filter(user=request.user, read=False).update(
            read=True, read_at=timezone.now(),
        )
        return Response({"message": f"Marked {updated} notification(s) as read"})


# ─── 8. Drag-drop pipeline stage reorder ─────────────────────────

class PipelineStageReorder(APIView):
    """POST {"stages": [{"id": 1, "order": 0}, ...]} to reorder. NOT IMPLEMENTED: actual lead remap."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pipeline_id):
        pipeline = get_object_or_404(scope_qs(Pipeline.objects.all(), request), id=pipeline_id)
        stages = request.data.get("stages", [])
        for s in stages:
            PipelineStage.objects.filter(pipeline=pipeline, id=s.get("id")).update(order=s.get("order", 0))
        return Response({"message": f"Reordered {len(stages)} stage(s)"})


# ════════════════════════════════════════════════════════════════
#  PHASE 5 — Enterprise Foundation Pack views
# ════════════════════════════════════════════════════════════════


# ─── 1. Lead Scoring ─────────────────────────────────────────────

class LeadScoreRuleList(APIView):
    """List + bulk-upsert lead score rules for the org. Admin only."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(LeadScoreRule.objects.all(), request)
        return Response(LeadScoreRuleSerializer(qs, many=True).data)

    def post(self, request):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER")):
            return Response({"error": "Admin only"}, status=403)
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required"}, status=400)
        s = LeadScoreRuleSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class LeadScoreRuleDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, rule_id):
        rule = get_object_or_404(scope_qs(LeadScoreRule.objects.all(), request), id=rule_id)
        s = LeadScoreRuleSerializer(rule, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, rule_id):
        rule = get_object_or_404(scope_qs(LeadScoreRule.objects.all(), request), id=rule_id)
        rule.delete()
        return Response({"message": "Rule deleted"})


class LeadScoreHistoryView(APIView):
    """History of score changes for one lead."""
    permission_classes = [IsAuthenticated]

    def get(self, request, lead_id):
        lead_qs = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(lead_qs, id=lead_id)
        history = LeadScoreHistory.objects.filter(lead=lead)[:100]
        return Response({
            "lead_id": lead.id,
            "score": lead.score,
            "priority": lead.priority,
            "history": LeadScoreHistorySerializer(history, many=True).data,
        })


# ─── 2. Duplicate Detection ──────────────────────────────────────

class LeadDuplicates(APIView):
    """
    For one lead, find org-scoped duplicates by email OR phone (last 10 digits match).
    GET  /api/leads/<lead_id>/duplicates/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lead_id):
        base = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(base, id=lead_id)
        matches = self._find(lead, base)
        return Response({
            "lead_id": lead.id,
            "duplicate_count": len(matches),
            "duplicates": LeadOtherSerializer(matches, many=True).data,
        })

    @staticmethod
    def _find(lead, base_qs):
        """Find leads in same org with matching phone (last 10) or email (case-insensitive)."""
        from django.db.models import Q
        last10 = "".join(c for c in (lead.phone or "") if c.isdigit())[-10:]
        q = Q()
        if last10 and len(last10) == 10:
            q |= Q(phone__endswith=last10)
        if lead.email:
            q |= Q(email__iexact=lead.email)
        if not q:
            return []
        return base_qs.filter(q).exclude(id=lead.id)[:20]


class LeadDuplicateMerge(APIView):
    """
    Merge `source` lead into `target`. Source's deals, documents, payments, tasks,
    call logs all reparent to target. Source is then deleted. Target's score is
    boosted by the sum of merged-from source's score (capped at 100).

    POST /api/leads/merge/   {"target_id": 1, "source_id": 2}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER")):
            return Response({"error": "Admin/Manager only"}, status=403)

        target_id = request.data.get("target_id")
        source_id = request.data.get("source_id")
        if not target_id or not source_id or target_id == source_id:
            return Response({"error": "target_id and source_id required and must differ"}, status=400)

        base = scope_qs(Leads.objects.all(), request)
        target = get_object_or_404(base, id=target_id)
        source = get_object_or_404(base, id=source_id)
        if target.organization_id != source.organization_id:
            return Response({"error": "Cross-org merge blocked"}, status=400)

        # Reparent child records
        Deal.objects.filter(lead=source).update(lead=target)
        Document.objects.filter(lead=source).update(lead=target)
        CallLog.objects.filter(lead=source).update(lead=target)
        # Bump target score
        target.score = min(100, (target.score or 0) + (source.score or 0) // 2)
        target.priority = "HOT" if target.score >= 70 else ("WARM" if target.score >= 40 else "COLD")
        # Append source's notes
        if source.notes:
            target.notes = (target.notes or "") + f"\n[merged from #{source.id}] {source.notes}"
        target.save(update_fields=["score", "priority", "notes"])
        source.delete()

        return Response({
            "message": f"Merged lead #{source_id} into #{target_id}",
            "target": LeadAdminAndStaffSerializer(target).data,
        })


# ─── 3. Sales Targets & Commissions ──────────────────────────────

class SalesTargetList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(SalesTarget.objects.select_related("user"), request)
        return Response(SalesTargetSerializer(qs, many=True).data)

    def post(self, request):
        user = request.user
        if not (user.is_staff or user.is_superuser or user.role in ("ADMIN", "OWNER", "MANAGER")):
            return Response({"error": "Admin/Manager only"}, status=403)
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required"}, status=400)
        s = SalesTargetSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class SalesTargetDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, target_id):
        t = get_object_or_404(scope_qs(SalesTarget.objects.all(), request), id=target_id)
        s = SalesTargetSerializer(t, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, target_id):
        t = get_object_or_404(scope_qs(SalesTarget.objects.all(), request), id=target_id)
        t.delete()
        return Response({"message": "Target deleted"})


class SalesLeaderboard(APIView):
    """Top performers for the org based on won deals in a period (defaults to current month)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from datetime import date
        # Period defaults to current month
        today = date.today()
        period_start = today.replace(day=1)

        deals_qs = scope_qs(Deal.objects.all(), request).filter(
            status="WON",
            created_at__date__gte=period_start,
        )
        rows = list(
            deals_qs.filter(assigned_to__isnull=False)
            .values("assigned_to__id", "assigned_to__username")
            .annotate(
                won_value=Sum("deal_value"),
                won_count=Count("id"),
            )
            .order_by("-won_value")[:20]
        )
        return Response({
            "period_start": period_start,
            "leaderboard": rows,
        })


# ─── 4. Saved Views ──────────────────────────────────────────────

class SavedViewList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # User sees: their own views + shared views in their org
        org_views = scope_qs(SavedView.objects.all(), request)
        qs = org_views.filter(Q(user=request.user) | Q(is_shared=True))
        module = request.query_params.get("module")
        if module:
            qs = qs.filter(module=module)
        return Response(SavedViewSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required"}, status=400)
        s = SavedViewSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org, user=request.user)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class SavedViewDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, view_id):
        v = get_object_or_404(scope_qs(SavedView.objects.all(), request), id=view_id)
        if v.user_id and v.user_id != request.user.id and not request.user.is_superuser:
            return Response({"error": "Can only edit your own views"}, status=403)
        s = SavedViewSerializer(v, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, view_id):
        v = get_object_or_404(scope_qs(SavedView.objects.all(), request), id=view_id)
        if v.user_id and v.user_id != request.user.id and not request.user.is_superuser:
            return Response({"error": "Can only delete your own views"}, status=403)
        v.delete()
        return Response({"message": "View deleted"})


# ─── 5. Call Logs ────────────────────────────────────────────────

class CallLogList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(CallLog.objects.select_related("user", "lead"), request)
        # Optional filter
        lead_id = request.query_params.get("lead")
        if lead_id:
            qs = qs.filter(lead_id=lead_id)

        # Aggregate stats
        stats = qs.aggregate(
            total_calls=Count("id"),
            total_duration=Coalesce(Sum("duration_seconds"), Value(0)),
            connected=Count("id", filter=Q(outcome="CONNECTED")),
            converted=Count("id", filter=Q(outcome="CONVERTED")),
            no_answer=Count("id", filter=Q(outcome="NO_ANSWER")),
        )
        return Response({
            "stats": stats,
            "call_logs": CallLogSerializer(qs[:200], many=True).data,
        })

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Org required"}, status=400)
        s = CallLogSerializer(data=request.data)
        if s.is_valid():
            s.save(organization=org, user=request.user)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


# ─── 6. Industry Templates ───────────────────────────────────────

class IndustryTemplateList(APIView):
    """Read-only list of available templates."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        result = []
        for slug, tpl in INDUSTRY_TEMPLATES.items():
            result.append({
                "slug": slug,
                "name": tpl["name"],
                "lead_stages": [s[0] for s in tpl["lead_stages"]],
                "deal_stages": [s[0] for s in tpl["deal_stages"]],
                "custom_field_count": len(tpl.get("custom_fields", [])),
                "custom_fields": [{"slug": f[0], "name": f[1], "type": f[2]}
                                  for f in tpl.get("custom_fields", [])],
            })
        return Response(result)


class IndustryTemplateApply(APIView):
    """
    Apply a template's stages + custom fields + scoring rules to an organization.
    Super admin only (since it can mutate pipeline definitions).

    POST /api/admin/organizations/<org_id>/apply-template/
        body: {"template": "REAL_ESTATE", "replace_pipelines": false}
    """
    permission_classes = [IsSuperUser]

    def post(self, request, org_id):
        org = get_object_or_404(Organization, id=org_id)
        template_slug = (request.data.get("template") or "").upper()
        if template_slug not in INDUSTRY_TEMPLATES:
            return Response(
                {"error": f"Unknown template. Available: {list(INDUSTRY_TEMPLATES.keys())}"},
                status=400,
            )
        replace = bool(request.data.get("replace_pipelines", False))
        try:
            summary = apply_template_to_org(org, template_slug, replace_pipelines=replace)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        # Also update the org's industry field to match
        org.industry = template_slug if template_slug != "GENERAL" else org.industry
        org.save(update_fields=["industry"])
        return Response({
            "message": f"Template '{template_slug}' applied to {org.slug}",
            "summary": summary,
        })


# ═══════════════════════════════════════════════════════════════════
# PHASE 6 — Enterprise Operations Pack
# ═══════════════════════════════════════════════════════════════════
#
# Imports for this section live at the bottom to keep diffs against
# the original views.py reviewable.
# ═══════════════════════════════════════════════════════════════════

import secrets

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status as http_status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    ImportJob, DistributionRule, AssignmentLog, UserSession,
    ApprovalRequest, ApprovalStep, APIKey,
)
from .serializers import (
    ImportJobSerializer, DistributionRuleSerializer, AssignmentLogSerializer,
    UserSessionSerializer,
    ApprovalRequestSerializer, ApprovalStepSerializer,
    APIKeySerializer,
)
from .filters_dsl import ast_to_q, FilterError, FIELD_WHITELIST, supported_operators_for_field
from .services import imports as imports_service


# ─── Module → Model lookup for the cross-cutting endpoints ──────

_MODULE_MODEL = {
    "lead": Leads,
    "deal": Deal,
    "customer": Leads,  # customers ride on Leads in this codebase
    "task": Task,
}

_MODULE_SERIALIZER = {
    "lead": LeadAdminAndStaffSerializer,
    "deal": DealAdminSerializer,
    "customer": LeadAdminAndStaffSerializer,
    "task": TaskSerializer,
}


# ─── 6.1 Advanced Filter Builder ────────────────────────────────


class FilterMeta(APIView):
    """Return the field whitelist + operator suggestions for the UI."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        module = request.query_params.get("module", "lead")
        fields = sorted(FIELD_WHITELIST.get(module, []))
        return Response({
            "module": module,
            "fields": fields,
            "operators_by_field": {f: supported_operators_for_field(f, module) for f in fields},
        })


class FilterQuery(APIView):
    """Run a saved or ad-hoc filter AST against a module's data.

    POST body:
        {"module": "lead", "filter": <AST>, "limit": 200}
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        module = request.data.get("module", "lead")
        ast = request.data.get("filter") or {}
        limit = int(request.data.get("limit") or 200)

        Model = _MODULE_MODEL.get(module)
        Serializer = _MODULE_SERIALIZER.get(module)
        if Model is None:
            return Response({"error": f"unknown module '{module}'"}, status=400)

        try:
            q = ast_to_q(ast, module=module)
        except FilterError as exc:
            return Response({"error": str(exc)}, status=400)

        qs = scope_qs(Model.objects.select_related("organization"), request).filter(q)
        results = qs[:limit]
        return Response({
            "count": qs.count(),
            "limit": limit,
            "results": Serializer(results, many=True).data,
        })


# ─── 6.2 Import / Export Engine ─────────────────────────────────


class ImportJobList(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        qs = scope_qs(ImportJob.objects.all(), request)
        return Response(ImportJobSerializer(qs[:100], many=True).data)

    def post(self, request):
        """Upload a file. Triggers preview unless `commit=true`."""
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)

        module = request.data.get("module")
        if module not in imports_service.IMPORTABLE_FIELDS:
            return Response({"error": f"unsupported module '{module}'"}, status=400)

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"error": "file is required"}, status=400)

        mapping_raw = request.data.get("mapping") or "{}"
        options_raw = request.data.get("options") or "{}"
        import json
        try:
            mapping = json.loads(mapping_raw) if isinstance(mapping_raw, str) else mapping_raw
            options = json.loads(options_raw) if isinstance(options_raw, str) else options_raw
        except json.JSONDecodeError:
            return Response({"error": "mapping/options must be JSON"}, status=400)

        commit = str(request.data.get("commit", "")).lower() in ("1", "true", "yes")

        job = ImportJob.objects.create(
            organization=org,
            user=request.user,
            module=module,
            file=file_obj,
            original_filename=file_obj.name,
            mapping=mapping,
            options=options,
            status="PREVIEW",
        )

        if commit:
            imports_service.run(job)
        else:
            # Re-read the saved file for preview.
            try:
                with job.file.open("rb") as fh:
                    preview = imports_service.preview(fh, job.original_filename, module, mapping)
            except Exception as exc:  # noqa: BLE001
                return Response({"error": str(exc)}, status=400)
            job.total_rows = preview["total_rows"]
            job.save(update_fields=["total_rows"])
            return Response({
                "job": ImportJobSerializer(job).data,
                "preview": preview,
            })

        return Response(ImportJobSerializer(job).data, status=http_status.HTTP_201_CREATED)


class ImportJobDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        qs = scope_qs(ImportJob.objects.all(), request)
        job = get_object_or_404(qs, id=job_id)
        return Response(ImportJobSerializer(job).data)

    def post(self, request, job_id):
        """`?action=commit` runs the import; `?action=rollback` deletes created rows."""
        qs = scope_qs(ImportJob.objects.all(), request)
        job = get_object_or_404(qs, id=job_id)
        action = request.query_params.get("action") or request.data.get("action") or "commit"

        if action == "commit":
            imports_service.run(job)
        elif action == "rollback":
            deleted = imports_service.rollback(job)
            return Response({"deleted": deleted, "job": ImportJobSerializer(job).data})
        else:
            return Response({"error": "action must be commit or rollback"}, status=400)

        return Response(ImportJobSerializer(job).data)

    def delete(self, request, job_id):
        qs = scope_qs(ImportJob.objects.all(), request)
        job = get_object_or_404(qs, id=job_id)
        job.delete()
        return Response(status=204)


class ExportData(APIView):
    """Download a module's data as CSV (org-scoped)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        module = request.query_params.get("module", "lead")
        Model = _MODULE_MODEL.get(module)
        if Model is None:
            return Response({"error": f"unknown module '{module}'"}, status=400)

        qs = scope_qs(Model.objects.all(), request)

        # Optional filter via base64-encoded JSON in `?filter=...`.
        filter_raw = request.query_params.get("filter")
        if filter_raw:
            import json
            try:
                ast = json.loads(filter_raw)
                qs = qs.filter(ast_to_q(ast, module=module))
            except (json.JSONDecodeError, FilterError) as exc:
                return Response({"error": f"invalid filter: {exc}"}, status=400)

        data = imports_service.export_csv(qs, module)
        response = HttpResponse(data, content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="{module}s_export.csv"'
        return response


# ─── 6.3 Lead Distribution Engine ───────────────────────────────


class DistributionRuleList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(DistributionRule.objects.prefetch_related("eligible_users"), request)
        return Response(DistributionRuleSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        serializer = DistributionRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(organization=org)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DistributionRuleDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, rule_id):
        qs = scope_qs(DistributionRule.objects.all(), request)
        return get_object_or_404(qs, id=rule_id)

    def get(self, request, rule_id):
        return Response(DistributionRuleSerializer(self.get_object(request, rule_id)).data)

    def patch(self, request, rule_id):
        rule = self.get_object(request, rule_id)
        serializer = DistributionRuleSerializer(rule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, rule_id):
        rule = self.get_object(request, rule_id)
        rule.delete()
        return Response(status=204)


class AssignmentLogList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(
            AssignmentLog.objects.select_related("lead", "rule", "assigned_to"),
            request,
        )
        return Response(AssignmentLogSerializer(qs[:200], many=True).data)


# ─── 6.4 Session & Device Management ────────────────────────────


def _current_jti(request) -> str | None:
    from .middleware import SessionTrackingMiddleware
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth.startswith("Bearer "):
        return None
    return SessionTrackingMiddleware._extract_jti(auth.split(" ", 1)[1])


class MySessions(APIView):
    """Current user's own sessions. Used by Profile → Devices."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = UserSession.objects.filter(user=request.user, is_active=True).order_by("-last_seen_at")
        context = {"current_jti": _current_jti(request)}
        return Response(UserSessionSerializer(qs, many=True, context=context).data)

    def delete(self, request):
        """Sign out everywhere except the current device."""
        current = _current_jti(request)
        qs = UserSession.objects.filter(user=request.user, is_active=True)
        if current:
            qs = qs.exclude(jti=current)
        count = qs.count()
        qs.update(is_active=False, revoked_at=timezone.now())
        # Also blacklist tokens if SimpleJWT blacklist app is wired (no-op otherwise).
        _try_blacklist(qs.values_list("jti", flat=True))
        return Response({"revoked": count})


class SessionRevoke(APIView):
    """Revoke one session by id (own session or super-admin scope)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, session_id):
        qs = UserSession.objects.all()
        if not request.user.is_superuser:
            qs = qs.filter(user=request.user)
        session = get_object_or_404(qs, id=session_id)
        session.is_active = False
        session.revoked_at = timezone.now()
        session.save(update_fields=["is_active", "revoked_at"])
        _try_blacklist([session.jti])
        return Response({"revoked": session.id})


class AdminSessionList(APIView):
    """Super-admin view — all sessions, optionally filtered to ?user=<id>."""

    permission_classes = [IsSuperUser]

    def get(self, request):
        qs = UserSession.objects.select_related("user").order_by("-last_seen_at")
        user_id = request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)
        active = request.query_params.get("active")
        if active == "true":
            qs = qs.filter(is_active=True)
        return Response(UserSessionSerializer(qs[:500], many=True).data)


def _try_blacklist(jtis):
    """Best-effort token blacklist — silent no-op if SimpleJWT blacklist app isn't installed."""
    try:
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
        for jti in jtis:
            tok = OutstandingToken.objects.filter(jti=jti).first()
            if tok:
                BlacklistedToken.objects.get_or_create(token=tok)
    except Exception:  # noqa: BLE001
        pass


# ─── 6.5 Approval Workflows ─────────────────────────────────────


class ApprovalRequestList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(
            ApprovalRequest.objects.select_related("requester").prefetch_related("steps"),
            request,
        )
        # Filter: ?mine=requested or ?mine=pending_my_approval
        scope = request.query_params.get("mine")
        if scope == "requested":
            qs = qs.filter(requester=request.user)
        elif scope == "pending_my_approval":
            # Rough match — the chain is a JSON list of user IDs; we filter in Python
            uid = request.user.id
            ids = [r.id for r in qs if r.status == "PENDING"
                   and r.approver_chain
                   and r.current_step < len(r.approver_chain)
                   and r.approver_chain[r.current_step] == uid]
            qs = qs.filter(id__in=ids)
        return Response(ApprovalRequestSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        chain = request.data.get("approver_chain") or []
        if not isinstance(chain, list) or not chain:
            return Response({"error": "approver_chain must be a non-empty list of user ids"}, status=400)
        serializer = ApprovalRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(organization=org, requester=request.user, status="PENDING", current_step=0)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ApprovalRequestDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, req_id):
        qs = scope_qs(ApprovalRequest.objects.all(), request)
        return get_object_or_404(qs, id=req_id)

    def get(self, request, req_id):
        return Response(ApprovalRequestSerializer(self._get(request, req_id)).data)

    def post(self, request, req_id):
        """Approve / reject / comment as the current approver."""
        req = self._get(request, req_id)
        action = (request.data.get("action") or "").upper()
        comment = request.data.get("comment", "")

        if action not in ("APPROVED", "REJECTED", "COMMENT"):
            return Response({"error": "action must be APPROVED, REJECTED, or COMMENT"}, status=400)

        chain = req.approver_chain or []
        if req.status != "PENDING":
            return Response({"error": f"request already {req.status.lower()}"}, status=400)
        if req.current_step >= len(chain):
            return Response({"error": "no pending approver"}, status=400)

        expected_uid = chain[req.current_step]
        if action != "COMMENT" and expected_uid != request.user.id and not request.user.is_superuser:
            return Response({"error": "you are not the current approver"}, status=403)

        ApprovalStep.objects.create(
            request=req,
            approver=request.user,
            step_index=req.current_step,
            action=action,
            comment=comment,
        )

        if action == "REJECTED":
            req.status = "REJECTED"
            req.decided_at = timezone.now()
            req.save(update_fields=["status", "decided_at"])
        elif action == "APPROVED":
            req.current_step += 1
            if req.current_step >= len(chain):
                req.status = "APPROVED"
                req.decided_at = timezone.now()
                req.save(update_fields=["status", "current_step", "decided_at"])
            else:
                req.save(update_fields=["current_step"])
        # COMMENT just adds a step row, no status change

        return Response(ApprovalRequestSerializer(req).data)

    def delete(self, request, req_id):
        req = self._get(request, req_id)
        if req.requester_id != request.user.id and not request.user.is_superuser:
            return Response({"error": "only the requester or super-admin can cancel"}, status=403)
        if req.status != "PENDING":
            return Response({"error": "only pending requests can be cancelled"}, status=400)
        req.status = "CANCELLED"
        req.decided_at = timezone.now()
        req.save(update_fields=["status", "decided_at"])
        return Response(ApprovalRequestSerializer(req).data)


# ─── 6.6 Public API — API Keys ──────────────────────────────────


class APIKeyList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(APIKey.objects.select_related("created_by"), request)
        return Response(APIKeySerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        key_value = f"crm_{secrets.token_urlsafe(32)}"

        serializer = APIKeySerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save(organization=org, created_by=request.user, key=key_value)
            data = APIKeySerializer(obj).data
            # Return the FULL key on creation — only time it's visible.
            data["key_plaintext"] = key_value
            return Response(data, status=201)
        return Response(serializer.errors, status=400)


class APIKeyDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, key_id):
        qs = scope_qs(APIKey.objects.all(), request)
        return get_object_or_404(qs, id=key_id)

    def patch(self, request, key_id):
        obj = self._get(request, key_id)
        # Only safe fields are user-editable.
        ALLOWED = {"name", "can_read", "can_write", "allowed_modules", "is_active", "expires_at"}
        for k in ALLOWED & set(request.data.keys()):
            setattr(obj, k, request.data[k])
        obj.save()
        return Response(APIKeySerializer(obj).data)

    def delete(self, request, key_id):
        obj = self._get(request, key_id)
        obj.is_active = False
        obj.revoked_at = timezone.now()
        obj.save(update_fields=["is_active", "revoked_at"])
        return Response({"revoked": obj.id})


# ═══════════════════════════════════════════════════════════════════
# PHASE 7 — Enterprise Integrations Pack
# ═══════════════════════════════════════════════════════════════════

from rest_framework.permissions import AllowAny

from .models import (
    AutomationRun, Department, SLAPolicy, Ticket, TicketMessage,
    CannedReply, PortalToken,
)
from .serializers import (
    AutomationRunSerializer,
    DepartmentSerializer, SLAPolicySerializer,
    TicketSerializer, TicketDetailSerializer, TicketMessageSerializer,
    CannedReplySerializer, PortalTokenSerializer,
)
from .services import (
    automation_engine as _automation_svc,
    whatsapp_client as _wa_svc,
    razorpay_client as _rzp_svc,
    helpdesk as _helpdesk_svc,
    portal as _portal_svc,
)


# ─── 7.1 Automation run history ────────────────────────────────


class AutomationRunList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(
            AutomationRun.objects.select_related("rule"),
            request,
        ).order_by("-started_at")
        rule_id = request.query_params.get("rule")
        if rule_id:
            qs = qs.filter(rule_id=rule_id)
        return Response(AutomationRunSerializer(qs[:200], many=True).data)


class AutomationRuleTest(APIView):
    """Fire an automation rule manually with a synthetic payload (test button)."""
    permission_classes = [IsAuthenticated]

    def post(self, request, rule_id):
        qs = scope_qs(AutomationRule.objects.all(), request)
        rule = get_object_or_404(qs, id=rule_id)
        payload = request.data.get("payload") or {"event": rule.trigger_event, "test": True}
        run_id = _automation_svc.execute_inline(rule, rule.trigger_event, payload, instance=None)
        return Response({"run_id": run_id})


# ─── 7.2 WhatsApp send + webhook ───────────────────────────────


class WhatsAppSend(APIView):
    """Send a one-off message — text, template, or media."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        to = request.data.get("to")
        if not to:
            return Response({"error": "to is required"}, status=400)
        kind = request.data.get("kind", "text")
        if kind == "text":
            msg = _wa_svc.send_text(org, to, request.data.get("body", ""))
        elif kind == "template":
            msg = _wa_svc.send_template(
                org, to,
                request.data.get("template", ""),
                request.data.get("variables", []),
            )
        elif kind == "media":
            msg = _wa_svc.send_media(
                org, to,
                request.data.get("media_url", ""),
                request.data.get("media_type", "image"),
                request.data.get("caption", ""),
            )
        else:
            return Response({"error": "kind must be text|template|media"}, status=400)
        return Response({
            "id": msg.id, "status": msg.status,
            "external_id": msg.external_id,
            "error_message": msg.error_message,
        })


class WhatsAppBulkSend(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        recipients = request.data.get("recipients") or []
        body = request.data.get("body", "")
        if not recipients or not body:
            return Response({"error": "recipients[] and body required"}, status=400)
        msgs = _wa_svc.bulk_send(org, recipients, body)
        return Response({"queued": len(msgs)})


class WhatsAppWebhook(APIView):
    """Meta posts here. GET = verification challenge, POST = events."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        # Meta's hub.challenge verification
        verify_token = request.query_params.get("hub.verify_token", "")
        challenge = request.query_params.get("hub.challenge", "")
        from django.conf import settings
        expected = getattr(settings, "WHATSAPP_WEBHOOK_VERIFY_TOKEN", "")
        if expected and verify_token == expected:
            return Response(int(challenge) if challenge.isdigit() else challenge)
        return Response({"error": "verification failed"}, status=403)

    def post(self, request):
        processed = _wa_svc.handle_webhook(request.data or {})
        return Response({"ok": True, "processed": processed})


# ─── 7.3 Razorpay checkout + webhook + invoice download ─────────


class BillingCheckoutOrder(APIView):
    """Create a Razorpay order for a plan. Returns the order id + amount
    the frontend feeds into Razorpay Checkout.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        plan_slug = request.data.get("plan")
        plan = Plan.objects.filter(slug=plan_slug, is_active=True).first()
        if not plan:
            return Response({"error": "unknown plan"}, status=400)
        amount_paise = int((plan.price or 0) * 100)
        try:
            data = _rzp_svc.create_order(amount_paise, plan, org, request.user)
            return Response(data)
        except Exception as exc:  # noqa: BLE001
            return Response({"error": str(exc)}, status=400)


class BillingVerify(APIView):
    """Razorpay Checkout callback — verifies the payment signature and
    marks the matching Invoice paid.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id", "")
        payment_id = request.data.get("razorpay_payment_id", "")
        signature = request.data.get("razorpay_signature", "")
        if not (order_id and payment_id and signature):
            return Response({"error": "all three fields required"}, status=400)
        if not _rzp_svc.verify_payment_signature(order_id, payment_id, signature):
            return Response({"error": "invalid signature"}, status=400)
        invoice = Invoice.objects.filter(external_id=order_id).first()
        if invoice:
            invoice.status = "PAID"
            invoice.razorpay_payment_id = payment_id
            invoice.paid_at = timezone.now()
            invoice.save()
            sub = Subscription.objects.filter(organization=invoice.organization, plan=invoice.plan).first()
            if sub:
                sub.status = "ACTIVE"
                sub.save(update_fields=["status"])
        return Response({"ok": True, "invoice": invoice.id if invoice else None})


class BillingWebhook(APIView):
    """Razorpay-hosted webhook. Verifies signature header then dispatches."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        sig = request.META.get("HTTP_X_RAZORPAY_SIGNATURE", "")
        raw = request.body or b""
        if not _rzp_svc.verify_webhook_signature(raw, sig):
            return Response({"error": "bad signature"}, status=400)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:  # noqa: BLE001
            return Response({"error": "bad json"}, status=400)
        result = _rzp_svc.handle_webhook(payload)
        return Response(result)


class InvoiceDownload(APIView):
    """Download an Invoice as a GST PDF."""
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_id):
        qs = scope_qs(Invoice.objects.select_related("plan", "organization"), request)
        invoice = get_object_or_404(qs, id=invoice_id)
        pdf = _rzp_svc.generate_invoice_pdf(invoice)
        if not pdf:
            return Response({"error": "reportlab not installed; cannot render PDF"}, status=501)
        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="invoice_{invoice.id}.pdf"'
        return response


# ─── 7.4 Helpdesk — departments, SLAs, tickets, canned replies ─


class DepartmentList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(Department.objects.prefetch_related("members"), request)
        return Response(DepartmentSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(organization=org)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DepartmentDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, dept_id):
        qs = scope_qs(Department.objects.all(), request)
        return get_object_or_404(qs, id=dept_id)

    def patch(self, request, dept_id):
        dept = self._get(request, dept_id)
        ser = DepartmentSerializer(dept, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, dept_id):
        self._get(request, dept_id).delete()
        return Response(status=204)


class SLAPolicyList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(SLAPolicy.objects.select_related("department"), request)
        return Response(SLAPolicySerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        ser = SLAPolicySerializer(data=request.data)
        if ser.is_valid():
            ser.save(organization=org)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class SLAPolicyDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, pid):
        qs = scope_qs(SLAPolicy.objects.all(), request)
        return get_object_or_404(qs, id=pid)

    def patch(self, request, pid):
        pol = self._get(request, pid)
        ser = SLAPolicySerializer(pol, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, pid):
        self._get(request, pid).delete()
        return Response(status=204)


class TicketList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(
            Ticket.objects.select_related("assigned_to", "department"),
            request,
        )
        status_f = request.query_params.get("status")
        if status_f:
            qs = qs.filter(status=status_f)
        return Response({
            "count": qs.count(),
            "results": TicketSerializer(qs[:200], many=True).data,
        })

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        ser = TicketSerializer(data=request.data)
        if ser.is_valid():
            ser.save(organization=org)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class TicketDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, ticket_id):
        qs = scope_qs(
            Ticket.objects.select_related("assigned_to", "department")
                          .prefetch_related("messages"),
            request,
        )
        return get_object_or_404(qs, id=ticket_id)

    def get(self, request, ticket_id):
        ticket = self._get(request, ticket_id)
        return Response(TicketDetailSerializer(ticket).data)

    def patch(self, request, ticket_id):
        ticket = self._get(request, ticket_id)
        # status transition stamps resolved_at
        if request.data.get("status") in ("RESOLVED", "CLOSED") and not ticket.resolved_at:
            ticket.resolved_at = timezone.now()
        ser = TicketSerializer(ticket, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, ticket_id):
        self._get(request, ticket_id).delete()
        return Response(status=204)


class TicketReply(APIView):
    """Append a message to a ticket."""
    permission_classes = [IsAuthenticated]

    def post(self, request, ticket_id):
        qs = scope_qs(Ticket.objects.all(), request)
        ticket = get_object_or_404(qs, id=ticket_id)

        body = request.data.get("body", "").strip()
        if not body:
            return Response({"error": "body required"}, status=400)

        is_internal = bool(request.data.get("is_internal", False))
        msg = TicketMessage.objects.create(
            ticket=ticket,
            author=request.user,
            author_type="AGENT",
            author_name=request.user.username,
            body=body,
            is_internal=is_internal,
        )

        # Stamp first-response if needed
        _helpdesk_svc.mark_first_response(ticket)
        if ticket.status == "OPEN":
            ticket.status = "IN_PROGRESS"
        ticket.save()
        return Response(TicketMessageSerializer(msg).data, status=201)


class CannedReplyList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(CannedReply.objects.select_related("department"), request)
        return Response(CannedReplySerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        ser = CannedReplySerializer(data=request.data)
        if ser.is_valid():
            ser.save(organization=org, created_by=request.user)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class CannedReplyDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, rid):
        qs = scope_qs(CannedReply.objects.all(), request)
        return get_object_or_404(qs, id=rid)

    def patch(self, request, rid):
        obj = self._get(request, rid)
        ser = CannedReplySerializer(obj, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, rid):
        self._get(request, rid).delete()
        return Response(status=204)


# ─── 7.5 Customer Portal ────────────────────────────────────────


class PortalTokenList(APIView):
    """Admin-side: mint + list customer portal tokens."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(PortalToken.objects.select_related("linked_lead"), request)
        return Response(PortalTokenSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        email = request.data.get("email")
        if not email:
            return Response({"error": "email required"}, status=400)
        lead_id = request.data.get("linked_lead")
        lead = None
        if lead_id:
            lead = Leads.objects.filter(pk=lead_id, organization=org).first()
        token = _portal_svc.mint_token(
            org, email,
            name=request.data.get("name", ""),
            lead=lead,
            expires_days=int(request.data.get("expires_days", 90)),
            created_by=request.user,
        )
        data = PortalTokenSerializer(token).data
        data["token_plaintext"] = token.token  # only on creation
        return Response(data, status=201)


class PortalTokenDetail(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, token_id):
        qs = scope_qs(PortalToken.objects.all(), request)
        obj = get_object_or_404(qs, id=token_id)
        obj.is_active = False
        obj.save(update_fields=["is_active"])
        return Response({"revoked": obj.id})


# Customer-facing endpoints — auth via `Authorization: Portal <token>` header.

def _portal_auth(request):
    """Resolve PortalToken from request, or return None on failure."""
    header = request.META.get("HTTP_AUTHORIZATION", "")
    if not header.startswith("Portal "):
        return None
    return _portal_svc.resolve_token(header.split(" ", 1)[1])


class PortalMe(APIView):
    """`GET /api/portal/me/` — used after login to bootstrap the portal app."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        _portal_svc.touch(tok)
        org = tok.organization
        return Response({
            "email": tok.email,
            "name": tok.name or "",
            "organization": {
                "name": getattr(org, "name", ""),
                "slug": getattr(org, "slug", ""),
                "primary_color": getattr(org, "primary_color", "#facc15"),
                "industry": getattr(org, "industry", ""),
            },
            "expires_at": tok.expires_at,
        })


class PortalDashboard(APIView):
    """High-level summary for the portal home screen."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        leads = _portal_svc.visible_leads(tok).count()
        deals = _portal_svc.visible_deals(tok).count()
        invoices = _portal_svc.visible_invoices(tok).count()
        open_tickets = _portal_svc.visible_tickets(tok).exclude(status__in=["RESOLVED", "CLOSED"]).count()
        return Response({
            "leads": leads, "deals": deals,
            "invoices": invoices, "open_tickets": open_tickets,
        })


class PortalTickets(APIView):
    """Customer view of their own tickets — list + create."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        qs = _portal_svc.visible_tickets(tok).order_by("-created_at")
        return Response(TicketSerializer(qs, many=True).data)

    def post(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        subject = request.data.get("subject", "").strip()
        body = request.data.get("body", "").strip()
        if not subject:
            return Response({"error": "subject required"}, status=400)
        ticket = Ticket.objects.create(
            organization=tok.organization,
            subject=subject,
            description=body,
            source="PORTAL",
            customer_email=tok.email,
            customer_name=tok.name,
            customer_lead=tok.linked_lead,
            priority=request.data.get("priority", "NORMAL"),
        )
        if body:
            TicketMessage.objects.create(
                ticket=ticket,
                author_type="CUSTOMER",
                author_name=tok.name or tok.email,
                body=body,
            )
        return Response(TicketSerializer(ticket).data, status=201)


class PortalTicketDetail(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, ticket_id):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        ticket = _portal_svc.visible_tickets(tok).filter(pk=ticket_id).first()
        if not ticket:
            return Response({"error": "not found"}, status=404)
        # Hide internal notes from customers
        data = TicketDetailSerializer(ticket).data
        data["messages"] = [m for m in data["messages"] if not m.get("is_internal")]
        return Response(data)

    def post(self, request, ticket_id):
        """Customer reply."""
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        ticket = _portal_svc.visible_tickets(tok).filter(pk=ticket_id).first()
        if not ticket:
            return Response({"error": "not found"}, status=404)
        body = request.data.get("body", "").strip()
        if not body:
            return Response({"error": "body required"}, status=400)
        msg = TicketMessage.objects.create(
            ticket=ticket,
            author_type="CUSTOMER",
            author_name=tok.name or tok.email,
            body=body,
        )
        if ticket.status == "WAITING":
            ticket.status = "IN_PROGRESS"
            ticket.save(update_fields=["status"])
        return Response(TicketMessageSerializer(msg).data, status=201)


class PortalInvoices(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        invoices = _portal_svc.visible_invoices(tok)
        return Response(InvoiceSerializer(invoices, many=True).data)


class PortalDocuments(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        docs = _portal_svc.visible_documents(tok)
        return Response(DocumentAdminSerializer(docs, many=True).data)


class PortalDeals(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        tok = _portal_auth(request)
        if not tok:
            return Response({"error": "invalid portal token"}, status=401)
        deals = _portal_svc.visible_deals(tok)
        return Response(DealAdminSerializer(deals, many=True).data)


# ═══════════════════════════════════════════════════════════════════
# PHASE 8 — Ecosystem & Intelligence Pack
# ═══════════════════════════════════════════════════════════════════

import secrets as _secrets

from .models import (
    KbCategory, KbArticle, Form, FormField, FormSubmission,
    SignatureRequest, SignatureSigner, SignatureEvent,
    BackupJob, CloudConnection, AIRequest, Plugin, PushSubscription,
    DashboardLayout,
)
from .serializers import (
    KbCategorySerializer, KbArticleListSerializer, KbArticleDetailSerializer,
    FormSerializer, FormFieldSerializer, FormSubmissionSerializer,
    SignatureRequestSerializer, SignatureSignerSerializer,
    BackupJobSerializer, CloudConnectionSerializer,
    AIRequestSerializer, PluginSerializer,
    PushSubscriptionSerializer, DashboardLayoutSerializer,
)
from .services import (
    kb as _kb_svc,
    forms as _forms_svc,
    esign as _esign_svc,
    backup as _backup_svc,
    cloud_storage as _cs_svc,
    ai as _ai_svc,
    push as _push_svc,
    analytics as _analytics_svc,
    plugins as _plugins_svc,
)


# ─── 8.1 Knowledge Base ─────────────────────────────────────────


class KbCategoryList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(KbCategory.objects.all(), request)
        return Response(KbCategorySerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        ser = KbCategorySerializer(data=request.data)
        if ser.is_valid():
            ser.save(organization=org)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class KbCategoryDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, cat_id):
        qs = scope_qs(KbCategory.objects.all(), request)
        obj = get_object_or_404(qs, id=cat_id)
        ser = KbCategorySerializer(obj, data=request.data, partial=True)
        if ser.is_valid():
            ser.save(); return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, cat_id):
        get_object_or_404(scope_qs(KbCategory.objects.all(), request), id=cat_id).delete()
        return Response(status=204)


class KbArticleList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get("q") or ""
        category_id = request.query_params.get("category")
        qs = scope_qs(KbArticle.objects.select_related("category", "author"), request)
        if category_id:
            qs = qs.filter(category_id=category_id)
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(title__icontains=q) | Q(body__icontains=q) | Q(tags__icontains=q))
        return Response(KbArticleListSerializer(qs[:200], many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if not data.get("slug") and data.get("title"):
            from django.utils.text import slugify
            data["slug"] = slugify(data["title"])[:280]
        ser = KbArticleDetailSerializer(data=data)
        if ser.is_valid():
            article = ser.save(organization=org, author=request.user)
            if article.status == "PUBLISHED" and not article.published_at:
                article.published_at = timezone.now()
                article.save(update_fields=["published_at"])
            return Response(KbArticleDetailSerializer(article).data, status=201)
        return Response(ser.errors, status=400)


class KbArticleDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, article_id):
        qs = scope_qs(KbArticle.objects.select_related("category", "author"), request)
        article = get_object_or_404(qs, id=article_id)
        _kb_svc.track_view(article)
        data = KbArticleDetailSerializer(article).data
        data["related"] = KbArticleListSerializer(_kb_svc.related_articles(article), many=True).data
        return Response(data)

    def patch(self, request, article_id):
        qs = scope_qs(KbArticle.objects.all(), request)
        article = get_object_or_404(qs, id=article_id)
        ser = KbArticleDetailSerializer(article, data=request.data, partial=True)
        if ser.is_valid():
            article = ser.save()
            if article.status == "PUBLISHED" and not article.published_at:
                article.published_at = timezone.now()
                article.save(update_fields=["published_at"])
            return Response(KbArticleDetailSerializer(article).data)
        return Response(ser.errors, status=400)

    def delete(self, request, article_id):
        get_object_or_404(scope_qs(KbArticle.objects.all(), request), id=article_id).delete()
        return Response(status=204)


class KbArticleVote(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, article_id):
        qs = scope_qs(KbArticle.objects.all(), request)
        article = get_object_or_404(qs, id=article_id)
        _kb_svc.vote(article, bool(request.data.get("helpful", True)))
        return Response({"ok": True})


# ─── 8.2 Form Builder ──────────────────────────────────────────


class FormList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(Form.objects.prefetch_related("fields"), request)
        return Response(FormSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        if not data.get("slug") and data.get("name"):
            from django.utils.text import slugify
            base = slugify(data["name"])[:200]
            cand = base
            i = 1
            while Form.objects.filter(slug=cand).exists():
                i += 1
                cand = f"{base}-{i}"
            data["slug"] = cand
        ser = FormSerializer(data=data)
        if ser.is_valid():
            form = ser.save(organization=org)
            for fld in (request.data.get("fields") or []):
                FormField.objects.create(form=form, **{k: v for k, v in fld.items() if k != "id"})
            return Response(FormSerializer(form).data, status=201)
        return Response(ser.errors, status=400)


class FormDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, form_id):
        qs = scope_qs(Form.objects.prefetch_related("fields"), request)
        return get_object_or_404(qs, id=form_id)

    def get(self, request, form_id):
        return Response(FormSerializer(self._get(request, form_id)).data)

    def patch(self, request, form_id):
        form = self._get(request, form_id)
        ser = FormSerializer(form, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
        # Replace fields if provided in the request.
        if "fields" in request.data:
            form.fields.all().delete()
            for fld in request.data["fields"]:
                FormField.objects.create(form=form, **{k: v for k, v in fld.items() if k != "id"})
        return Response(FormSerializer(self._get(request, form_id)).data)

    def delete(self, request, form_id):
        self._get(request, form_id).delete()
        return Response(status=204)


class FormSubmissionsList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, form_id):
        qs = scope_qs(Form.objects.all(), request)
        form = get_object_or_404(qs, id=form_id)
        subs = form.submissions.all()[:200]
        return Response(FormSubmissionSerializer(subs, many=True).data)


class PublicFormView(APIView):
    """Public — anyone can fetch a form's schema or submit by slug."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, slug):
        form = Form.objects.filter(slug=slug, is_active=True).prefetch_related("fields").first()
        if not form:
            return Response({"error": "form not found"}, status=404)
        return Response(FormSerializer(form).data)

    def post(self, request, slug):
        form = Form.objects.filter(slug=slug, is_active=True).prefetch_related("fields").first()
        if not form:
            return Response({"error": "form not found"}, status=404)
        try:
            submission = _forms_svc.submit(
                form,
                request.data,
                ip=request.META.get("REMOTE_ADDR", ""),
                ua=request.META.get("HTTP_USER_AGENT", "")[:512],
                referrer=request.META.get("HTTP_REFERER", "")[:500],
            )
        except Exception as exc:  # noqa: BLE001
            return Response({"error": str(exc)}, status=400)
        return Response({
            "ok": True,
            "submission_id": submission.id,
            "redirect_url": form.redirect_url or None,
            "message": form.success_message,
        })


# ─── 8.3 E-signature ───────────────────────────────────────────


class SignatureRequestList(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        qs = scope_qs(SignatureRequest.objects.prefetch_related("signers"), request)
        return Response(SignatureRequestSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        signers_raw = request.data.get("signers", "[]")
        if isinstance(signers_raw, str):
            try:
                import json as _json
                signers = _json.loads(signers_raw)
            except Exception:
                return Response({"error": "signers must be JSON list"}, status=400)
        else:
            signers = signers_raw

        ser = SignatureRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        req = ser.save(organization=org, requested_by=request.user, status="PENDING")
        for idx, s in enumerate(signers or []):
            _esign_svc.mint_signer(req, name=s.get("name", ""), email=s.get("email", ""), phone=s.get("phone", ""), order=idx)
        return Response(SignatureRequestSerializer(req).data, status=201)


class SignatureRequestDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, req_id):
        qs = scope_qs(SignatureRequest.objects.prefetch_related("signers"), request)
        return Response(SignatureRequestSerializer(get_object_or_404(qs, id=req_id)).data)

    def delete(self, request, req_id):
        obj = get_object_or_404(scope_qs(SignatureRequest.objects.all(), request), id=req_id)
        obj.status = "CANCELLED"
        obj.save(update_fields=["status"])
        return Response(SignatureRequestSerializer(obj).data)


class PublicSignView(APIView):
    """Customer-facing — load the signing page, request OTP, sign."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        signer = _esign_svc.resolve_signer(token)
        if not signer:
            return Response({"error": "invalid token"}, status=404)
        if signer.status not in ("PENDING", "VIEWED"):
            return Response({"error": f"already {signer.status.lower()}"}, status=400)
        signer.status = "VIEWED"
        signer.save(update_fields=["status"])
        return Response({
            "signer": SignatureSignerSerializer(signer).data,
            "request": SignatureRequestSerializer(signer.request).data,
            "document_url": signer.request.document.url if signer.request.document else None,
        })

    def post(self, request, token):
        signer = _esign_svc.resolve_signer(token)
        if not signer:
            return Response({"error": "invalid token"}, status=404)
        action = request.data.get("action")
        if action == "send_otp":
            code = _esign_svc.send_otp(signer)
            # In production, send via email/SMS. Here we return so the dev UI can display it.
            return Response({"ok": True, "otp_demo": code, "expires_in_minutes": 15})
        if action == "verify_and_sign":
            otp = request.data.get("otp", "")
            if not _esign_svc.verify_otp(signer, otp):
                return Response({"error": "invalid or expired OTP"}, status=400)
            _esign_svc.record_signature(
                signer,
                signature_image=request.data.get("signature_image", ""),
                ip=request.META.get("REMOTE_ADDR", ""),
                ua=request.META.get("HTTP_USER_AGENT", "")[:400],
            )
            return Response({"ok": True})
        if action == "decline":
            _esign_svc.decline(signer, reason=request.data.get("reason", ""))
            return Response({"ok": True})
        return Response({"error": "unknown action"}, status=400)


# ─── 8.4 Backup & Restore ─────────────────────────────────────


class BackupList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(BackupJob.objects.all(), request)
        return Response(BackupJobSerializer(qs[:100], many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        job = BackupJob.objects.create(
            organization=org,
            initiated_by=request.user,
            kind=request.data.get("kind", "MANUAL"),
            retention_days=int(request.data.get("retention_days", 30)),
        )
        _backup_svc.run_backup(job)
        return Response(BackupJobSerializer(job).data, status=201)


class BackupRestore(APIView):
    permission_classes = [IsSuperUser]  # restore is risky — super-admin only

    def post(self, request, job_id):
        job = get_object_or_404(BackupJob, id=job_id)
        result = _backup_svc.restore_backup(job)
        return Response(result, status=200 if result.get("ok") else 400)


class BackupPrune(APIView):
    permission_classes = [IsSuperUser]

    def post(self, request):
        deleted = _backup_svc.prune_expired()
        return Response({"deleted": deleted})


# ─── 8.5 Cloud Storage ────────────────────────────────────────


class CloudConnectionList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = CloudConnection.objects.filter(user=request.user)
        return Response(CloudConnectionSerializer(qs, many=True).data)

    def delete(self, request):
        provider = request.query_params.get("provider")
        if not provider:
            return Response({"error": "provider query param required"}, status=400)
        CloudConnection.objects.filter(user=request.user, provider=provider).update(is_active=False)
        return Response({"ok": True})


class CloudConnectStart(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, provider):
        url, state = _cs_svc.authorize_url(provider)
        if not url:
            return Response({"error": f"{provider} OAuth not configured. Set CLIENT_ID/SECRET/REDIRECT_URI in .env."}, status=400)
        # State is stateless here for brevity — production should store + verify.
        return Response({"authorize_url": url, "state": state})


class CloudConnectCallback(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, provider):
        code = request.data.get("code", "")
        if not code:
            return Response({"error": "code required"}, status=400)
        org = require_org(request)
        try:
            token_response = _cs_svc.exchange_code(provider, code)
        except Exception as exc:  # noqa: BLE001
            return Response({"error": str(exc)}, status=400)
        conn = _cs_svc.save_connection(
            provider=provider,
            user=request.user,
            org=org,
            token_response=token_response,
        )
        return Response(CloudConnectionSerializer(conn).data, status=201)


# ─── 8.6 AI features ──────────────────────────────────────────


class AILeadSummary(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lead_id):
        qs = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(qs, id=lead_id)
        return Response(_ai_svc.summarize_lead(lead, user=request.user, org=lead.organization))


class AIFollowupSuggest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lead_id):
        qs = scope_qs(Leads.objects.all(), request)
        lead = get_object_or_404(qs, id=lead_id)
        return Response(_ai_svc.suggest_followup(lead, user=request.user, org=lead.organization))


class AIDealRisk(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, deal_id):
        qs = scope_qs(Deal.objects.all(), request)
        deal = get_object_or_404(qs, id=deal_id)
        return Response(_ai_svc.predict_deal_risk(deal, user=request.user, org=deal.organization))


class AIChat(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        org = require_org(request)
        return Response(_ai_svc.chat(request.data.get("messages") or [], user=request.user, org=org))


class AIRequestLog(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(AIRequest.objects.select_related("user"), request).order_by("-created_at")
        return Response(AIRequestSerializer(qs[:100], many=True).data)


# ─── 8.7 Plugin registry ──────────────────────────────────────


class PluginList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = scope_qs(Plugin.objects.all(), request)
        return Response(PluginSerializer(qs, many=True).data)

    def post(self, request):
        org = require_org(request)
        if org is None:
            return Response({"error": "Super admin must include ?org=<slug>"}, status=400)
        ser = PluginSerializer(data=request.data)
        if ser.is_valid():
            ser.save(organization=org)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class PluginDetail(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, plugin_id):
        qs = scope_qs(Plugin.objects.all(), request)
        return get_object_or_404(qs, id=plugin_id)

    def patch(self, request, plugin_id):
        plugin = self._get(request, plugin_id)
        ser = PluginSerializer(plugin, data=request.data, partial=True)
        if ser.is_valid():
            ser.save(); return Response(ser.data)
        return Response(ser.errors, status=400)

    def post(self, request, plugin_id):
        """Enable/disable + reload."""
        plugin = self._get(request, plugin_id)
        action = request.data.get("action")
        if action == "enable":
            ok = _plugins_svc.load_plugin(plugin)
            return Response({"ok": ok, "status": plugin.status})
        if action == "disable":
            plugin.status = "DISABLED"
            plugin.save(update_fields=["status"])
            return Response({"ok": True, "status": plugin.status})
        return Response({"error": "unknown action"}, status=400)

    def delete(self, request, plugin_id):
        self._get(request, plugin_id).delete()
        return Response(status=204)


class PluginHooks(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_plugins_svc.registered_hooks())


# ─── 8.8 Push subscriptions ───────────────────────────────────


class PushSubscriptionList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = PushSubscription.objects.filter(user=request.user, is_active=True)
        return Response(PushSubscriptionSerializer(qs, many=True).data)

    def post(self, request):
        org = getattr(request.user, "organization", None)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        sub, _ = PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=data.get("endpoint", ""),
            defaults={
                "organization": org,
                "platform": data.get("platform", "WEB"),
                "p256dh": data.get("p256dh", ""),
                "auth": data.get("auth", ""),
                "device_label": data.get("device_label", "")[:200],
                "is_active": True,
            },
        )
        return Response(PushSubscriptionSerializer(sub).data, status=201)


class PushSubscriptionDelete(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, sub_id):
        sub = get_object_or_404(PushSubscription, id=sub_id, user=request.user)
        sub.is_active = False
        sub.save(update_fields=["is_active"])
        return Response({"revoked": sub.id})


class PushTest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = _push_svc.send_to_user(
            request.user,
            title=request.data.get("title", "Test notification"),
            body=request.data.get("body", "If you see this, push is wired up."),
            link=request.data.get("link", "/admin"),
        )
        return Response(result)


class PushPublicKey(APIView):
    """Expose the VAPID public key for the frontend to subscribe with."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.conf import settings
        return Response({"vapid_public_key": getattr(settings, "VAPID_PUBLIC_KEY", "")})


# ─── 8.9 Advanced Analytics ───────────────────────────────────


class AnalyticsForecast(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request) or getattr(request.user, "organization", None)
        if org is None:
            return Response({"error": "no organization"}, status=400)
        months = int(request.query_params.get("months", 12))
        return Response(_analytics_svc.revenue_forecast(org, months=months))


class AnalyticsCohort(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request) or getattr(request.user, "organization", None)
        if org is None:
            return Response({"error": "no organization"}, status=400)
        weeks = int(request.query_params.get("weeks", 8))
        return Response(_analytics_svc.cohort_analysis(org, weeks=weeks))


class AnalyticsChurn(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request) or getattr(request.user, "organization", None)
        if org is None:
            return Response({"error": "no organization"}, status=400)
        return Response(_analytics_svc.churn_metrics(org))


class AnalyticsFunnel(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request) or getattr(request.user, "organization", None)
        if org is None:
            return Response({"error": "no organization"}, status=400)
        return Response(_analytics_svc.funnel_intelligence(org))


class AnalyticsExecutive(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = require_org(request) or getattr(request.user, "organization", None)
        if org is None:
            return Response({"error": "no organization"}, status=400)
        return Response(_analytics_svc.executive_summary(org))


# ─── 8.10 Dashboard layouts ────────────────────────────────────


class DashboardLayoutList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = DashboardLayout.objects.filter(user=request.user)
        return Response(DashboardLayoutSerializer(qs, many=True).data)

    def post(self, request):
        org = getattr(request.user, "organization", None)
        ser = DashboardLayoutSerializer(data=request.data)
        if ser.is_valid():
            ser.save(user=request.user, organization=org)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class DashboardLayoutDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, layout_id):
        layout = get_object_or_404(DashboardLayout, id=layout_id, user=request.user)
        ser = DashboardLayoutSerializer(layout, data=request.data, partial=True)
        if ser.is_valid():
            ser.save(); return Response(ser.data)
        return Response(ser.errors, status=400)

    def delete(self, request, layout_id):
        get_object_or_404(DashboardLayout, id=layout_id, user=request.user).delete()
        return Response(status=204)