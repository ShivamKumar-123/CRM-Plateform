# CRM Suite — Feature Document

**Project:** CRM Suite — industry-agnostic multi-tenant CRM platform
**Repo:** CRM-Advance-International-Solar (history started solar-only; now generic)
**Audience:** Any business — solar, real estate, healthcare, education, logistics, e-commerce, manufacturing, agencies, finance, insurance, B2B sales, services
**Last updated:** 2026-05-20 (Phase 8 — Ecosystem & Intelligence Pack: Knowledge Base · Form Builder · E-Signature · Backups · Cloud Storage · AI · Plugins · Push · Analytics · Dashboard Builder · i18n + all prior phases)

This document catalogues every feature shipped across the **four apps** in this repository.

---

## 1. Overview

CRM Suite started as a vertical CRM for Indian solar installers and has been transformed into a **multi-tenant, industry-agnostic SaaS platform** styled along Zoho CRM / HubSpot / Salesforce / Monday CRM but lighter and self-hostable. Every Lead, Deal, Task, Payment, and Document is scoped to an `Organization`. Each organization picks its industry, configures its own status pipeline, and gets its own users, branding, and quotas.

**Four deliverables:**

| App | Path | Stack |
|-----|------|-------|
| Backend API | [`backend/backendCRM/`](backend/backendCRM/) | Django 6 · DRF · SimpleJWT · PostgreSQL · WhiteNoise · Gunicorn |
| Web frontend | [`frontend/`](frontend/) | React 19 · Vite 7 · Tailwind 4 · Framer Motion · React Router 7 |
| Mobile app | [`mobile/`](mobile/) | Expo SDK 54 · React Native 0.81 · React Navigation 7 · AsyncStorage |
| **Demo showcase** | [`demo/`](demo/) | React 19 · Vite 7 · Tailwind 4 · Framer Motion · **Recharts** · localStorage-only (zero backend) |

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

## 8.5. Demo Showcase App ([demo/](demo/)) — NEW

A fully **client-side, zero-backend** React app that mirrors the look and feel of the production platform, designed for **investor pitches, client sales demos, and offline marketing**. Built to feel like the public demos from HubSpot / Zoho / Salesforce, but it runs entirely in `localStorage`.

> See [`demo/FEATURES.md`](demo/FEATURES.md) for the full module-by-module catalogue.

### 8.5.1 Stack & footprint
- React 19 · Vite 7 · Tailwind 4 · Framer Motion 12 · **Recharts 3** · lucide-react
- Build: ~975 kB JS (≈ 295 kB gzipped), ~67 kB CSS, ~6.5 s build time
- Static deployment compatible — drop `dist/` on any CDN

### 8.5.2 Provider stack (state architecture)
```
<AuthProvider>             ← session
  <IndustryProvider>       ← active industry + dataVersion broadcaster
    <NotificationProvider> ← fake realtime, sound toggle
      <DemoModeProvider>   ← presentation + sales demo toggles + keyboard nav
        <RouterProvider>
```

### 8.5.3 Demo-only enhancements (14 features)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Fake real-time notifications** | Auto-generates one every 20–40 s · sound ping · mark-read · clear all |
| 2 | **Animated KPI counters** | Framer `animate()` + `useInView` · custom INR formatter |
| 3 | **Activity timeline feed** | Vertical rail · 7 colored type badges · relative timestamps · staggered enter |
| 4 | **Industry switcher** | **5 presets** (Solar · Real Estate · Healthcare · Logistics · Insurance) repopulating every module on click |
| 5 | **Automation flow visualizer** | Visual trigger → action chains with animated `↓` arrows + glow halos |
| 6 | **Sales leaderboard** | Top-5 reps · gold/silver/bronze medals · animated revenue bars |
| 7 | **Live activity ticker** | Floating bottom-left widget · spawns industry-flavored events every 6–12 s |
| 8 | **Advanced reports (Recharts)** | Revenue trend area · conversion funnel · source pie · rep bars · MoM growth |
| 9 | **Demo Command Center** | Reset · industry switch · generate leads · simulate activity · toggle modes |
| 10 | **Presentation Mode** | Fullscreen · spotlight vignette · ←/→/Esc keyboard nav · auto-rotate routes |
| 11 | **Demo Assistant widget** | Floating sparkle bubble · route-aware tips · auto-rotate every 8 s |
| 12 | **Premium visual polish** | `.glow-border` conic-gradient · `.pulse-ring` · `.spotlight` · canvas particles |
| 13 | **CTA modal system** | 4 variants — Book demo · Full platform · Enterprise · Free trial · with success state |
| 14 | **Industry-specific seeded data** | Each preset has its own vocabulary, products, reps, cities, name pools |

