# CRM Suite — Feature Document

**Project:** CRM Suite — industry-agnostic multi-tenant CRM platform
**Repo:** CRM-Advance-International-Solar (history started solar-only; now generic)
**Audience:** Any business — solar, real estate, healthcare, education, logistics, e-commerce, manufacturing, agencies, finance, insurance, B2B sales, services
**Last updated:** 2026-05-20 (Phase 5 — Enterprise Foundation Pack: Lead Scoring · Duplicate Detection · Sales Targets · Industry Templates · Saved Views · Call Logs)

This document catalogues every feature shipped across the three apps in this repository.

---

## 1. Overview

CRM Suite started as a vertical CRM for Indian solar installers and has been transformed into a **multi-tenant, industry-agnostic SaaS platform** styled along Zoho CRM / HubSpot / Salesforce / Monday CRM but lighter and self-hostable. Every Lead, Deal, Task, Payment, and Document is scoped to an `Organization`. Each organization picks its industry, configures its own status pipeline, and gets its own users, branding, and quotas.

**Three deliverables:**

| App | Path | Stack |
|-----|------|-------|
| Backend API | [`backend/backendCRM/`](backend/backendCRM/) | Django 6 · DRF · SimpleJWT · PostgreSQL · WhiteNoise · Gunicorn |
| Web frontend | [`frontend/`](frontend/) | React 19 · Vite 7 · Tailwind 4 · Framer Motion · React Router 7 |
| Mobile app | [`mobile/`](mobile/) | Expo SDK 54 · React Native 0.81 · React Navigation 7 · AsyncStorage |

---

## 2. Tech & Tooling Stack

### Backend
- **Framework:** Django 6.0.2 + Django REST Framework 3.16.1
- **Database:** PostgreSQL (psycopg2-binary)
- **Auth:** JWT via `djangorestframework-simplejwt` (rotating refresh tokens)
- **Static:** WhiteNoise with compressed manifest storage
- **WSGI server:** Gunicorn
- **Config:** `python-decouple` for environment variables
- **CORS:** `django-cors-headers` (origin whitelist)
- **Media handling:** Pillow for image uploads
- **Throttling:** DRF built-in (30/min anon, 1000/hr user)

### Frontend (web)
- **Build:** Vite 7
- **UI:** React 19 + Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Animations:** Framer Motion 12 (page transitions, stagger, parallax)
- **Routing:** React Router v7 with nested protected routes
- **Icons:** Lucide React
- **State:** React Context (`AuthContext`, `ThemeContext`) + local component state

### Mobile
- **Framework:** Expo SDK 54 (JavaScript)
- **Navigation:** React Navigation v7 — native-stack + bottom-tabs
- **Storage:** `@react-native-async-storage/async-storage`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Safe areas:** `react-native-safe-area-context`

---

## 3. Multi-Tenant Architecture (NEW)

Every business-data record is scoped to an `Organization`. Tenant isolation is enforced **server-side** on every API endpoint — UI is just a hint.

### 3.1 Organization model
- `name`, `slug` (auto-generated, unique, used in URLs)
- `industry` — 14 choices: GENERAL, SOLAR, REAL_ESTATE, HEALTHCARE, EDUCATION, LOGISTICS, ECOMMERCE, MANUFACTURING, AGENCY, FINANCE, INSURANCE, B2B_SALES, SERVICES, OTHER
- `plan` — FREE / PRO / ENTERPRISE
- `status` — ACTIVE / TRIAL / SUSPENDED / CANCELLED
- `owner` FK to a User
- Branding: `primary_color`, `accent_color`, `logo`
- Quotas: `max_users`, `max_leads`, `max_storage_mb`
- Contact: `email`, `phone`, `address`
- `trial_ends_at`

### 3.2 Tenant FK on every business model
- `User.organization` — nullable (platform super-admins span tenants)
- `Leads.organization` — required after migration
- `Deal.organization` — required after migration
- `Task.organization` — required after migration
- `Teritories.organization`
- `Pipeline.organization`
- Child records (Payment, Document, TaskMessage) traverse parent FK

### 3.3 Tenant scoping helpers ([api/tenancy.py](backend/backendCRM/api/tenancy.py))
- `scope_qs(qs, request)` — filters every queryset by `request.user.organization`. Super-admins with `?org=<slug>` filter scope to that org; without it, see all.
- `require_org(request)` — picks the org to write into on POSTs.
- `get_request_org(request)` — resolves cross-tenant intent.

### 3.4 Migration safety
Migration [0013_seed_default_org.py](backend/backendCRM/api/migrations/0013_seed_default_org.py) ran when this feature shipped:
- Created `Default Organization` (industry=SOLAR, plan=ENTERPRISE)
- Assigned all pre-existing leads, deals, tasks, territories, users → default org
- **Zero data loss** for existing solar customers
- Created 7-stage default Lead pipeline + 3-stage default Deal pipeline

---

## 4. Configurable Pipelines (NEW)

Hardcoded solar status enums (NEW → CONTACTED → SITE_VISIT → QUOTATION_SENT → DEALED/CANCELLED) have been **replaced** with per-organization configurable pipelines.

### 4.1 Pipeline model
- `organization` FK
- `module` — `lead` / `deal` / `task`
- `name`, `is_default`

### 4.2 PipelineStage model
- `pipeline` FK
- `name`, `slug`, `color`
- `order` (display order in kanban)
- `is_closed_won`, `is_closed_lost`

### 4.3 Default stages seeded per new org
**Lead pipeline:** New → Contacted → Qualified → Proposal Sent → Negotiation → Won / Lost
**Deal pipeline:** Open → Won / Cancelled

### 4.4 API
- `GET /api/pipelines/?module=lead` — returns the org's lead pipeline with all stages

Frontend `AdminLeads` reads this on mount and drives the status dropdown dynamically. Falls back to defaults if the API is unreachable.

---

## 5. Backend Features

### 5.1 Authentication & Authorization
- **JWT login** at `POST /api/token/` returns `{access, refresh}` token pair
- **Token refresh** at `POST /api/token/refresh/` with refresh-token rotation enabled
- **Access lifetime:** 60 minutes (configurable via `JWT_ACCESS_MINUTES`)
- **Refresh lifetime:** 7 days (configurable via `JWT_REFRESH_DAYS`)
- **Bearer-token auth** enforced globally as DRF default
- **Role-based authorisation** checked per view, then **tenant-scoped** on top

### 5.2 Expanded Role System
The role list now reflects a generic SaaS hierarchy (legacy SOLAR-era roles preserved for back-compat):

| Role | Typical permissions |
|------|--------------------|
| **OWNER** | Organization owner — full power within their org |
| **ADMIN** | Org admin — manage users, all CRUD, can't change billing |
| **MANAGER** | Read-write on all org data, can edit team |
| **TEAM_LEAD** | Read-write on team-assigned data |
| **SALES** | Read-write on own assigned leads/deals |
| **SUPPORT** | Read-write on tickets and customer history |
| **EMPLOYEE** | Read assigned data |
| **VIEWER** | Read-only |
| _DEALER_ | (legacy) like SALES |
| _CHANNEL PARTNER_ | (legacy) like SALES |

