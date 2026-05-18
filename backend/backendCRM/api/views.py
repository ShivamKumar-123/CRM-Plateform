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
)
from .tenancy import scope_qs, require_org, get_request_org

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