### 8.5.4 Routes
- **Public:** `/` (landing with 4-CTA grid) · `/login` · `/signup`
- **Protected:** `/app` (Dashboard) · `/app/leads` · `/app/deals` · `/app/customers` · `/app/reports` · **`/app/automation`** · **`/app/command-center`** · `/app/settings`

### 8.5.5 Persistence
Single `localStorage` key `crm_demo_v1` holds: `users`, `leads`, `customers`, `deals`, `activities`, `reps`, `notifications`, `session`, `industry`, `preferences`. Wipe in one shot from Command Center, Topbar avatar, Settings, or DevTools.

### 8.5.6 Verified
- ✅ `npm run build` clean (2,803 modules, 6.5 s)
- ✅ Industry switch from Solar → Real Estate → Healthcare repopulates Dashboard / Leads / Deals / Reports
- ✅ Notification bell counts unread, mark-all-read flips to 0
- ✅ Presentation mode arrows navigate through 6 routes, Esc exits
- ✅ Recharts area + pie + bar all render with correct industry data

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
| GET | `/api/filters/meta/?module=` | 🔒 | Field whitelist + operators per field |
| POST | `/api/filters/query/` | 🔒 | Run a filter AST against a module |
| GET / POST | `/api/imports/` | 🔒 | List import jobs / upload new file |
| GET / POST / DELETE | `/api/imports/<id>/` | 🔒 | Detail / commit / rollback / delete |
| GET | `/api/export/?module=` | 🔒 | Streaming CSV export of org-scoped module data |
| GET / POST | `/api/distribution/rules/` | 🔒 | Lead-distribution rule CRUD |
| GET / PATCH / DELETE | `/api/distribution/rules/<id>/` | 🔒 | Detail / update / delete |
| GET | `/api/distribution/logs/` | 🔒 | Assignment audit log |
| GET / DELETE | `/api/sessions/me/` | 🔒 | List my devices / sign out others |
| POST | `/api/sessions/<id>/revoke/` | 🔒 | Revoke a specific device |
| GET | `/api/admin/sessions/` | 👑 | Cross-user session list |
| GET / POST | `/api/approvals/` | 🔒 | Approval-request list + create |
| GET / POST / DELETE | `/api/approvals/<id>/` | 🔒 | Detail / approve-reject-comment / cancel |
| GET / POST | `/api/api-keys/` | 🔒 | List org API keys / generate new key |
| PATCH / DELETE | `/api/api-keys/<id>/` | 🔒 | Update / revoke key |
| GET | `/api/docs/` | Public | Swagger UI |
| GET | `/api/redoc/` | Public | ReDoc UI |
| GET | `/api/schema/` | Public | Raw OpenAPI schema (YAML) |
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

### Phase 6 — Enterprise Operations Pack (6 features, no external credentials required)

Shipped in [migration 0016](backend/backendCRM/api/migrations/) — 7 new models, 1 service module each for distribution + imports, 1 new filter DSL module, 1 new session-tracking middleware, 16 new endpoints, 6 new admin pages.

| # | Feature | Backend artifacts | Endpoints | Admin UI | Status |
|---|---------|-------------------|-----------|----------|--------|
| 1 | **Advanced Filter Builder** | [filters_dsl.py](backend/backendCRM/api/filters_dsl.py) — recursive AST→Q parser | `/api/filters/meta/`, `/api/filters/query/` | `/admin/filters` — visual AND/OR/NOT tree builder | 🟢 Working |
| 2 | **Import / Export Engine** | `ImportJob` model + [services/imports.py](backend/backendCRM/api/services/imports.py) (CSV + openpyxl Excel + dry-run + rollback) | `/api/imports/*`, `/api/export/` | `/admin/import-export` — drag-drop upload + field mapping + preview | 🟢 Working |
| 3 | **Lead Distribution Engine** | `DistributionRule` + `AssignmentLog` + [services/distribution.py](backend/backendCRM/api/services/distribution.py) (5 strategies) | `/api/distribution/rules/*`, `/api/distribution/logs/` | `/admin/distribution` — rule CRUD + recent assignments | 🟢 Working |
| 4 | **Session & Device Management** | `UserSession` model + [middleware.py](backend/backendCRM/api/middleware.py) `SessionTrackingMiddleware` | `/api/sessions/me/`, `/api/sessions/<id>/revoke/`, `/api/admin/sessions/` | `/admin/sessions` — list + revoke + "Sign out others" | 🟢 Working |
| 5 | **Approval Workflows** | `ApprovalRequest` + `ApprovalStep` — multi-step chain engine | `/api/approvals/`, `/api/approvals/<id>/` | `/admin/approvals` — inbox/requested/all tabs with approve/reject/comment | 🟢 Working |
| 6 | **Public API Docs / API Keys** | `APIKey` model + `drf-spectacular` integration | `/api/docs/` (Swagger), `/api/redoc/`, `/api/schema/`, `/api/api-keys/*` | `/admin/api-docs` — link cards + key generator with one-shot plaintext reveal | 🟢 Working |

