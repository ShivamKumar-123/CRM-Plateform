from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator

# Create your models here.

# Add some column in User table

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import FileExtensionValidator


class User(AbstractUser):

    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('SALES', 'Sales'),
        ('DEALER', 'Dealer'),
        ('MANAGER', 'Manager'),
        ('CHANNEL PARTNER', 'Channel Partner'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='SALES'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    territory = models.ForeignKey(
        'Teritories',
        on_delete=models.SET_NULL,   # better than CASCADE for user
        related_name='users',
        null=True,
        blank=True
    )

    company_name = models.CharField(max_length=255, default="", blank=True, null=True)

    gst_number = models.CharField(max_length=15, default="", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()} - {self.get_status_display()}"



#Teritories table here 

class Teritories(models.Model):
    state =models.CharField(max_length=100, default="")
    district = models.CharField(max_length=100, default="")
    city = models.CharField(max_length=100, default="")
    pincode = models.CharField(max_length=6, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.state + " " + self.district + " " + self.city + " " + self.pincode
    

# Lead table here

class Leads(models.Model):

    SOURCE_CHOICES = [
        ('WEBSITE', 'Website'),
        ('REFERRAL', 'Referral'),
        ('SOCIAL_MEDIA', 'Social Media'),
        ('DEALER', 'Dealer'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('SITE_VISIT', 'Site Visit'),
        ('QUOTATION_SENT', 'Quotation Sent'),
        ('DEALED', 'Dealed'),
        ('CANCELLED', 'Cancelled'),
    ]

    BRAND_CHOICES = [
        ('GAUTAM', 'Gautam'),
        ('WAAREE', 'Waaree'),
        ('ADANI', 'Adani'),
    ]

    MODEL_CHOICES = [
        ('DCR', 'DCR'),
        ('NON_DCR', 'Non-DCR'),
        ('HYBRID', 'HYBRID'),
    ]

    WATT_CHOICES = [
        ('3KW', '3 kW'),
        ('5KW', '5 kW'),
        ('7KW', '7 kW'),
        ('10KW', '10 kW'),
        ('10KW_PLUS', '10 kW and above'),
    ]


    leads_source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10, blank=True)
    
    brand_name = models.CharField(
        max_length=20,
        choices=BRAND_CHOICES,
        default='GAUTAM'
    )

    model_name = models.CharField(
        max_length=20,
        choices=MODEL_CHOICES,
        default='DCR'
    )

    watt_capacity = models.CharField(
        max_length=20,
        choices=WATT_CHOICES,
        default='3KW'
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    assigned_to = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        related_name='leads',
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW'
    )


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            # Single indexes (useful for simple filters)
            models.Index(fields=['status']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_at']),

            # Composite indexes (very useful in CRM dashboards)
            models.Index(fields=['status', 'assigned_to']),
            models.Index(fields=['assigned_to', 'created_at']),
        ]


    
    def __str__(self):
        return f"{self.name} | {self.get_brand_name_display()} {self.get_model_name_display()} {self.get_watt_capacity_display()} | {self.get_status_display()}"



# Deal table here
class Deal(models.Model):

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('WON', 'Won'),
        ('CANCELLED', 'Cancelled'),
    ]

    lead = models.ForeignKey('Leads', on_delete=models.CASCADE, related_name='deals')

    assigned_to = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        related_name='deals',
        null=True,
        blank=True
    )


    
    deal_value = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')

    expected_close_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Deal #{self.id} - {self.get_status_display()} - ₹{self.deal_value}"




# Payment table here

class Payment(models.Model):

    PAYMENT_CHOICES = [
        ('CASH', 'Cash'),
        ('CHEQUE', 'Cheque'),
        ('ONLINE', 'Online Transfer'),
        ('FINANCE', 'Finance'),
    ]

    BOOKING_CHOICES = [
        ('BOOKED', 'Booked'),
        ('PARTIAL', 'Partial Payment'),
        ('FULL', 'Full Payment'),
    ]

    deal = models.ForeignKey(
        'Deal',
        on_delete=models.PROTECT,
        related_name='payments'
    )

    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_stage = models.CharField(max_length=20, choices=BOOKING_CHOICES)

    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    reference_number = models.CharField(max_length=255, blank=True, null=True)


    payment_screenshot = models.ImageField(
        upload_to='payment_screenshots/',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['payment_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Payment #{self.id} - {self.get_payment_type_display()} - ₹{self.amount_paid}"


# Document table here

class Document(models.Model):

    DOCUMENT_CHOICES = [
        ('AADHAAR', 'Aadhar Card'),
        ('PAN', 'PAN Card'),
        ('ADDRESS_PROOF', 'Address Proof'),
        ('INCOME_PROOF', 'Income Proof'),
        ('PASSBOOK', 'Passbook'),
        ('OTHER', 'Other'),
    ]

    lead = models.ForeignKey(
        'Leads',
        on_delete=models.CASCADE,
        related_name='documents'
    )

    document_type = models.CharField(
        max_length=100,
        choices=DOCUMENT_CHOICES
    )

    document_file = models.FileField(
        upload_to='documents/',
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png'])]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['document_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.lead.name}"


# Task table here

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

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    assigned_to = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name="tasks"
    )

    created_by = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name="created_tasks"
    )

    due_date = models.DateField(null=True, blank=True)

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="MEDIUM"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.status}"
    

# task message

class TaskMessage(models.Model):

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        msg = self.message.lower()

        if "complete" in msg:
            self.task.status = "COMPLETED"

        elif "nhi hua" in msg or "not done" in msg:
            self.task.status = "PENDING"

        elif "working" in msg or "progress" in msg:
            self.task.status = "IN_PROGRESS"

        # task status update
        if self.task:
            self.task.save()

        super().save(*args, **kwargs)