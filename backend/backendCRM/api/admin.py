from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Leads, Deal, Payment, Document, Teritories, Task, TaskMessage


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = (
        'username',
        'email',
        'role',
        'status',
        'territory',
        'gst_number',
        'company_name',
        'is_staff',
        'is_active',
    )

# Add the new fields to the admin form by extending the fieldsets attribute of UserAdmin to include the new fields in a new section called 'Additional Info'. This will allow you to see and edit the new fields when you view or edit a user in the Django admin interface.


    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'status', 'territory','gst_number','company_name'),
        }),
    )





# Territories Admin
@admin.register(Teritories)
class TerritoriesAdmin(admin.ModelAdmin):
    list_display = ("state", "district", "city", "pincode", "created_at")
    search_fields = ("state", "district", "city", "pincode")
    list_filter = ("state", "district")
    ordering = ("state", "district")


# Leads Admin
@admin.register(Leads)
class LeadsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "phone",
        "city",
        "state",
        "brand_name",
        "watt_capacity",
        "status",
        "assigned_to",
        "created_at",
    )

    search_fields = (
        "name",
        "phone",
        "email",
        "city",
        "state",
    )

    list_filter = (
        "status",
        "brand_name",
        "model_name",
        "watt_capacity",
        "leads_source",
        "created_at",
    )

    autocomplete_fields = ("assigned_to",)

    ordering = ("-created_at",)
    date_hierarchy = "created_at"


# Deal Admin
@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "lead",
        "assigned_to",
        "deal_value",
        "cost_price",
        "status",
        "expected_close_date",
        "created_at",
    )

    search_fields = (
        "lead__name",
        "lead__phone",
    )

    list_filter = (
        "status",
        "assigned_to",
        "created_at",
    )

    autocomplete_fields = ("lead", "assigned_to")

    ordering = ("-created_at",)
    date_hierarchy = "created_at"


# Payment Admin
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "deal",
        "payment_type",
        "payment_stage",
        "amount_paid",
        "total_amount",
        "created_at",
    )

    search_fields = (
        "deal__lead__name",
        "reference_number",
    )

    list_filter = (
        "payment_type",
        "payment_stage",
        "created_at",
    )

    autocomplete_fields = ("deal",)

    ordering = ("-created_at",)
    date_hierarchy = "created_at"


# Document Admin
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "lead",
        "document_type",
        "created_at",
    )

    search_fields = (
        "lead__name",
    )

    list_filter = (
        "document_type",
        "created_at",
    )

    autocomplete_fields = ("lead",)

    ordering = ("-created_at",)
    date_hierarchy = "created_at"


# Inline messages inside Task
class TaskMessageInline(admin.TabularInline):
    model = TaskMessage
    extra = 0
    readonly_fields = ("user", "message", "created_at")


# Task Admin
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "assigned_to",
        "due_date",
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
    )

    list_filter = (
        "status",
        "assigned_to",
        "due_date",
        "created_at",
    )

    autocomplete_fields = ("assigned_to",)

    ordering = ("-created_at",)

    date_hierarchy = "created_at"

    inlines = [TaskMessageInline]


# TaskMessage Admin
@admin.register(TaskMessage)
class TaskMessageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "task",
        "user",
        "message",
        "created_at",
    )

    search_fields = (
        "message",
    )

    list_filter = (
        "created_at",
    )

    ordering = ("-created_at",)