**Filter Builder details:**
- Recursive JSON AST: `{"op": "AND|OR|NOT", "children": [...]}` for groups, `{"field, "op", "value"}` for leaves
- 13 leaf operators: `equals`, `not_equals`, `contains`, `starts_with`, `ends_with`, `gt`, `gte`, `lt`, `lte`, `between`, `in`, `not_in`, `is_empty`, `not_empty`
- Per-module field whitelist (lead / deal / customer / task) prevents probing private columns
- Operator suggestions endpoint (`/api/filters/meta/`) returns sensible operators per field type (numeric / date / string)
- Same AST is reused by `DistributionRule.match_filter` to gate which leads a rule applies to

**Import/Export details:**
- Accepts CSV (any encoding — auto-detects BOM / cp1252 / latin-1) and `.xlsx` (via openpyxl)
- Two-phase flow: upload returns a preview (up to 20 mapped rows + validation issues), then a separate commit call writes to DB
- Per-module field whitelist (lead / deal / customer / task) — only safe fields are importable
- **Rollback** — every committed job stores its created record IDs; one click deletes them
- Export endpoint streams a CSV with the same field set, respects org scope + optional filter AST query param

**Lead Distribution details:**
- 5 strategies: `ROUND_ROBIN` (with persistent cursor) · `LEAST_LOADED` (live count of open leads) · `TERRITORY` (matches user.territory to lead.city/state) · `WEIGHTED` (proportional pick from JSON weights) · `SKILL` (matches `skills_required` against user.role + company_name)
- Triggered by signal in [signals.py](backend/backendCRM/api/signals.py) — `_auto_assign_lead()` runs on `Leads` post_save when `assigned_to` is unset
- Wrapped in try/except so distribution failures never block lead creation
- Each assignment writes to `AssignmentLog` with rule, strategy, and human-readable reason
- Rules ordered by `priority` (lower number checked first); first matching rule wins

**Session Management details:**
- `SessionTrackingMiddleware` decodes JWT jti without re-verifying (auth class already validated), upserts a `UserSession` row per token
- Coarse UA sniffing produces human labels like "Chrome · Windows 10/11" / "Safari · iPhone" / "Expo app · Android"
- Revoke endpoint flips `is_active=False` AND adds the jti to SimpleJWT's `BlacklistedToken` (token_blacklist app installed in Phase 6)
- "Sign out other devices" — revokes every active session except the current jti in one shot
- Super-admin view spans all users (`/admin/sessions` with mode switcher)

**Approval Workflows details:**
- Chain stored as ordered JSON list of user IDs (`approver_chain: [3, 7, 12]`) with a `current_step` cursor
- 6 request types: `DISCOUNT`, `CONTRACT`, `PAYMENT`, `LEAVE`, `REFUND`, `OTHER`
- Three actions per step: `APPROVED` (advances cursor; final approval transitions to APPROVED), `REJECTED` (terminates immediately), `COMMENT` (adds a note without advancing)
- Tabs: inbox (`?mine=pending_my_approval`) · requested (`?mine=requested`) · all
- Requester or super-admin can cancel a pending request
- Each step persisted to `ApprovalStep` with comment, approver, timestamp

**API Docs details:**
- `drf-spectacular` configured with custom title, description, tags (Auth / Leads / Deals / Filters / Imports / Distribution / Sessions / Approvals / API Keys / Admin)
- Three doc surfaces: **Swagger UI** (`/api/docs/`), **ReDoc** (`/api/redoc/`), raw **OpenAPI schema** (`/api/schema/`)
- API key model with read/write scopes + module allowlist + expiry; opaque token format `crm_<urlsafe_32>`
- Plaintext key returned exactly once on creation — UI shows a copy-to-clipboard modal then never again
- Last-used + revoked timestamps tracked

**Verified:**
- ✅ `python manage.py makemigrations api` → migration 0016 created cleanly
- ✅ `python manage.py check` → 0 issues
- ✅ `python manage.py spectacular --file schema.yml` → schema generated (28 warnings expected for hand-rolled APIViews; surface area is complete)
- ✅ `npm run build` → frontend production bundle clean (2,177 modules, 4.6s, ~232 kB gzipped)

---

### Phase 7 — Enterprise Integrations Pack (5 features, real external-service integration with env-driven credentials)

Shipped in [migration 0017](backend/backendCRM/api/migrations/) — 7 new models, 5 new service modules, Celery scaffold, 28 new endpoints, 2 new admin pages + a complete customer portal route tree.

