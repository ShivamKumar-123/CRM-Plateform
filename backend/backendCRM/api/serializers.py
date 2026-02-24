from rest_framework import serializers
from .models import Leads, Deal, Payment, Document, Task, TaskMessage

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
            'status',
            'assigned_to_username',
            'created_at'
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