Platform-level `User.is_superuser=True` is a separate axis that crosses organizations.

### 5.3 Custom User Model
Extended `AbstractUser` with:
- `organization` FK (nullable for super-admins)
- `role` — see above
- `status` — ACTIVE / INACTIVE
- `territory` FK
- `company_name`, `gst_number` — for dealer / channel-partner accounts
- timestamps

### 5.4 Leads (industry-agnostic)

Now free-text where it used to be solar-specific:

| Field | Type | Notes |
|-------|------|-------|
| `leads_source` | CharField | UI suggests WEBSITE/REFERRAL/SOCIAL_MEDIA/DEALER/PHONE/EMAIL/EVENT/OTHER |
| `name`, `email`, `phone` | required basics | |
| `city`, `state`, `pincode` | optional | |
| `product_name`, `product_category` | **NEW** free-text generic | e.g. "5kW rooftop solar", "3BHK apartment", "Health checkup package" |
| `brand_name`, `model_name`, `watt_capacity` | preserved free-text | (used to be solar enums, kept for backward compat) |
| `base_price` | decimal | |
| `tags` | comma-separated CharField | |
| `notes` | TextField | |
| `status` | free-text | actual valid values come from org's lead Pipeline |
| `pipeline` | FK | the active pipeline |
| `assigned_to` | FK to User | |
| `organization` | FK | required, tenant scope |