| # | Feature | Backend artifacts | Endpoints | UI | Status |
|---|---------|-------------------|-----------|----|--------|
| 1 | **Automation Execution Engine** | `AutomationRun` model + [services/automation_engine.py](backend/backendCRM/api/services/automation_engine.py) (dispatcher + 7 action types) + [tasks.py](backend/backendCRM/api/tasks.py) (Celery `execute_automation_rule`) + [backendCRM/celery.py](backend/backendCRM/backendCRM/celery.py) bootstrap | `/api/automation/runs/`, `/api/automation/rules/<id>/test/` | Existing `/admin/automation` extended (run history tab to come) | 🟢 Working (inline + Celery-ready) |
| 2 | **Real WhatsApp Cloud API** | [services/whatsapp_client.py](backend/backendCRM/api/services/whatsapp_client.py) — Meta Graph v18 send + template + media + webhook handler | `/api/whatsapp/send/`, `/api/whatsapp/bulk-send/`, `/api/whatsapp/webhook/` (GET verify + POST events) | Existing `/admin/whatsapp` (send + logs) | 🟢 Code complete (needs `WHATSAPP_*` env creds) |
| 3 | **Razorpay Billing** | [services/razorpay_client.py](backend/backendCRM/api/services/razorpay_client.py) — order creation + signature verify + webhook + GST invoice PDF (reportlab) | `/api/billing/order/`, `/api/billing/verify/`, `/api/billing/webhook/`, `/api/billing/invoices/<id>/pdf/` | Existing `/admin/billing` | 🟢 Code complete (needs `RAZORPAY_*` env creds; falls back to stub mode) |
| 4 | **Helpdesk / Ticketing** | `Department`, `SLAPolicy`, `Ticket`, `TicketMessage`, `CannedReply` models + [services/helpdesk.py](backend/backendCRM/api/services/helpdesk.py) (SLA timers, auto-assign, escalation, canned-reply templating) | `/api/helpdesk/tickets/*`, `/api/helpdesk/departments/*`, `/api/helpdesk/sla-policies/*`, `/api/helpdesk/canned-replies/*`, `/api/helpdesk/tickets/<id>/reply/` | New `/admin/helpdesk` page — 4 tabs (Tickets / Departments / SLA / Canned) with detail-pane reply UI + status switcher + SLA breach indicator | 🟢 Working |
| 5 | **Customer Portal** | `PortalToken` model + [services/portal.py](backend/backendCRM/api/services/portal.py) — opaque-token auth (`Authorization: Portal <token>`), org-scoped read views, ticket create/reply | Admin: `/api/portal-tokens/*`; Customer: `/api/portal/me/`, `/api/portal/dashboard/`, `/api/portal/tickets/*`, `/api/portal/invoices/`, `/api/portal/documents/`, `/api/portal/deals/` | New `/admin/portal-tokens` (mint + reveal + revoke) + complete `/portal/*` route tree (login · dashboard · tickets · invoices · documents) | 🟢 Working |

**Automation engine details:**
- Dispatcher tries Celery first (`execute_automation_rule.delay()`), falls back to inline `execute_inline()` when broker isn't configured — dev environments don't need Redis running
- 7 action types: `create_task`, `assign_user`, `send_notification`, `update_score`, `move_stage`, `webhook`, `whatsapp`
- Trigger events wired in [signals.py](backend/backendCRM/api/signals.py): `lead_created`, `lead_status_changed`, `deal_won`, `deal_lost`, `payment_received`, `task_completed`
- Conditions support both simple `{field: value}` dicts AND the Phase-6 Filter DSL AST
- Per-rule `AutomationRun` row stores trigger payload, per-action `{status, detail}` log, total status (SUCCESS / PARTIAL / FAILED), retry count
- Celery `check_sla_breaches` periodic task included for the ticket SLA scanner

**WhatsApp details:**
- Reads creds per-org from `WhatsAppConfig`, falls back to global `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` in `.env`
- Every send (success or failure) logs to `WhatsAppMessage` — gives admin UI an audit trail
- Webhook receiver handles both Meta's `hub.challenge` verification GET and POST events
- Delivery status webhooks update `WhatsAppMessage.status` + `delivered_at`; incoming customer replies create new IN-direction rows
- Bulk send helper for marketing blasts; full per-recipient logging

**Razorpay details:**
- `create_order()` returns the order dict the frontend feeds to Razorpay Checkout — supports stub mode (returns shape but no real order) when keys aren't set
- `verify_payment_signature()` performs the standard HMAC-SHA256 check on `order_id|payment_id`
- `verify_webhook_signature()` validates `X-Razorpay-Signature` header on the raw body
- `generate_invoice_pdf()` renders a minimal GST tax invoice with reportlab — auto subtotal/GST/total split at 18%
- Webhook handler covers `payment.captured`, `payment.failed`, `subscription.cancelled`; updates Invoice + activates Subscription

