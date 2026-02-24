from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum, F, DecimalField, Value, Q
from django.db.models.functions import Coalesce
from .models import Leads, Deal, Payment, Document, Task, TaskMessage
from .serializers import DashboardSerializer, LeadAdminAndStaffSerializer, LeadOtherSerializer, DealAdminSerializer, DealOtherSerializer, DocumentAdminSerializer, PaymentSerializer, TaskSerializer, TaskMessageSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404




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

    def get(self, request):

        # Leads
        total_leads = Leads.objects.count()

        # Deals
        total_deals = Deal.objects.count()
        won_deals = Deal.objects.filter(status="WON").count()
        cancelled_deals = Deal.objects.filter(status="CANCELLED").count()

        # Revenue
        total_revenue = Payment.objects.aggregate(
            total=Coalesce(
                Sum("amount_paid"),
                Value(0),
                output_field=DecimalField()
            )
        )["total"]

        # Profit
        total_profit = Deal.objects.filter(status="WON").aggregate(
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

        # Admin → all leads
        if user.is_staff or user.role == "ADMIN":
            queryset = Leads.objects.select_related("assigned_to").all()
            serializer_class = LeadAdminAndStaffSerializer

        # User → only assigned leads
        else:
            queryset = Leads.objects.select_related("assigned_to").filter(
                assigned_to=user
            )
            serializer_class = LeadOtherSerializer

        # single lead
        if lead_id:
            lead = get_object_or_404(queryset, id=lead_id)
            serializer = serializer_class(lead)
            return Response(serializer.data)

        # stats based on queryset
        stats = queryset.aggregate(
            total_leads=Count("id"),
            new_leads=Count("id", filter=Q(status="NEW")),
            contacted_leads=Count("id", filter=Q(status="CONTACTED")),
            site_visit=Count("id", filter=Q(status="SITE_VISIT")),
            quotation_sent=Count("id", filter=Q(status="QUOTATION_SENT")),
            dealed=Count("id", filter=Q(status="DEALED")),
            cancelled=Count("id", filter=Q(status="CANCELLED")),
        )

        serializer = serializer_class(queryset, many=True)

        return Response({
            "stats": stats,
            "leads": serializer.data
        })



    def post(self, request):

        serializer = LeadAdminAndStaffSerializer(data=request.data)

        if serializer.is_valid():

            if request.user.is_staff or request.user.role == 'ADMIN':
                serializer.save()
            else:
                serializer.save(assigned_to=request.user, )

            return Response(
                {"message": "Lead created successfully", "lead": serializer.data},
                status=201
            )

        return Response(serializer.errors, status=400)


    def put(self, request, lead_id):

        user = request.user
        lead = get_object_or_404(Leads, id=lead_id)

        if not (user.is_staff or user.role == 'ADMIN'):
            if lead.assigned_to != user:
                return Response({"error": "Permission denied"}, status=403)

        serializer = LeadAdminAndStaffSerializer(
            lead,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


    def delete(self, request, lead_id):

        user = request.user
        lead = get_object_or_404(Leads, id=lead_id)

        if not (user.is_staff or user.role == 'ADMIN'):
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

        # Admin → all deals
        if user.is_staff or user.role == "ADMIN":
            queryset = Deal.objects.select_related("lead", "assigned_to").all()
            serializer_class = DealAdminSerializer

        # User → only assigned deals
        else:
            queryset = Deal.objects.select_related("lead", "assigned_to").filter(
                assigned_to=user
            )
            serializer_class = DealOtherSerializer

        # Single deal
        if deal_id:
            deal = get_object_or_404(queryset, id=deal_id)
            serializer = serializer_class(deal)
            return Response(serializer.data)

        # Deal stats
        stats = queryset.aggregate(
            total_deals=Count("id"),
            open_deals=Count("id", filter=Q(status="OPEN")),
            won_deals=Count("id", filter=Q(status="WON")),
            cancelled_deals=Count("id", filter=Q(status="CANCELLED")),
        )

        serializer = serializer_class(queryset, many=True)

        return Response({
            "stats": stats,
            "deals": serializer.data
        })


    #create deal data = any one can create deal data but if user is admin or staff then they can assign deal to any one but if user is other than admin or staff then deal will be automatically assigned to them

    def post(self, request):
        serializer = DealAdminSerializer(data=request.data)

        if serializer.is_valid():
            if request.user.is_staff or request.user.role == 'ADMIN':
                serializer.save()

            else:
                serializer.save(assigned_to=request.user)

            return Response({"message": "Deal created successfully", "deal": serializer.data}, status=201)

        return Response({"error": "Invalid data", "details": serializer.errors}, status=400)
    

    # update deal data = any one can update deal data but if user is admin or staff then they can update any deal data but if user is other than admin or staff then they can update only their assigned deal data

    def put(self, request, deal_id):
        user = request.user

        if user.is_staff or user.role == 'ADMIN':
            deal = get_object_or_404(Deal, id=deal_id)
        else:
            deal = get_object_or_404(Deal, id=deal_id,assigned_to=user)

        serializer = DealAdminSerializer(deal, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Deal updated successfully", "deal": serializer.data})
        
        return Response({"error": "Invalid data", "details": serializer.errors}, status=400)

    # delete deal data = only admin or staff can delete deal data

    def delete(self, request, deal_id):
        user = request.user

        if not (user.is_staff or user.role == 'ADMIN'):
            return Response({"error": "Permission denied"}, status=403)
        
        deal = get_object_or_404(Deal, id=deal_id)
        deal.delete()

        return Response({"message": "Deal deleted successfully"}, status=200)
            
        


class DocumnetData(APIView):

    permission_classes = [IsAuthenticated]

    # 🔹 LIST or RETRIEVE
    def get(self, request, doc_id=None):

        user = request.user

        if user.is_staff or user.role == 'ADMIN':
            queryset = Document.objects.select_related('lead').all()
        else:
            queryset = Document.objects.select_related('lead').filter(
                lead__assigned_to=user
            )

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

        if user.is_staff or user.role == 'ADMIN':
            document = get_object_or_404(Document, id=doc_id)
        else:
            document = get_object_or_404(
                Document,
                id=doc_id,
                lead__assigned_to=user
            )

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

        # 👉 Only Admin / Staff
        if not (user.is_staff or user.role == 'ADMIN'):
            return Response({"error": "Permission denied"}, status=403)

        document = get_object_or_404(Document, id=doc_id)
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

        # Admin → all payments
        if user.is_staff or user.role == "ADMIN":
            queryset = Payment.objects.select_related("deal").all()

        # User → only their deal payments
        else:
            queryset = Payment.objects.select_related("deal").filter(
                deal__assigned_to=user
            )

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
        
        

    # update payment data = any one can update payment data but if user is admin or staff then they can update any payment data but if user is other than admin or staff then they can update only their assigned payment data based on deal assigned to them

    def put(self, request, payment_id):
        user = request.user

        if user.is_staff or user.role == 'ADMIN':
            payment = get_object_or_404(Payment, id=payment_id)
        else:
            payment = get_object_or_404(Payment, id=payment_id, deal__assigned_to=user)

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

        if not(user.is_staff or user.role == 'ADMIN'):
            return Response({"error": "Permission denied"}, status=403)
        
        payment = get_object_or_404(Payment, id=payment_id)
        payment.delete()

        return Response({"message": "Payment deleted successfully"}, status=200)





# Task assign here 

class TaskData(APIView):

    permission_classes = [IsAuthenticated]

    # GET tasks
    def get(self, request, task_id=None):

        user = request.user

        if user.is_staff or user.role == "ADMIN":
            queryset = Task.objects.select_related(
                "assigned_to",
                "created_by"
            ).all()
        else:
            queryset = Task.objects.select_related(
                "assigned_to",
                "created_by"
            ).filter(
                assigned_to=user
            )

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

        if not (user.is_staff or user.role == "ADMIN"):
            return Response(
                {"error": "Only admin can create and assign tasks"},
                status=403
            )

        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(created_by=user)

            return Response({
                "message": "Task created successfully",
                "data": serializer.data
            }, status=201)

        return Response(serializer.errors, status=400)

    def put(self, request, task_id):

        user = request.user

        # Only Admin or Superuser can update
        if not (user.is_staff or user.is_superuser or user.role == "ADMIN"):
            return Response(
                {"error": "Only admin or superuser can update task"},
                status=403
            )

        task = get_object_or_404(Task, id=task_id)

        serializer = TaskSerializer(task, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Task updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)

    # DELETE task
    def delete(self, request, task_id):

        user = request.user
        task = get_object_or_404(Task, id=task_id)

        if not (user.is_staff or user.role == "ADMIN"):
            return Response({"error": "Permission denied"}, status=403)

        task.delete()

        return Response({"message": "Task deleted successfully"})
    


# task messege

class TaskMessageView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, task_id):

        task = get_object_or_404(Task, id=task_id)

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