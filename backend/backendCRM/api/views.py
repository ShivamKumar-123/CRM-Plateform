from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum, F, DecimalField, Value
from django.db.models.functions import Coalesce
from .models import Leads, Deal, Payment
from .serializers import DashboardSerializer, LeadAdminAndStaffSerializer, LeadOtherSerializer

# dashboard data 

class Dashboard(APIView):

    def get(self, request):

        # 1️⃣ Total Leads
        total_leads = Leads.objects.count()

        # 2️⃣ Total Deals
        total_deals = Deal.objects.count()

        # 3️⃣ Won Deals
        won_deals = Deal.objects.filter(status='WON').count()

        # 4️⃣ Cancelled Deals
        cancelled_deals = Deal.objects.filter(status='CANCELLED').count()

        # 5️⃣ Total Revenue (related_name: payments)
        total_revenue = Payment.objects.filter(
            deal__status='WON'
        ).aggregate(
            total=Coalesce(
                Sum('amount_paid'),
                Value(0),
                output_field=DecimalField()
            )
        )['total']

        # 6️⃣ Total Profit
        total_profit = Deal.objects.filter(
            status='WON'
        ).aggregate(
            profit=Coalesce(
                Sum(
                    F('deal_value') - Coalesce(
                        F('cost_price'),
                        Value(0),
                        output_field=DecimalField()
                    )
                ),
                Value(0),
                output_field=DecimalField()
            )
        )['profit']

    

        

        dashboard_data = {
            "total_leads": total_leads,
            "total_deals": total_deals,
            "won_deals": won_deals,
            "cancelled_deals": cancelled_deals,
            "total_revenue": total_revenue,
            "total_profit": total_profit,
            
        }

        serializer = DashboardSerializer(dashboard_data)

        return Response(serializer.data)


# lead data 

class LeadsData(APIView):

    def get(self, request):

        user = request.user

        if user.is_staff or user.role == 'ADMIN':
            queryset = Leads.objects.select_related('assigned_to').all()
            serializer = LeadAdminAndStaffSerializer(queryset, many=True)

        else:
            queryset = Leads.objects.select_related('assigned_to').filter(
                assigned_to=user
            )
            serializer = LeadOtherSerializer(queryset, many=True)

        return Response(serializer.data)

            

    def post(self, request):

        user = request.user

        if not (user.is_staff or user.role == 'ADMIN'):
            return Response({"error": "You do not have permission to create leads."}, status=403)
        
        serializer = LeadAdminAndStaffSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Lead created successfully.", "lead": serializer.data}, status=201)
        
        return Response({"error": "Invalid data.", "details": serializer.errors}, status=400)
    

    def put(self, request, lead_id):
        pass

        # user = request.user

        # if not (user.is_staff or user.role == 'ADMIN'):
        #     return Response({"error": "You do not have permission to update leads."}, status=403)

        # try:
        #     lead = Leads.objects.get(id=lead_id)
        # except Leads.DoesNotExist:
        #     return Response({"error": "Lead not found."}, status=404)

        # serializer = LeadAdminAndStaffSerializer(lead, data=request.data, partial=True)

        # if serializer.is_valid():
        #     serializer.save()
        #     return Response({"message": "Lead updated successfully.", "lead": serializer.data}, status=200)
        
        # return Response({"error": "Invalid data.", "details": serializer.errors}, status=400)

        def delete(self, request, lead_id):
            pass

            # user = request.user

            # if not (user.is_staff or user.role == 'ADMIN'):
            #     return Response({"error": "You do not have permission to delete leads."}, status=403)

            # try:
            #     lead = Leads.objects.get(id=lead_id)
            # except Leads.DoesNotExist:
            #     return Response({"error": "Lead not found."}, status=404)

            # lead.delete()
            # return Response({"message": "Lead deleted successfully."}, status=200)



# deal data 

class DealData(APIView):
    
    def get(self, request):
            pass
    
    def post(self, request):
        pass

    def put(self, request, deal_id):
        pass

    def delete(self, request, deal_id):
        pass
        