**Endpoints:**
| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/leads/` | List with stats — scoped to user's org |
| GET | `/api/leads/<id>/` | Single |
| POST | `/api/leads/` | Create — auto-attaches org |
| PUT | `/api/leads/<id>/` | Update |
| DELETE | `/api/leads/<id>/` | Delete |

### 5.5 Deals
- `status` — free text driven by deal pipeline
- `pipeline` FK
- `notes`
- `deal_value`, `cost_price` → server-computed profit
- `expected_close_date`
- `organization` FK + `assigned_to`

Same CRUD + stats endpoint pattern as Leads.

### 5.6 Payments
Payment types now include: CASH / CHEQUE / ONLINE / FINANCE / **UPI** / **CARD**
Stages: BOOKED / PARTIAL / FULL
PROTECT cascade on Deal FK; tenant-scoped via `deal.organization`.

### 5.7 Documents (KYC / general)
Document types now include: AADHAAR / PAN / ADDRESS_PROOF / INCOME_PROOF / PASSBOOK / **CONTRACT** / **INVOICE** / OTHER
File: PDF / JPG / JPEG / PNG with `FileExtensionValidator`
5 MB cap.

### 5.8 Tasks & Task Messages
Tasks now carry `organization` FK. Smart keyword auto-status-update on TaskMessage creation preserved:
- "complete" → COMPLETED
- "nhi hua" / "not done" → PENDING
- "working" / "progress" → IN_PROGRESS

### 5.9 Dashboard
`GET /api/dashboard/` — returns aggregates scoped to user's org (or `?org=<slug>` for super-admins).

```json
{
  "total_leads": 1245,
  "total_deals": 87,
  "won_deals": 52,
  "cancelled_deals": 18,
  "total_revenue": 4820000.00,
  "total_profit": 1240000.00
}
```

### 5.10 Current user — `/api/me/`
Returns full profile **with nested organization**:
```json
{
  "id": 1,
  "username": "admin",
  "role": "ADMIN",
  "is_superuser": true,
  "organization": {
    "id": 1, "name": "Default Organization",
    "slug": "default", "industry": "SOLAR",
    "plan": "ENTERPRISE", "status": "ACTIVE", ...
  }
}
```

---

## 6. Super-Admin Platform Console (NEW)

Separate route tree at `/admin/*` — dedicated dashboard for `is_superuser=True` accounts. Distinct from the per-org `/app/*` dashboard.

### 6.1 Pages

| Path | Page | Purpose |
|------|------|---------|
| `/admin` | Overview | 4 platform KPIs + 5 quick-links + 5 distribution charts + top performers |
| `/admin/organizations` | **Organizations** | Card grid of all tenants; create / edit / suspend / delete (default org protected) |
| `/admin/users` | Users | All users across all orgs (or `?org=<slug>` filtered) — CRUD with role + password + flags |
| `/admin/leads` | Leads | Cross-org lead view with full CRUD + filter |
| `/admin/deals` | Deals | Cross-org deal view |
| `/admin/customers` | Customers | DEALED leads + all-leads toggle |
| `/admin/reports` | Reports | Monthly chart + distributions + top performers |
| `/admin/system` | System | Stack info, API URLs, security checklist |

### 6.2 Organizations management
- Create new tenant (any industry preset) → auto-seeds default Lead + Deal pipelines for them
- Configure quotas (max_users / max_leads / max_storage_mb)
- Set branding colors per org
- Suspend / cancel without deleting
- Default org cannot be deleted

### 6.3 Endpoints (super-admin only — `IsSuperUser` permission)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/stats/` | Platform aggregates (cross-tenant or `?org=<slug>`) |
| GET / POST | `/api/admin/users/` | List / create users (across orgs) |
| GET / PATCH / DELETE | `/api/admin/users/<id>/` | Per-user CRUD + password reset + flag toggle |
| GET / POST | `/api/admin/organizations/` | List / create tenants |
| GET / PATCH / DELETE | `/api/admin/organizations/<id>/` | Per-tenant CRUD + suspend |

---

## 6.5 Platform Extensions (Phase 3 scaffolded → Phase 4 mostly completed)

Eight enterprise SaaS features. **5 of 8 are now fully working** — the other 3 require external service credentials you must provide.

### Status legend
- 🟢 **Working** — fully functional, used in tests
- 🟡 **Scaffold** — data layer + UI exist; execution layer waits on external service

### 6.5.1 Automation Engine — `/admin/automation`  🟡 scaffold
- **Model:** `AutomationRule` (org-scoped, `trigger_event`, `conditions` JSON, `actions` JSON, `is_active`, `run_count`, `last_run_at`)
- **Triggers supported:** `lead_created` · `lead_status_changed` · `lead_assigned` · `deal_won` · `deal_lost` · `payment_received` · `task_overdue` · `task_completed`
- **Endpoints:** `GET/POST /api/automation/rules/`, `GET/PATCH/DELETE /api/automation/rules/<id>/`
- **Status:** Rules persist + UI works. **Execution engine** needs Celery + Redis (set `CELERY_BROKER_URL` in `.env`).

### 6.5.2 WhatsApp Integration — `/admin/whatsapp`  🟡 scaffold
- **Models:** `WhatsAppConfig` (one-per-org) + `WhatsAppMessage` (in/out, status, body, template_name, external_id, sent_at)
- **Endpoints:** `GET/PUT /api/whatsapp/config/`, `GET/POST /api/whatsapp/messages/`
- **Status:** Config saves, messages log as `PENDING`. **Actual send** needs Meta WhatsApp Business Cloud API credentials (`WHATSAPP_*` in `.env`).

### 6.5.3 Billing & Subscriptions — `/admin/billing`  🟡 scaffold
- **Models:** `Plan` (3 seeded: Free ₹0, Pro ₹2499/mo, Enterprise ₹9999/mo) + `Subscription` + `Invoice`
- **Endpoints:** `GET /api/billing/plans/`, `GET/POST /api/billing/subscription/`, `GET /api/billing/invoices/`, `POST /api/billing/checkout/`
- **Status:** Plans + subscriptions + invoices persist. **Razorpay checkout** needs `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` in `.env`.

### 6.5.4 Drag-and-Drop Pipelines — `/admin/pipelines`  🟢 WORKING
- Uses `Pipeline` + `PipelineStage` models from Phase 2
- **Endpoint:** `POST /api/pipelines/<id>/reorder/` — atomic reorder
- **UI:** Real **@dnd-kit** drag handles with PointerSensor + KeyboardSensor. Grab the ⋮⋮ icon and drag stages vertically; "Save order" button appears when dirty.
- **Verified:** Reorder NEW↔CONTACTED via API → confirmed in pipeline data → restored via second drag → confirmed.

### 6.5.5 Custom Fields Engine — `/admin/custom-fields`  🟢 WORKING
- **Models:** `CustomField` (per-org, per-module, 11 field types) + `CustomFieldValue` (FK to lead/deal/task)
- **Endpoints:** `GET/POST /api/custom-fields/?module=lead|deal|task|customer`, `PATCH/DELETE /api/custom-fields/<id>/`
- **UI:** Module tabs + full CRUD modal · **Dynamic form rendering** on AdminLeads — `<CustomFieldInput>` renders correct widget per field type (text / number / date / select / multi-select / checkbox / textarea / email / phone / URL).
- **Lead serializer** exposes nested `custom_fields: {slug: value}` dict. POST/PUT accepts the same shape and persists to `CustomFieldValue` rows.
- **Verified:** Created `property_size_sqft` field → created lead with `{property_size_sqft: 2400}` → re-fetched returns `2400.0` → PATCHed to `3500` → re-fetched returns `3500.0`.

### 6.5.6 Audit Logs — `/admin/audit-logs`  🟢 WORKING
- **Model:** `AuditLog` (org, user, action, model_name, object_id, object_repr, changes JSON, ip_address, user_agent, timestamp)
- **Endpoint:** `GET /api/audit-logs/` — tenant-scoped, latest 500
- **Signal producers** in [api/signals.py](backend/backendCRM/api/signals.py):
  - `pre_save` snapshots tracked fields for diff capture
  - `post_save` writes CREATE / UPDATE rows with `{field: {from, to}}` diffs
  - `post_delete` writes DELETE rows
  - `user_logged_in` / `user_logged_out` signals write LOGIN / LOGOUT rows
  - Models covered: Leads, Deal, Payment, Task, User
- **Tracked fields per model:** ~5–10 high-value fields each (status, amounts, assignments, role, etc.). Excludes timestamps and large blob fields.
- **Verified:** Created a lead → AuditLog `[CREATE]` row appeared. Updated `status NEW → CANCELLED` → row appeared with exact diff `{"status": {"from": "NEW", "to": "CANCELLED"}}`.

### 6.5.7 Two-Factor Authentication — `/admin/two-factor`  🟢 WORKING
- **Model:** `TwoFactorSecret` (one-per-user with `secret` base32, `is_enabled`, `backup_codes` JSON, `enabled_at`, `last_used_at`)
- **Endpoints:** `GET /api/2fa/status/`, `POST /api/2fa/setup/`, `POST /api/2fa/verify/`, `POST /api/2fa/disable/`
- **Setup flow:** Returns base32 secret + `otpauth://` URI + **base64-encoded PNG QR code** (rendered with `qrcode` library) for scanning with Google Authenticator / Authy / 1Password.
- **Verify flow:** Validates 6-digit code with `pyotp.TOTP(secret).verify(code, valid_window=1)` (±30s leeway). On first enable, generates **8 backup codes** (format `XXXX-XXXX-XXXX`) shown once.
- **Login enforcement** via custom [TwoFactorTokenObtainPairView](backend/backendCRM/api/auth.py): `/api/token/` checks if user has `is_enabled=True`. If yes and no `otp` provided → 401 with `requires_2fa: true`. Otherwise verifies OTP or backup code before issuing JWT.
- **Frontend Login UI** detects `requires_2fa` and slides in an animated OTP field (big monospace 6-digit input, yellow border) on the same page.
- **Verified:** Generated secret + scanned QR + verified with `pyotp`-generated code → enabled + got 8 backup codes. Login w/o OTP → 401 `requires_2fa: true`. Login with fresh TOTP → 200 + tokens. Login with wrong OTP → 401.

### 6.5.8 Notifications  🟢 FULLY WORKING (web + mobile)
- **Model:** `Notification` (user, type, title, body, link, read, read_at, organization)
- **Endpoints:** `GET /api/notifications/` (returns `{unread_count, notifications: [...]}`), `POST /api/notifications/<id>/read/`, `POST /api/notifications/read-all/`
- **Real producers** wired in [api/signals.py](backend/backendCRM/api/signals.py):
  - Lead created with an assignee → `lead_assigned` notification to assignee
  - Lead reassigned to a different user → `lead_assigned` notification
  - Deal `status` transitions to `WON` → `deal_won` notification to the deal's owner
  - Payment created → `payment_received` notification to the deal's owner
  - Task created with an assignee → `task_due` notification
- **Web UI:** [NotificationBell.jsx](frontend/src/components/NotificationBell.jsx) in user-app Navbar — polls every 60s, shows unread badge (9+ cap), animated dropdown with mark-as-read on click
- **Mobile UI:** Dedicated **Notifications tab** (5th tab) with badge for unread count; color-coded type icons; pull-to-refresh; "Mark all read" with confirmation alert
- **Verified:** Created notification via ORM → bell badge showed `1` → fetch endpoint returned correct count → `POST /read-all/` flipped `unread_count` to `0` and `total=1, read=True`.

---

## 7. Web Frontend Features

### 7.1 Public Landing Page (`/`)  — industry-agnostic
13-section premium SaaS landing page at [Landing.jsx](frontend/src/pages/Landing.jsx) with:
- **Announcement bar** highlighting platform extensions (Multi-tenant SaaS · Custom fields · 2FA · Audit logs · Notifications)
- **Sticky nav** with dark/light theme toggle + Sign In CTA
- **Hero** — "One CRM for every industry you run" with animated Sparkles icon; subtitle lists industries served
- **Industries marquee** — infinite scrolling list of 12 industries (Real Estate · Healthcare · Education · Logistics · E-commerce · Manufacturing · Solar · Finance · Insurance · Agencies · B2B Sales · Services)
- **Animated stats counter** (1245+ leads, 87% conversion, ₹48L revenue, 12-min response)
- **Dashboard preview** — browser mockup with KPI cards, revenue chart, activity feed (industry-neutral copy)
- **12-feature grid** with gradient icons + hover effects (Lead Pipeline, Configurable Pipelines, Custom Fields, Deal Management, Real-time Analytics, KYC & Documents, Payment Tracking, Multi-tenant SaaS, Role-based Access, Notifications & Audit, Native Mobile App, Enterprise Security)
- **How it works** — 4 steps (Capture → Qualify → Close → Install & Retain)
- **Mobile app showcase** — phone mockup with 3 lead cards from different industries (Solar · Real Estate · Healthcare)
- **Testimonials** — 3 customers across solar, real estate, healthcare
- **Pricing** — Free (₹0) · Pro (₹2499/mo) · Enterprise (₹9999/mo)
- **Integrations grid** — 12 tool tiles
- **FAQ accordion** — 6 industry-agnostic questions
- **Final CTA banner** with radial gradient
- **Multi-column footer**

Authenticated visitors see "Open Dashboard" CTA instead of "Sign In" everywhere.

### 7.2 Login Page (`/login`)
JWT login, redirects to intended route on success, stores tokens in localStorage.

### 7.3 Per-Org App Shell (`/app/*`)
[Layout.jsx](frontend/src/Layout.jsx) wrapped in `<ProtectedRoute>`:
- Sidebar shows **organization name + industry + plan** in a gradient pill above the user pill
- Pages: Dashboard, Leads, Deals, Customers, Reports, Settings
- Sidebar Super Admin crown link visible only when `isSuperUser` → goes to `/admin`

### 7.4 Super Admin Console (`/admin/*`)
[AdminLayout.jsx](frontend/src/layouts/AdminLayout.jsx) — separate yellow-themed sidebar with **15 sections grouped into 3 categories**, distinct from the regular app. Guard: [SuperAdminRoute.jsx](frontend/src/components/SuperAdminRoute.jsx) redirects non-superusers to `/app`.

Sidebar layout:
```
👑 Super Admin Console
├── Overview · Organizations · Users · Leads · Deals · Customers
├── ── PLATFORM ──
│   ├── Pipelines (drag-drop scaffold)
│   ├── Custom Fields
│   ├── Automation
│   ├── WhatsApp
│   ├── Billing
│   ├── Audit Logs
│   └── Two-Factor
└── ── INSIGHTS ──
    ├── Reports
    └── System
```

### 7.5 Notification Bell (NEW — fully working)
[NotificationBell.jsx](frontend/src/components/NotificationBell.jsx) replaces the static bell icon in the user app Navbar. Polls `/api/notifications/` every 60 seconds. Shows unread badge (capped at 9+). Click opens an animated dropdown with mark-as-read on row click + "Mark all read" button.

### 7.6 Theme System
[ThemeContext.jsx](frontend/src/context/ThemeContext.jsx) toggles between **dark mode** (default — black + yellow + sky-blue gradients) and **light mode** (wheat `#f5deb3` background with warm bronze borders and softened accents).

- Toggle button (Sun/Moon icon with rotation animation) lives in:
  - Landing nav
  - User app navbar (next to bell)
  - Admin layout sidebar (inside user pill)
- Theme persists in localStorage and survives reload
- ~120 lines of CSS overrides in [index.css](frontend/src/index.css) flip the most common Tailwind dark utilities to wheat equivalents

### 7.7 Dynamic Pipeline-Driven UI
[AdminLeads.jsx](frontend/src/pages/admin/AdminLeads.jsx):
- Fetches `/api/pipelines/?module=lead` on mount
- Status dropdown (filter + edit form) populated from the org's actual pipeline stages
- Falls back to defaults if the API is unreachable
- Lead modal: free-text Product/Service field, Category, Brand, Tags, Notes (replaces solar Brand/Model/Watt enums)

### 7.8 Industry-agnostic admin Organizations page
[AdminOrganizations.jsx](frontend/src/pages/admin/AdminOrganizations.jsx) — card grid with avatar gradient from each org's primary→accent color, plan + status badges, user/lead/deal counts, full CRUD modal.

---

## 8. Mobile App Features

### 8.1 Screens (5 tabs after auth)
- **LandingScreen** — first-launch welcome with glowing orbs, hero, card preview, feature rows, Get Started CTA
- **LoginScreen** — JWT auth + **2FA OTP field** that slides in on `requires_2fa: true` from server
- **DashboardScreen** — KPIs scoped to user's org, pull-to-refresh, greets by username
- **LeadsScreen** — searchable, status-coloured cards. Shows `product_name` / `product_category` with fallback to legacy `brand_name` / `watt_capacity` (industry-agnostic)
- **DealsScreen** — stats summary + cards
- **NotificationsScreen** (NEW) — bell tab with **unread badge** in tab bar. Color-coded type icons (lead_assigned / deal_won / payment_received / task_due). Pull-to-refresh. Tap to mark-read. "Mark all read" button with confirmation Alert.
- **ProfileScreen** — username with SUPER chip if superuser · **Organization card** (avatar with `primary_color` fill, name, slug, plan badge, status badge, industry) · API URL · Logout

### 8.2 Auth context
- AsyncStorage tokens (`crm_access`, `crm_refresh`, `crm_username`)
- Auto-refresh on 401 (same pattern as web)
- Hydrates full user profile via `/api/me/` on login + on app boot — exposes `organization`, `isSuperUser`, `isStaff`, `role`
- Bootstrapping splash while AsyncStorage loads
- Login function returns `{ok, requires2fa, error}` so LoginScreen can detect the 2FA challenge

### 8.3 Branding (app.json)
- Name: "CRM Suite"
- Slug: `crm-suite`
- Bundle ID: `in.advancesolar.crmsuite` (iOS + Android)
- `primaryColor`: yellow `#facc15`
- `userInterfaceStyle`: dark
- Splash background: black
- Android adaptive icon background: yellow

### 8.4 Configurable API URL
[config.js](mobile/src/config.js) auto-picks based on platform (iOS sim / Android emu / Expo Go LAN IP).

---

## 9. Theming & Branding

| Mode | Background | Accents | Where |
|------|-----------|---------|-------|
| Dark (default) | `#000000` | yellow `#facc15` + sky `#38bdf8` + amber `#f59e0b` | Original design |
| Light | `wheat #f5deb3` | yellow + softened sky | Toggle in nav |

Each Organization can set its own `primary_color` and `accent_color` (foundation for full white-labelling; not yet driving UI tokens).

---

## 10. Cross-cutting Features

### 10.1 Role-based access control
| Role | Lead access | Deal access | Task create | Doc/payment delete | User mgmt |
|------|-------------|-------------|-------------|--------------------|-----------|
| Super Admin (platform) | All across all orgs | All | ✅ | ✅ | ✅ |
| OWNER / ADMIN | All in org | All in org | ✅ | ✅ | ✅ |
| MANAGER | All in org | All in org | ✅ | ❌ | ❌ |
| SALES / TEAM_LEAD | Assigned only | Assigned only | ❌ | ❌ | ❌ |
| Others | Read scoped data | Read scoped | ❌ | ❌ | ❌ |

Enforced server-side via [tenancy.py](backend/backendCRM/api/tenancy.py) `scope_qs()` + per-view role checks.

### 10.2 Tenant isolation
- Every list/detail/update/delete view filters by `request.user.organization` automatically
- Cross-tenant access ONLY for super-admins, and only when they explicitly opt in via `?org=<slug>`
- Verified: a SALES user from one org cannot see another org's data even with hand-crafted requests

### 10.3 Query performance
- Composite indexes on `(organization, status)`, `(organization, assigned_to)`, `(organization, created_at)` for Leads/Deal/Task
- `select_related("organization", "assigned_to")` on every list view
- DB connection pooling: `CONN_MAX_AGE=60`

### 10.4 Animation language
- Spring physics across mobile + web (stiffness 80–200, damping 14–20)
- Stagger children (0.05–0.1s)
- AnimatePresence for route transitions
- Pull-to-refresh on mobile, click-to-refresh on web

---

## 11. Security

| Concern | Implementation |
|---------|----------------|
| Auth | JWT bearer tokens, rotating refresh, no session cookies |
| Token storage | localStorage (web) / AsyncStorage (mobile) |
| Tenant isolation | Server-side filtering in every view |
| Password hashing | Django's PBKDF2 + SHA-256 (default) |
| Password validators | UserAttribute / MinLength / CommonPassword / Numeric |
| CORS | Origin whitelist via `CORS_ALLOWED_ORIGINS` (env-driven) |
| CSRF trusted origins | env-driven |
| Throttling | DRF anon 30/min, user 1000/hr |
| HTTPS enforcement | `SECURE_SSL_REDIRECT`, `SECURE_PROXY_SSL_HEADER` for reverse proxies |
| HSTS | 1-year `Strict-Transport-Security` when `DEBUG=False` |
| Cookies | `Secure` + `HttpOnly` (when HTTPS in prod) |
| Headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |
| Upload caps | 5 MB max for both data and file uploads |
| File extension validation | PDF / JPG / JPEG / PNG only for KYC docs |
| Super-admin gating | `IsSuperUser` DRF permission + frontend `SuperAdminRoute` |
| Secret management | `.env` gitignored, `.env.example` checked in |

---

## 12. Production Readiness

### 12.1 Server runtime
- **WhiteNoise** serving compressed + cache-busted static files
- **Gunicorn** as WSGI server
- **PostgreSQL** with persistent connections (`CONN_MAX_AGE=60`)
- **collectstatic** + manifest storage ready
- **Media files** served by Django only in `DEBUG=True`; production expects nginx / cloud storage in front

### 12.2 .env-driven configuration
Settings.py reads from `.env` via `python-decouple`. Every credential is feature-flag-style: missing creds → graceful fallback, never a crash.

| Env var | Purpose |
|---------|---------|
| `SECRET_KEY` | Auto-generated 50-char Django secret |
| `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` | Core Django toggles |
| `DB_*` | Postgres credentials |
| `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS` | HTTPS hardening |
| `JWT_ACCESS_MINUTES`, `JWT_REFRESH_DAYS` | Token lifetimes |
| `EMAIL_HOST`, `EMAIL_*` | SMTP — falls back to console backend if blank |
| `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` | Billing checkout (when implemented) |
| `WHATSAPP_PHONE_NUMBER_ID/ACCESS_TOKEN/BUSINESS_ACCOUNT_ID` | WhatsApp Business API |
| `REDIS_URL`, `CELERY_BROKER_URL` | Automation engine broker |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT` | Error tracking (auto-initialises if `sentry-sdk` installed) |
| `LOG_LEVEL` | DEBUG / INFO / WARNING / ERROR |

### 12.3 Deployment templates
- [.env.example](backend/backendCRM/.env.example) — copy for local dev
- [.env.production.example](backend/backendCRM/.env.production.example) — production template with **14-point pre-flight checklist** (generate SECRET_KEY, DEBUG=False, restrict ALLOWED_HOSTS, etc.)

### 12.4 Cross-platform tooling
- **`.gitattributes`** — normalises all text files to LF in repo (no more "LF will be replaced by CRLF" warnings on Windows)
- **Requirements.txt** UTF-8 encoded
- **.gitignore** covers `.env`, `staticfiles/`, `media/`, `node_modules/`, `frontend/dist/`

### 12.5 Structured logging
- Console handler with formatter `[asctime] LEVEL name message`
- Root level set from `LOG_LEVEL` env var (defaults: `INFO` in prod, `DEBUG` locally)

---

## 12.5 SEO + PWA (NEW)

### Branded favicon (replaces Vite default)
- [favicon.svg](frontend/public/favicon.svg) — yellow/amber gradient rounded square with black Zap lightning bolt
- [apple-touch-icon.svg](frontend/public/apple-touch-icon.svg) — 180×180 iOS home-screen icon
- [manifest.webmanifest](frontend/public/manifest.webmanifest) — makes the app installable as a PWA (name, short_name, description, theme color, icons, categories)

### Search engine guidance
- [robots.txt](frontend/public/robots.txt) — allows `/` + `/login`, disallows `/app/`, `/admin/`, `/api/`
- [sitemap.xml](frontend/public/sitemap.xml) — listed in robots.txt
- [index.html](frontend/index.html) full SEO header:
  - `<title>` 60 chars · `<meta description>` 158 chars · keywords
  - `theme-color` for both light + dark `prefers-color-scheme`
  - Canonical URL
  - Apple Touch / PWA meta tags
  - **Open Graph** (8 tags) — FB/LinkedIn/WhatsApp share previews
  - **Twitter Cards** (5 tags)
  - **JSON-LD structured data** — Organization + SoftwareApplication schemas with 3 offer prices (₹0/₹2499/₹9999) and `aggregateRating` so Google can show rich results
  - DNS preconnect + prefetch hints for hero image CDN
  - `<noscript>` fallback message

### Mobile app branding ([app.json](mobile/app.json))
- Name "CRM Suite" · Slug `crm-suite`
- Bundle ID `in.advancesolar.crmsuite` (iOS + Android)
- `primaryColor` yellow `#facc15`
- Dark `userInterfaceStyle` · Black splash · Yellow Android adaptive icon background

---

## 13. Demo Data

[seed_data.py](backend/backendCRM/seed_data.py) populates the Default Organization with:
- 6 demo users covering every role (sales, dealers, manager, channel partner)
- 35 realistic leads across 15 Indian cities, weighted status mix
- 13 deals (6 won / 6 open / 1 cancelled)
- 10 payments (booking + partial/full)
- 8 tasks with mixed priorities

All demo users password = `demo12345`. Admin = `admin` / `Admin@12345`.

Run: `python manage.py shell -c "exec(open('seed_data.py', encoding='utf-8-sig').read())"`

---

## 14. API Reference Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/token/` | Public | Login (returns access + refresh) |
| POST | `/api/token/refresh/` | Public | Refresh access token |
| GET | `/api/me/` | 🔒 | Current user profile with nested organization |
| GET | `/api/dashboard/` | 🔒 | Aggregated KPIs (org-scoped, or `?org=` for super) |
| GET | `/api/pipelines/?module=<lead/deal>` | 🔒 | Org's configurable pipeline + stages |
| GET / POST | `/api/leads/` | 🔒 | Tenant-scoped list / create |
| GET / PUT / DELETE | `/api/leads/<id>/` | 🔒 | Detail / update / delete |
| GET / POST | `/api/deals/` | 🔒 | Tenant-scoped list / create |
| GET / PUT / DELETE | `/api/deals/<id>/` | 🔒 | Detail / update / delete |
| GET / POST | `/api/payments/` | 🔒 | Tenant-scoped list / create |
| GET / PUT / DELETE | `/api/payments/<id>/` | 🔒 | Detail / update / delete |
| GET / POST | `/api/documents/` | 🔒 | Tenant-scoped KYC list / upload |
| GET / PUT / DELETE | `/api/documents/<id>/` | 🔒 | Detail / update / delete |
| GET / POST | `/api/tasks/` | 🔒 | Tenant-scoped list / create (admin) |
| GET / PUT / DELETE | `/api/tasks/<id>/` | 🔒 | Detail / update / delete |
| POST | `/api/tasks/<id>/task-messages/` | 🔒 | Append comment + auto-update status |
| GET / POST | `/api/automation/rules/` | 🔒 | Tenant-scoped automation rules CRUD |
| GET / PATCH / DELETE | `/api/automation/rules/<id>/` | 🔒 | Detail / update / delete |
| GET / PUT | `/api/whatsapp/config/` | 🔒 | WhatsApp config per org |
| GET / POST | `/api/whatsapp/messages/` | 🔒 | Message log + stub send |
| GET | `/api/billing/plans/` | 🔒 | List available plans |
| GET / POST | `/api/billing/subscription/` | 🔒 | Current org's subscription |
| GET | `/api/billing/invoices/` | 🔒 | Invoice list |
| POST | `/api/billing/checkout/` | 🔒 | Razorpay checkout (stub) |
| GET / POST | `/api/custom-fields/?module=` | 🔒 | Per-module custom field CRUD |
| PATCH / DELETE | `/api/custom-fields/<id>/` | 🔒 | Detail / update / delete |
| GET | `/api/audit-logs/` | 🔒 | Tenant-scoped audit log (read-only) |
| GET | `/api/2fa/status/` | 🔒 | Current user's 2FA status |
| POST | `/api/2fa/setup/` | 🔒 | Begin TOTP enrollment (stub) |
| POST | `/api/2fa/verify/` | 🔒 | Verify TOTP code (stub) |
| POST | `/api/2fa/disable/` | 🔒 | Disable 2FA |
| GET | `/api/notifications/` | 🔒 | Unread count + last 100 notifications |
| POST | `/api/notifications/<id>/read/` | 🔒 | Mark one read |
| POST | `/api/notifications/read-all/` | 🔒 | Mark all read |
| POST | `/api/pipelines/<id>/reorder/` | 🔒 | Reorder pipeline stages |
| GET / POST | `/api/score-rules/` | 🔒 | Lead scoring rule CRUD |
| PATCH / DELETE | `/api/score-rules/<id>/` | 🔒 | Per-rule update / delete |
| GET | `/api/leads/<id>/score-history/` | 🔒 | Per-lead score change audit trail |
| GET | `/api/leads/<id>/duplicates/` | 🔒 | Find duplicate leads by phone/email |
| POST | `/api/leads/merge/` | 🔒 | Merge two leads (target absorbs source) |
| GET / POST | `/api/sales-targets/` | 🔒 | Sales target CRUD with auto-computed achievement + commission |
| PATCH / DELETE | `/api/sales-targets/<id>/` | 🔒 | Per-target update / delete |
| GET | `/api/sales-leaderboard/` | 🔒 | Top performers this month |
| GET / POST | `/api/saved-views/?module=` | 🔒 | Saved filter views CRUD |
| PATCH / DELETE | `/api/saved-views/<id>/` | 🔒 | Per-view update / delete |
| GET / POST | `/api/call-logs/` | 🔒 | Call log CRUD with stats aggregate |
| GET | `/api/industry-templates/` | 🔒 | List 7 industry presets with stages + fields |
| POST | `/api/admin/organizations/<id>/apply-template/` | 👑 | Apply template to org (idempotent) |
| GET | `/api/admin/stats/` | 👑 SuperUser | Platform aggregates (or `?org=<slug>`) |
| GET / POST | `/api/admin/users/` | 👑 | List / create users across orgs |
| GET / PATCH / DELETE | `/api/admin/users/<id>/` | 👑 | Per-user management |
| GET / POST | `/api/admin/organizations/` | 👑 | List / create tenants |
| GET / PATCH / DELETE | `/api/admin/organizations/<id>/` | 👑 | Per-tenant management |
| GET | `/admin/` | 🔒 | Django admin panel |

---

## 15. Recent Transformation — Multi-Tenant + De-Solar

The codebase was transformed from a solar-specific CRM into a generic multi-tenant SaaS in two phases shipped together:

### Phase 1 — Multi-tenant foundation
- New `Organization` model with industry/plan/status/quotas
- `organization` FK added to User, Leads, Deal, Task, Teritories
- Data migration backfilled all existing rows into a "Default Organization" (industry=SOLAR)
- Tenant-scoping helpers (`scope_qs`, `require_org`, `get_request_org`)
- Every view rewritten to filter by user's org
- Super-admin platform-level access via `?org=<slug>` opt-in
- Expanded role list (OWNER / MANAGER / TEAM_LEAD / SUPPORT / EMPLOYEE / VIEWER)

### Phase 2 — De-solar + configurable pipelines
- Removed `choices=` constraints on `brand_name`, `model_name`, `watt_capacity` — now free-text
- Added generic `product_name`, `product_category`, `tags`, `notes` fields
- New `Pipeline` + `PipelineStage` models per-org per-module
- New `/api/pipelines/` endpoint serves the org's configurable stages
- Frontend dropdowns now pipeline-driven (fallback to defaults if API down)
- Lead source choices expanded (PHONE / EMAIL / EVENT)
- Document type expanded (CONTRACT / INVOICE)
- Payment types expanded (UPI / CARD)
- Industry presets in Org creation: 14 industries (Real Estate, Healthcare, Education, etc.)

### Backward compatibility
- All existing solar data preserved in the Default Organization
- Existing brand/model/watt values still stored (just no longer locked to a fixed enum)
- Legacy roles (DEALER, CHANNEL PARTNER) preserved alongside new ones

### Phase 3 — Platform Extensions scaffolded
Eight enterprise SaaS features added as scaffolds (models + endpoints + admin UI) in [migration 0014](backend/backendCRM/api/migrations/):

| Feature | Models | Endpoints | UI |
|---------|--------|-----------|------|
| Automation engine | `AutomationRule` | 4 routes | `/admin/automation` |
| WhatsApp API | `WhatsAppConfig`, `WhatsAppMessage` | 3 routes | `/admin/whatsapp` |
| Billing system | `Plan`, `Subscription`, `Invoice` | 4 routes | `/admin/billing` |
| Drag-drop pipelines | (uses existing `Pipeline`/`PipelineStage`) | 1 reorder route | `/admin/pipelines` |
| Custom fields engine | `CustomField`, `CustomFieldValue` | 4 routes | `/admin/custom-fields` |
| Audit logs | `AuditLog` | 1 read route | `/admin/audit-logs` |
| 2FA (TOTP) | `TwoFactorSecret` | 4 routes | `/admin/two-factor` |
| Notifications | `Notification` | 3 routes | Bell icon in Navbar |

3 default plans seeded: Free (₹0), Pro (₹2499/mo), Enterprise (₹9999/mo).

### Phase 4 — Platform Extensions completed (5 of 8) + Mobile parity + Landing + SEO

**Promoted from scaffold → fully working:**

| Feature | Status | How |
|---------|--------|-----|
| **Audit logs** | 🟢 Working | New [api/signals.py](backend/backendCRM/api/signals.py) — `pre_save` captures snapshots, `post_save` / `post_delete` writes diffs to AuditLog. Login/logout signals included. ApiConfig.ready() registers handlers. |
| **Notifications** | 🟢 Working | Same signals.py emits `Notification` rows on lead-assigned, deal-won, payment-received, task-due. Web bell polls every 60s; mobile has dedicated tab with badge. |
| **2FA (TOTP)** | 🟢 Working | Real `pyotp` + `qrcode` packages. `setup/` returns base64 PNG QR + secret. `verify/` validates 6-digit code, emits 8 backup codes. Custom `TwoFactorTokenObtainPairView` enforces 2nd factor on login. Web + mobile login screens both show OTP field on `requires_2fa: true`. |
| **Custom fields rendering** | 🟢 Working | Lead serializer exposes nested `custom_fields: {slug: value}` dict. POST/PUT accepts same shape. Frontend `<CustomFieldInput>` dynamically renders correct widget per field type. Per-org, per-module. |
| **Drag-drop pipelines** | 🟢 Working | `@dnd-kit/core` + `@dnd-kit/sortable` installed. AdminPipelines uses `DndContext` + `SortableContext` with PointerSensor + KeyboardSensor. Real drag handles replace ↑↓ buttons. |

**Mobile app brought to feature parity** (Phase 4):
- AuthContext now fetches `/api/me/` → exposes `organization`, `isSuperUser`, `isStaff`, `role`
- LoginScreen handles `requires_2fa` with animated OTP field
- New **NotificationsScreen** (5th tab) — list + pull-to-refresh + mark-read + mark-all-read with confirmation
- Tab bar shows unread badge (polls every 60s)
- ProfileScreen shows organization card (avatar, name, slug, plan badge, status badge, industry, SUPER chip for superusers)
- LeadsScreen uses generic `product_name` / `product_category` with fallback to `brand_name` / `watt_capacity`
- app.json rebranded: name "CRM Suite", slug `crm-suite`, bundle ID `in.advancesolar.crmsuite`, primary color yellow, dark UI style, splash on black

**Landing page de-soldered:**
- Hero pill "India's #1 solar CRM" → "Multi-industry CRM platform"
- Hero headline "The CRM that runs India's solar businesses" → "One CRM for every industry you run"
- Partner marquee: Gautam/Waaree/Adani brands → list of 12 industries served
- Features grid: 9 → **12 features** (added Configurable Pipelines, Custom Fields, Multi-tenant SaaS)
- Testimonials diversified: solar founder + real-estate sales head + healthcare director
- FAQs replaced solar-brand-specific Q with industry-coverage + custom-field + RBAC questions
- Phone mockup lead cards: Waaree/Adani/Gautam → Solar/Real-Estate/Healthcare mix
- Final CTA + footer + activity feed copy generalized

**SEO + branding overhaul:**
- Branded `favicon.svg` (yellow/amber lightning bolt) replaces Vite default
- `apple-touch-icon.svg` for iOS
- `manifest.webmanifest` makes app installable as PWA
- `robots.txt` allows landing/login, disallows `/app/`, `/admin/`, `/api/`
- `sitemap.xml`
- `index.html` full SEO overhaul: title (60 char), description (158 char), keywords, Open Graph (8 tags), Twitter Cards (5 tags), JSON-LD structured data (Organization + SoftwareApplication with offers + ratings), theme-color (light/dark), DNS preconnect hints, `<noscript>` fallback

**Production-ready .env:**
- Auto-generated real 50-char `SECRET_KEY`
- New env vars wired into settings.py: `EMAIL_*`, `RAZORPAY_*`, `WHATSAPP_*`, `REDIS_URL`, `CELERY_BROKER_URL`, `SENTRY_DSN`, `LOG_LEVEL`
- New `.env.production.example` template with 14-point pre-flight checklist
- Email falls back to console backend when SMTP unconfigured
- Sentry auto-initialises if DSN provided + `sentry-sdk` installed

**.gitattributes** added for cross-platform line-ending normalisation (LF in repo, no more "LF will be replaced by CRLF" warnings on Windows).

**Bug fix:** `LeadOtherSerializer` (used for non-admin user roles) was missing new fields (`product_name`, `product_category`, `tags`, `notes`, `base_price`, `pipeline`) — added so SALES users see the same data as admins.

### Phase 5 — Enterprise Foundation Pack (6 new features)

Shipped in [migration 0015](backend/backendCRM/api/migrations/) — 5 new models + `score` + `priority` + `last_activity_at` fields on Leads.

| # | Feature | Models | Endpoints | UI | Status |
|---|---------|--------|-----------|------|--------|
| 1 | **Lead Scoring** | `LeadScoreRule`, `LeadScoreHistory` + score/priority on Leads | `/api/score-rules/*` · `/api/leads/<id>/score-history/` | `/admin/lead-scoring` + priority badge in lead list + score progress bar in modal | 🟢 Working |
| 2 | **Duplicate Detection** | (no model — live phone/email match) | `/api/leads/<id>/duplicates/` · `/api/leads/merge/` | Warning banner inside lead edit modal with one-click merge | 🟢 Working |
| 3 | **Sales Targets & Commissions** | `SalesTarget` | `/api/sales-targets/*` · `/api/sales-leaderboard/` | `/admin/sales-targets` with KPI cards + monthly leaderboard + per-user target progress bars | 🟢 Working |
| 4 | **Saved Views** | `SavedView` | `/api/saved-views/*` | `/admin/saved-views` — module tabs, JSON filter editor, share-with-team toggle | 🟢 Working |
| 5 | **Call Logs & Voice Notes** | `CallLog` | `/api/call-logs/` | `/admin/call-logs` — KPI cards (total · connected · converted · talk time), call list, "Log call" modal with outcome + next action | 🟢 Working |
| 6 | **Industry Templates** | static fixture in `api/industry_templates.py` | `/api/industry-templates/` · `/api/admin/organizations/<id>/apply-template/` | One-click "Apply template" button on each Organization card | 🟢 Working |

**Lead Scoring engine** (signal-driven):
- 13 event types: `lead_created` (+5), `status_changed` (+3), `deal_created` (+15), `deal_won` (+40), `payment_received` (+20), `document_uploaded` (+5), `task_completed` (+3), `email_opened` (+2), `email_replied` (+10), `meeting_booked` (+15), `quotation_viewed` (+8), `payment_initiated` (+25), `inactivity_penalty` (-5)
- Score range: 0–100 (clamped)
- Priority auto-derived: **HOT ≥ 70 · WARM 40–69 · COLD < 40**
- Every score change written to `LeadScoreHistory` with `{points_delta, score_before, score_after, reason}` — full audit trail visible per lead
- Signals: `lead_created`, `status_changed`, `deal_created`, `deal_won`, `payment_received`, `document_uploaded` are wired live

**Duplicate detection** algorithm: matches by **last 10 digits of phone** OR **case-insensitive email** within the same org. Merge endpoint reparents Deal, Document, CallLog rows to the target, bumps target score by half of source's score, appends source notes to target, then deletes source.

**Sales leaderboard**: top 20 performers in current month by won-deal value. Sales targets auto-compute achievement and commission earned (target × commission_pct) without manual entry.

**Industry templates** (7 industries — General · Solar · Real Estate · Healthcare · Insurance · Logistics · Education):
- Each defines: lead pipeline stages, deal pipeline stages, lead-specific custom fields, default 13 scoring rules
- Idempotent — `apply_template_to_org(org, slug)` only adds missing items (by slug). Use `replace_pipelines=True` to reset.
- Real Estate template adds: `property_type` (Apartment/Villa/Plot/Commercial), `bhk`, `carpet_area_sqft`, `budget_lakhs`, `possession_date`
- Healthcare template adds: `patient_id`, `age`, `specialty`, `insurance_provider`, `emergency`
- Insurance template adds: `policy_type`, `sum_assured`, `premium`, `renewal_date`, `nominee`
- Logistics, Education, Solar all have their own field sets

**Verified live:**
- ✅ Applied REAL_ESTATE template to default org → 13 scoring rules + 3 new stages + 5 custom fields seeded
- ✅ Created lead → auto +5 score, priority COLD
- ✅ Updated status NEW → CONTACTED → +3 = score 8
- ✅ Score history endpoint returns full event log with deltas
- ✅ Duplicate detection found 2nd lead with same phone (matching by last 10 digits)
- ✅ Sales leaderboard shows priya.sales/rakesh.sales/etc. with won_count + won_value

---

## 16. Out of Scope (deferred to future phases)

### 16.1 Scaffolds awaiting external service credentials
- **Automation engine execution** — needs Celery + Redis. Set `REDIS_URL` + `CELERY_BROKER_URL`, install `celery + redis + django-celery-beat`, write rule dispatcher
- **WhatsApp send** — needs Meta WhatsApp Business Cloud API account + phone verification + template approval. Set `WHATSAPP_*` env vars, then add HTTP adapter calling `graph.facebook.com/v18.0/<phone_number_id>/messages`
- **Razorpay checkout** — needs Razorpay account + test/live keys. Set `RAZORPAY_*` env vars, `pip install razorpay`, implement `/api/billing/checkout/` + `/api/billing/webhook/`

### 16.2 Enterprise upgrade list (16 of 22 still pending)
Phase 5 shipped 6 of the 22 enterprise features the user requested. The other 16 are documented below — each is a self-contained future phase.

| # | Feature | Notes |
|---|---------|-------|
| 2 | SLA management + escalations | Needs Celery scheduler for timers |
| 3 | Drag-drop form builder + public/embeddable forms | Biggest UI work (5–7 days) |
| 5 | Knowledge base / help center | CMS-like with markdown + search |
| 6 | Support ticket / helpdesk system | Pairs with SLA |
| 7 | Cloud storage integrations (Google Drive / Dropbox / OneDrive) | OAuth flows per provider |
| 8 | Advanced filter builder (nested AND/OR query AST) | Server-side recursive query parser |
| 10 | Import / export engine (CSV / Excel / PDF with field mapping) | openpyxl + reportlab |
| 12 | Lead distribution engine (round-robin / territory / workload) | Pairs with scoring (already shipped) |
| 13 | E-signature workflow | PDF stamping or DocuSign integration |
| 15 | Multi-language (i18n) — EN / Hindi + RTL ready | react-intl + Django i18n |
| 17 | Custom dashboard builder (drag-drop widgets) | react-grid-layout |
| 18 | Approval workflows (manager / finance / discount) | State machine |
| 19 | Backup & restore system | Django dumpdata + scheduled S3 sync |
| 20 | Session & device management (remote logout) | Track JWT jti per device |
| 21 | Plugin / extensions marketplace | Architecture-heavy (10–15 days) |
| – | Lead scoring AI/ML predictions | Future ML pass on top of existing scoring engine |

### 16.3 Other deferrals (mobile + infra)
- **Mobile theme toggle** (light/dark) — web has it, mobile is dark-only
- **Mobile pipeline-driven status colors** — uses default palette
- **Mobile 2FA enrollment UI** — login challenge works, but users must enroll via web
- **Mobile Lead create/edit form with custom field rendering** — mobile is read-only for leads
- **Mobile push notifications** (Expo Notifications)
- **Mobile offline-mode caching**
- **Granular RBAC editor** — current roles are fixed strings; no per-org permission overrides
- **White-label theming per org driving UI tokens** — colors stored on Organization but not yet applied
- **Customer-facing portal** (separate URL for end customers)
- **Tally / accounting export**
- **Public Swagger / OpenAPI docs**
- **E2E tests** (Playwright / Detox)
- **CI/CD pipeline + Docker setup**

Each subsequent phase is purely additive — the multi-tenant foundation is the load-bearing wall, and it's in place.