**Helpdesk details:**
- Per-org ticket numbering — `ACME-000124` style, auto-generated in `pre_save` signal
- `SLAPolicy` per department × priority; due times stamped at ticket create
- `check_sla()` recomputes `sla_breached` flag on every save; `escalate_if_breached()` notifies department's default agent once
- Internal notes hidden from customer view in portal endpoint
- Canned replies support variable substitution: `{customer_name}`, `{ticket_number}`, `{assignee}`, `{subject}`
- Status transitions auto-stamp `first_response_at` (on first agent reply) and `resolved_at` (when status hits RESOLVED/CLOSED)

**Customer Portal details:**
- Separate `/portal/*` route tree with its own `PortalLayout` (sidebar nav, no admin chrome)
- Auth via opaque `PortalToken` (format `prt_<urlsafe_32>`) sent as `Authorization: Portal <token>`
- Magic link format: `{PORTAL_BASE_URL}/portal/login?t=<token>` — auto-logs in on page load
- Customer-side endpoints scoped to **their own email** within the org — invoices, documents, tickets, deals
- Customer can create new tickets + reply on existing ones; admin sees these as `source: PORTAL`
- Admin mints tokens from `/admin/portal-tokens` — plaintext shown exactly once
- Token revocation flips `is_active=False`; next request returns 401

**Verified:**
- ✅ `python manage.py makemigrations api` → migration 0017 created cleanly (7 models + 8 indexes)
- ✅ `python manage.py check` → 0 issues
- ✅ All Phase 7 services importable; sane fallback when external libs (razorpay / reportlab / requests) or env creds are missing
- ✅ `npm run build` → frontend production bundle clean (2,185 modules, 2.4s, ~240 kB gzipped)
- ✅ Customer portal renders in isolation (no admin auth required); admin portal-tokens page mints + revokes + shows magic link

**Required `.env` variables (all optional — features degrade gracefully):**

```env
# Automation execution (Celery)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
CELERY_TASK_ALWAYS_EAGER=False   # True = run tasks inline, no worker needed

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=   # Set this when configuring the webhook in Meta dashboard

# Razorpay
RAZORPAY_KEY_ID=                  # test mode prefix: rzp_test_
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=          # From Razorpay dashboard → Webhooks

# Customer portal magic-link base
PORTAL_BASE_URL=http://localhost:5173
```

**Run the Celery worker (optional):**
```bash
cd backend/backendCRM
celery -A backendCRM worker -l info
```
Without the worker, `dispatch()` runs actions inline in the request — fine for low-volume orgs.

---

### Phase 8 — Ecosystem & Intelligence Pack (11 features — covering all remaining enterprise items)

Shipped in [migration 0018](backend/backendCRM/api/migrations/) — 14 new models, 9 new service modules, ~45 new endpoints, 10 new admin pages, 2 new public pages, i18n infrastructure (EN + Hindi).

