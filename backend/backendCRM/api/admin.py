from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Leads, Deal, Payment, Document, Teritories


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





admin.site.register(Leads)
admin.site.register(Deal)
admin.site.register(Payment)
admin.site.register(Document)

admin.site.register(Teritories)
