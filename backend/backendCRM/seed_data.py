"""
One-shot seed script. Run with:
    python manage.py shell < seed_data.py

Idempotent-ish: skips users that already exist by username, but adds new leads/deals
each run. Delete from /admin first if you want a clean reset.
"""

import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from api.models import Leads, Deal, Payment, Document, Task, TaskMessage

User = get_user_model()
random.seed(42)


# ─────────────────────────────────────────────────────────────────
# 1. USERS (one of each role)
# ─────────────────────────────────────────────────────────────────
USERS = [
    # username, role, first, last, email
    ("rakesh.sales",    "SALES",           "Rakesh",     "Agarwal",  "rakesh@example.com"),
    ("priya.sales",     "SALES",           "Priya",      "Iyer",     "priya@example.com"),
    ("mohammed.dealer", "DEALER",          "Mohammed",   "Ansari",   "mohammed@example.com"),
    ("anita.dealer",    "DEALER",          "Anita",      "Patel",    "anita@example.com"),
    ("vikram.manager",  "MANAGER",         "Vikram",     "Singh",    "vikram@example.com"),
    ("ravi.partner",    "CHANNEL PARTNER", "Ravi",       "Krishnan", "ravi@example.com"),
]

created_users = []
for username, role, first, last, email in USERS:
    u, made = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "first_name": first,
            "last_name": last,
            "role": role,
            "status": "ACTIVE",
            "is_active": True,
        },
    )
    if made:
        u.set_password("demo12345")
        u.save()
    created_users.append(u)
    print(("  + " if made else "  · ") + f"{username:20s} {role}")

print(f"\nUsers ready: {len(created_users)}")


# ─────────────────────────────────────────────────────────────────
# 2. LEADS
# ─────────────────────────────────────────────────────────────────
NAMES = [
    "Aarav Sharma", "Diya Verma", "Arjun Mehta", "Kavya Reddy", "Vihaan Joshi",
    "Saanvi Nair", "Reyansh Khan", "Anaya Kapoor", "Ishaan Bose", "Myra Chopra",
    "Aditya Rao", "Riya Mishra", "Krish Bhatt", "Ananya Pillai", "Atharv Shah",
    "Sara Malhotra", "Aryan Das", "Tara Goel", "Vivaan Jain", "Pari Saxena",
    "Yash Pandey", "Aadhya Khanna", "Kabir Menon", "Zara Sinha", "Dhruv Bansal",
]

CITIES = [
    ("Mumbai",      "Maharashtra",  "400001"),
    ("Pune",        "Maharashtra",  "411001"),
    ("Bengaluru",   "Karnataka",    "560001"),
    ("Chennai",     "Tamil Nadu",   "600001"),
    ("Hyderabad",   "Telangana",    "500001"),
    ("Jaipur",      "Rajasthan",    "302001"),
    ("Ahmedabad",   "Gujarat",      "380001"),
    ("Surat",       "Gujarat",      "395001"),
    ("Lucknow",     "Uttar Pradesh","226001"),
    ("Indore",      "Madhya Pradesh","452001"),
    ("Bhopal",      "Madhya Pradesh","462001"),
    ("Chandigarh",  "Punjab",       "160001"),
    ("Kochi",       "Kerala",       "682001"),
    ("Coimbatore",  "Tamil Nadu",   "641001"),
    ("Nagpur",      "Maharashtra",  "440001"),
]

SOURCES   = ["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "DEALER", "OTHER"]
BRANDS    = ["GAUTAM", "WAAREE", "ADANI"]
MODELS    = ["DCR", "NON_DCR", "HYBRID"]
WATTS     = ["3KW", "5KW", "7KW", "10KW", "10KW_PLUS"]
STATUSES  = ["NEW", "CONTACTED", "SITE_VISIT", "QUOTATION_SENT", "DEALED", "CANCELLED"]

# Weighted so most leads aren't DEALED/CANCELLED
STATUS_WEIGHTS = [22, 18, 16, 14, 18, 12]

PRICES = {
    "3KW":       Decimal("210000"),
    "5KW":       Decimal("325000"),
    "7KW":       Decimal("445000"),
    "10KW":      Decimal("620000"),
    "10KW_PLUS": Decimal("780000"),
}

created_leads = []
for i in range(35):
    name = NAMES[i % len(NAMES)]
    city, state, pin = random.choice(CITIES)
    watt = random.choice(WATTS)
    base = PRICES[watt] + Decimal(random.randint(-15000, 15000))
    status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]
    assignee = random.choice(created_users)
    phone = f"+91 9{random.randint(100000000, 999999999)}"

    lead = Leads.objects.create(
        leads_source=random.choice(SOURCES),
        name=name,
        email=name.lower().replace(" ", ".") + "@gmail.com",
        phone=phone,
        city=city,
        state=state,
        pincode=pin,
        brand_name=random.choice(BRANDS),
        model_name=random.choice(MODELS),
        watt_capacity=watt,
        base_price=base,
        status=status,
        assigned_to=assignee,
    )
    created_leads.append(lead)