| # | Feature | Backend artifacts | Endpoints | UI | Status |
|---|---------|-------------------|-----------|----|--------|
| 1 | **Knowledge Base** | `KbCategory`, `KbArticle` + [services/kb.py](backend/backendCRM/api/services/kb.py) (search, related, view tracking) | `/api/kb/categories/*`, `/api/kb/articles/*`, `/api/kb/articles/<id>/vote/` | `/admin/knowledge-base` — markdown editor with live preview, draft/publish states, vote tracking | 🟢 Working |
| 2 | **Form Builder** | `Form`, `FormField`, `FormSubmission` + [services/forms.py](backend/backendCRM/api/services/forms.py) (validation + auto-lead-create) | `/api/forms/*`, **public** `/api/public/forms/<slug>/` | `/admin/forms` — drag/drop field config, public URL copy, **public `/forms/<slug>/` page** with full rendering of 10 field types | 🟢 Working |
| 3 | **E-Signature** | `SignatureRequest`, `SignatureSigner`, `SignatureEvent` + [services/esign.py](backend/backendCRM/api/services/esign.py) (OTP, PDF stamping with reportlab, audit trail) | `/api/esign/requests/*`, **public** `/api/public/sign/<token>/` | `/admin/esign` — multi-signer chains, sign-link copy; **public `/sign/<token>/`** — OTP request + canvas signature pad + decline | 🟢 Working |
| 4 | **Backup & Restore** | `BackupJob` + [services/backup.py](backend/backendCRM/api/services/backup.py) — dumpdata of 24 model targets, optional Fernet encryption, retention-based pruning | `/api/backups/`, `/api/backups/<id>/restore/`, `/api/backups/prune/` | `/admin/backups` — create / download / restore / prune | 🟢 Working |
| 5 | **Cloud Storage** | `CloudConnection` + [services/cloud_storage.py](backend/backendCRM/api/services/cloud_storage.py) — OAuth flow for Google Drive / Dropbox / OneDrive, generic `upload_file()` per provider | `/api/cloud/connections/`, `/api/cloud/<provider>/start/`, `/api/cloud/<provider>/callback/` | `/admin/cloud-storage` — 3-tile connect grid with status indicators | 🟢 Code complete (needs OAuth client creds) |
| 6 | **AI Features** | `AIRequest` + [services/ai.py](backend/backendCRM/api/services/ai.py) — OpenAI + Anthropic abstraction with auto-detection, 6 prompt builders, full usage logging | `/api/ai/leads/<id>/summary/`, `/api/ai/leads/<id>/followup/`, `/api/ai/deals/<id>/risk/`, `/api/ai/chat/`, `/api/ai/requests/` | `/admin/ai` — chat-style UI with markdown rendering + request history | 🟢 Code complete (stub mode if no API key set) |
| 7 | **Plugin Registry** | `Plugin` + [services/plugins.py](backend/backendCRM/api/services/plugins.py) — hook registry, `load_plugin()` imports `plugins.<slug>` modules at runtime | `/api/plugins/*`, `/api/plugins/hooks/` | `/admin/plugins` — install + enable/disable + hooks introspection | 🟢 Architecture in place (marketplace deferred) |
| 8 | **Push Notifications** | `PushSubscription` + [services/push.py](backend/backendCRM/api/services/push.py) — Web Push (VAPID via pywebpush) + Expo push HTTP API | `/api/push/subscriptions/*`, `/api/push/test/`, `/api/push/public-key/` | `/admin/push` — browser subscribe button + test sender + device list | 🟢 Code complete (needs VAPID keys for Web Push) |
| 9 | **Advanced Analytics** | [services/analytics.py](backend/backendCRM/api/services/analytics.py) — least-squares revenue forecast, weekly cohort, churn, funnel, executive bundle | `/api/analytics/forecast/`, `/api/analytics/cohort/`, `/api/analytics/churn/`, `/api/analytics/funnel/`, `/api/analytics/executive/` | `/admin/analytics` — Recharts composed chart (history + forecast), bar cohort, funnel bars, 4-KPI exec strip | 🟢 Working |
| 10 | **Dashboard Builder** | `DashboardLayout` model storing react-grid-layout JSON + widget config | `/api/dashboard-layouts/*` | `/admin/dashboard-builder` — drag-resize widgets with 6 types, save per-user layouts | 🟢 Working |
| 11 | **Multi-language (i18n)** | Django `LANGUAGES` (EN + Hindi) | — | [LocaleContext](frontend/src/context/LocaleContext.jsx) + [LocaleSwitcher](frontend/src/components/LocaleSwitcher.jsx) + dictionary at [i18n/](frontend/src/i18n/) — lightweight `t()` with dotted-path keys, no external lib | 🟢 Infrastructure in place |

**Knowledge Base details:**
- Markdown body with `react-markdown` rendering on both editor preview + admin preview modal
- Per-org categories with article counts; tags as comma-separated string (searchable)
- Status workflow: DRAFT → PUBLISHED → ARCHIVED; `published_at` auto-stamped on transition
- View counter (atomic `F("view_count") + 1`), helpful/not-helpful votes
- Related-articles algorithm matches category + any shared tag

**Form Builder details:**
- 10 field types: text, textarea, email, phone, number, date, select, checkbox, radio, hidden
- Per-field `maps_to` setting connects form fields → Lead fields (auto-creates a Lead on submit)
- Public endpoint at `/api/public/forms/<slug>/` (GET schema, POST submission) — no auth required
- Validation runs server-side; submissions stored even if validation fails (`is_spam` flag)
- Per-form `submission_count` counter + notify-email/notify-user hooks
- Frontend `PublicForm` page renders 10 field types correctly with placeholder + help text

**E-Signature details:**
- Multi-signer ordered chains — each signer gets a unique `prt_<urlsafe>` token via email/SMS (your team sends the magic link)
- OTP-protected signing: 6-digit code, 15-min expiry, single-use
- HTML5 canvas signature pad (no external library — built into [PublicSign](frontend/src/pages/public/PublicSign.jsx))
- On completion, generates an audit PDF with each signer's image, IP, timestamp via reportlab
- 5 status states + full event log in `SignatureEvent` (SENT, VIEWED, OTP_SENT, SIGNED, DECLINED)

