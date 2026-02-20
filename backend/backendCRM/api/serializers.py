from rest_framework import serializers
from .models import Leads, Deal, Payment

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
            'base_price',
            'status',
            'assigned_to',
            'assigned_to_username',
            'created_at',
            'updated_at',
        ]

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
            'name',
            'brand_name',
            'model_name',
            'watt_capacity',
            'status',
            'assigned_to_username',
            'created_at'
        ]



class DealAdminSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Deal
        fields = '__all__'