print(f"\nLeads created this run: {len(created_leads)}")


# ─────────────────────────────────────────────────────────────────
# 3. DEALS (for QUOTATION_SENT / DEALED / CANCELLED leads)
# ─────────────────────────────────────────────────────────────────
DEAL_LEADS = [l for l in created_leads if l.status in ("QUOTATION_SENT", "DEALED", "CANCELLED")]
created_deals = []

for lead in DEAL_LEADS:
    deal_value = lead.base_price + Decimal(random.randint(-5000, 25000))
    cost_price = deal_value * Decimal("0.75") + Decimal(random.randint(-10000, 10000))

    if lead.status == "DEALED":
        deal_status = "WON"
    elif lead.status == "CANCELLED":
        deal_status = "CANCELLED"
    else:
        deal_status = "OPEN"

    deal = Deal.objects.create(
        lead=lead,
        assigned_to=lead.assigned_to,
        deal_value=deal_value,
        cost_price=cost_price,
        status=deal_status,
        expected_close_date=date.today() + timedelta(days=random.randint(-30, 90)),
    )
    created_deals.append(deal)

print(f"Deals created this run:  {len(created_deals)}")


# ─────────────────────────────────────────────────────────────────
# 4. PAYMENTS (on WON deals)
# ─────────────────────────────────────────────────────────────────
PAY_TYPES   = ["CASH", "CHEQUE", "ONLINE", "FINANCE"]
PAY_STAGES  = ["BOOKED", "PARTIAL", "FULL"]

created_payments = 0
for deal in [d for d in created_deals if d.status == "WON"]:
    # Booking payment
    Payment.objects.create(
        deal=deal,
        payment_type=random.choice(PAY_TYPES),
        payment_stage="BOOKED",
        amount_paid=deal.deal_value * Decimal("0.20"),
        total_amount=deal.deal_value,
        reference_number=f"BK{random.randint(100000, 999999)}",
    )
    created_payments += 1

    # Maybe a partial / full follow-up
    if random.random() > 0.3:
        Payment.objects.create(
            deal=deal,
            payment_type=random.choice(PAY_TYPES),
            payment_stage=random.choice(["PARTIAL", "FULL"]),
            amount_paid=deal.deal_value * Decimal("0.55"),
            total_amount=deal.deal_value,
            reference_number=f"TX{random.randint(100000, 999999)}",
        )
        created_payments += 1

print(f"Payments created:        {created_payments}")


# ─────────────────────────────────────────────────────────────────
# 5. TASKS
# ─────────────────────────────────────────────────────────────────
admin = User.objects.filter(is_superuser=True).first()
TASK_TITLES = [
    ("Site survey — call customer first", "HIGH",   "PENDING"),
    ("Send quotation PDF",                 "HIGH",   "IN_PROGRESS"),
    ("Follow up on Aadhaar upload",        "MEDIUM", "PENDING"),
    ("Coordinate panel delivery",          "HIGH",   "IN_PROGRESS"),
    ("Update payment status",              "LOW",    "COMPLETED"),
    ("Schedule installation crew",         "MEDIUM", "PENDING"),
    ("Customer satisfaction call",         "LOW",    "PENDING"),
    ("Verify GST + tax invoice",           "MEDIUM", "COMPLETED"),
]

created_tasks = 0
if admin:
    for title, priority, status in TASK_TITLES:
        Task.objects.create(
            title=title,
            description=f"Auto-generated demo task — {title.lower()}.",
            assigned_to=random.choice(created_users),
            created_by=admin,
            due_date=date.today() + timedelta(days=random.randint(1, 14)),
            priority=priority,
            status=status,
        )
        created_tasks += 1

print(f"Tasks created:           {created_tasks}")


# ─────────────────────────────────────────────────────────────────
# 6. Final tally
# ─────────────────────────────────────────────────────────────────
print("\n" + "=" * 50)
print("SEED COMPLETE — totals in DB:")
print(f"  Users:    {User.objects.count()}")
print(f"  Leads:    {Leads.objects.count()}")
print(f"  Deals:    {Deal.objects.count()}")
print(f"  Payments: {Payment.objects.count()}")
print(f"  Tasks:    {Task.objects.count()}")
print("=" * 50)
print("\nDemo users (all password = 'demo12345'):")
for u in created_users:
    print(f"  {u.username:22s} {u.role}")