**Backup details:**
- `BACKUP_TARGETS` covers 24 model tables (Org, User, Pipeline, Leads, Deal, Payment, Document, Task, CustomField, AuditLog, LeadScoreRule, SalesTarget, SavedView, CallLog, AutomationRule/Run, Ticket/Message, Department/SLA, KB)
- Optional Fernet (AES-128) encryption when `BACKUP_ENCRYPTION_KEY` is set in `.env`
- `restore_backup()` calls Django's `loaddata` against a temp file
- `prune_expired()` deletes backup files + rows whose `retention_days` has passed
- Restore is super-admin only (risky operation guarded by `IsSuperUser`)

**Cloud Storage details:**
- Generic OAuth abstraction for Google Drive, Dropbox, OneDrive
- Per-provider `authorize_url()` + `exchange_code()` + `save_connection()` + `upload_file()`
- Tokens stored per-user on `CloudConnection` with `token_expires_at`
- Provider-specific upload code paths (Dropbox content endpoint, Drive multipart, OneDrive PUT)
- Returns helpful error when `*_CLIENT_ID` env vars aren't set

**AI details:**
- Auto-selects provider: `AI_PROVIDER` env override → Anthropic if key set → OpenAI if key set → stub
- 6 prompt builders: lead summary · follow-up draft · deal risk (returns int confidence 0-100) · email draft · meeting summary · chat
- Every call logs to `AIRequest` with prompt, response, tokens, provider, model, success flag
- OpenAI uses `/v1/chat/completions`, Anthropic uses `/v1/messages` (both via `requests`)
- Stub mode returns a deterministic echo when no key configured — UI still flows

**Plugin details:**
- Module-level `_HOOKS` registry keyed by event name (`lead_created`, `deal_won`, etc.)
- `register_hook(name, callback)` / `unregister_hook()` / `run_hook(name, **payload)` API
- `load_plugin(plugin)` dynamically imports `plugins.<slug>` and calls its `register(config)` entry
- DB `Plugin` row is the manifest (name, version, hooks list, config JSON, status)
- Admin UI lists hooks + enable/disable + uninstall
- A full marketplace UI (browse / install from registry) is deferred to a future phase

**Push details:**
- Web Push via VAPID — `pywebpush` library, auto-deactivates subscriptions on 404/410
- Expo push via `https://exp.host/--/api/v2/push/send` — endpoint is the Expo token
- Frontend includes a `urlBase64ToUint8Array()` helper for VAPID public key conversion
- "Subscribe this device" button registers a service worker at `/sw.js` (worker file is your responsibility — minimal example needed in `frontend/public/sw.js`)

**Analytics details:**
- Revenue forecast uses simple least-squares slope/intercept on 24-month history → projects N months ahead
- Cohort analysis groups leads by `TruncWeek("created_at")` then counts won deals within the window
- Churn: leads with `last_activity_at` older than 30 days (excluding closed states)
- Funnel: pipeline stage distribution as % of total
- Executive summary: 30-day vs prior 30-day deltas on new leads, won revenue, payments

**Dashboard Builder details:**
- `react-grid-layout` v1.5 (stable ESM) — 12-column responsive grid
- 6 widget types: KPI · Chart · Tasks · Activity · Pipeline · Leaderboard
- Per-user persisted layouts; `shared_with_role` field reserved for future role-shared templates
- Drag-handle scoped to widget header (`.widget-drag` class) so content stays interactive

**i18n details:**
- Custom lightweight `translate()` function — no external dependency
- Dictionary at [`frontend/src/i18n/en.js`](frontend/src/i18n/en.js) + `hi.js` (Hindi)
- `useT()` hook + `<LocaleSwitcher />` topbar component
- Locale persisted in `localStorage.crm_locale`; `<html lang="...">` synced
- Django `LANGUAGES` configured for future server-side translation

**Verified:**
- ✅ `python manage.py makemigrations api` → migration 0018 generated (14 models)
- ✅ `python manage.py check` → 0 issues
- ✅ `npm run build` → frontend production bundle clean (3,069 modules, ~433 kB gzip — added recharts + react-grid-layout + react-markdown)
- ✅ Stub modes work for AI / Cloud / Push / Razorpay / WhatsApp without external creds (no crashes)

**Required `.env` additions (all optional):**

```env
# AI providers (pick one or both)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
AI_PROVIDER=                   # blank=auto, or "openai"/"anthropic"

# Cloud storage OAuth (each provider's client credentials)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/admin/cloud-storage?provider=GOOGLE_DRIVE
DROPBOX_CLIENT_ID=
DROPBOX_CLIENT_SECRET=
DROPBOX_REDIRECT_URI=...
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=
ONEDRIVE_REDIRECT_URI=...

# Web Push (generate with `vapid` CLI)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CLAIMS_EMAIL=admin@example.com

# Backup encryption (generate with `Fernet.generate_key()`)
BACKUP_ENCRYPTION_KEY=
```

---

### Phase 5b — Demo Showcase Upgrade (14 features added to [demo/](demo/))

Layered on top of the original lightweight Phase-1 demo to make it feel like a production SaaS showcase. All changes are **demo-only**, do not affect backend / frontend / mobile, and remain 100 % client-side (`localStorage`).

| # | Feature | New file(s) |
|---|---------|-------------|
| 1 | Fake real-time notifications (20–40 s, sound, mark-read) | `context/NotificationContext.jsx`, `components/NotificationBell.jsx` |
| 2 | Animated KPI counters (Framer `animate` + `useInView`) | `components/AnimatedCounter.jsx` |
| 3 | Activity timeline (vertical rail, type badges, relative ts) | `components/ActivityTimeline.jsx` |
| 4 | Industry switcher — 5 presets repopulating all modules | `lib/industries.js`, `lib/fakeData.js`, `context/IndustryContext.jsx`, `components/IndustrySwitcher.jsx` |
| 5 | Automation flow visualizer (trigger → 3 actions, animated arrows) | `pages/Automation.jsx` |
| 6 | Sales leaderboard (gold/silver/bronze medals + animated bars) | `components/SalesLeaderboard.jsx` |
| 7 | Live activity ticker (floating, auto-spawn 6–12 s, pause toggle) | `components/LiveTicker.jsx` |
| 8 | Advanced reports — **Recharts** area / pie / bar / funnel / MoM growth | `pages/Reports.jsx` (rewritten) |
| 9 | Demo Command Center (reset, switch, generate, simulate, modes) | `pages/CommandCenter.jsx` |
| 10 | Presentation Mode (fullscreen, ←/→/Esc, spotlight, auto-rotate) | `context/DemoModeContext.jsx`, `components/PresentationOverlay.jsx` |
| 11 | Demo Assistant bubble (route-aware tips, auto-rotate) | `components/DemoAssistant.jsx` |
| 12 | Premium polish — particles canvas + glow/pulse/spotlight CSS | `components/Particles.jsx`, `index.css` additions |
| 13 | CTA system — 4 variants with modal forms + success state | `components/CTAModal.jsx` |
| 14 | Industry-specific seeded data (per-preset vocab, products, reps) | `lib/industries.js`, `lib/fakeData.js` |

**Untouched in demo/:**
landing layout, login/signup, Leads/Deals/Customers/Settings pages, `db.js` storage key, auth flow, protected routes.

**Verified:** Production build clean (~295 kB gzipped, 6.5 s). See [`demo/FEATURES.md`](demo/FEATURES.md) for full breakdown.

---

## 16. Out of Scope (deferred to future phases)

### 16.1 Scaffolds awaiting external service credentials
- **Automation engine execution** — needs Celery + Redis. Set `REDIS_URL` + `CELERY_BROKER_URL`, install `celery + redis + django-celery-beat`, write rule dispatcher
- **WhatsApp send** — needs Meta WhatsApp Business Cloud API account + phone verification + template approval. Set `WHATSAPP_*` env vars, then add HTTP adapter calling `graph.facebook.com/v18.0/<phone_number_id>/messages`
- **Razorpay checkout** — needs Razorpay account + test/live keys. Set `RAZORPAY_*` env vars, `pip install razorpay`, implement `/api/billing/checkout/` + `/api/billing/webhook/`

### 16.2 Enterprise upgrade list — what's still pending

After Phase 8 the original 22-item enterprise upgrade roadmap is **complete**. The few items still on the table are extensions / nice-to-haves rather than gaps:

| Item | Notes |
|------|-------|
| Plugin marketplace UI | Backend registry + hooks exist; a browse/install storefront on top of the registry is deferred |
| SLA Celery scheduler | Tickets have SLA timers + breach flags; periodic scanner runs in `tasks.py` but needs Celery beat scheduling |
| Mobile theme toggle + custom-field editing | Web has them; mobile is dark-only + read-only for custom fields |
| Mobile 2FA enrollment UI | Login challenge already works; enrollment must happen via web |
| Granular per-org RBAC editor | Current roles are fixed strings — no UI for per-org permission overrides yet |
| White-label theming driving UI tokens | Per-org `primary_color` + `accent_color` are stored but not yet applied across the React component tree |
| Tally / accounting export | One-off reports — needs a per-export schema |
| E2E test suite (Playwright + Detox) | Functional CI; not a feature gap |
| Docker / Kubernetes manifests | Devops; settings are 12-factor-ready, just no shipped Dockerfile |

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
