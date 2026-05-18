# CRM Suite — Feature Document

**Project:** CRM Suite — industry-agnostic multi-tenant CRM platform
**Repo:** CRM-Advance-International-Solar (history started solar-only; now generic)
**Audience:** Any business — solar, real estate, healthcare, education, logistics, e-commerce, manufacturing, agencies, finance, insurance, B2B sales, services
**Last updated:** 2026-05-18 (Phase 3 — Platform Extensions scaffolded)

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

## 6.5 Platform Extensions (NEW — Phase 3 scaffolded)

Eight enterprise SaaS features added as scaffolds. Every one has:
- ✅ Database models + migration applied
- ✅ DRF serializers
- ✅ Tenant-scoped API endpoints
- ✅ Admin UI page wired into sidebar
- ✅ Yellow banner on each page disclosing what's stubbed vs working

A "scaffold" means the **data and CRUD layer is functional**; the heavy execution layer (rule engine, payment gateway, push delivery, etc.) is deferred to a future pass. Each scaffold's UI lists the exact next steps required to make it production-grade.

### 6.5.1 Automation Engine — `/admin/automation`
- **Model:** `AutomationRule` (org-scoped, `trigger_event`, `conditions` JSON, `actions` JSON, `is_active`, `run_count`, `last_run_at`)
- **Triggers supported:** `lead_created` · `lead_status_changed` · `lead_assigned` · `deal_won` · `deal_lost` · `payment_received` · `task_overdue` · `task_completed`
- **Endpoints:** `GET/POST /api/automation/rules/`, `GET/PATCH/DELETE /api/automation/rules/<id>/`
- **Status:** Rules persist. **Execution engine NOT IMPLEMENTED** — requires Celery + Redis to dispatch rules on signal events.

### 6.5.2 WhatsApp Integration — `/admin/whatsapp`
- **Models:** `WhatsAppConfig` (one-per-org with phone_number_id, business_account_id, access_token, enabled flag) + `WhatsAppMessage` (in/out, status, body, template_name, external_id, sent_at)
- **Endpoints:** `GET/PUT /api/whatsapp/config/`, `GET/POST /api/whatsapp/messages/`
- **Status:** Config saves, messages log as `PENDING`. **Actual WhatsApp Business Cloud API call NOT IMPLEMENTED** — needs Meta business account + phone verification + template approval.

### 6.5.3 Billing & Subscriptions — `/admin/billing`
- **Models:** `Plan` (3 seeded: Free ₹0, Pro ₹2499/mo, Enterprise ₹9999/mo) + `Subscription` (one-per-org with status TRIAL/ACTIVE/PAST_DUE/CANCELLED) + `Invoice` (DRAFT/ISSUED/PAID/OVERDUE/VOID)
- **Endpoints:** `GET /api/billing/plans/`, `GET/POST /api/billing/subscription/`, `GET /api/billing/invoices/`, `POST /api/billing/checkout/` (stub)
- **Status:** Plans + subscriptions + invoices persist. **Razorpay checkout NOT IMPLEMENTED** — needs RAZORPAY_KEY_ID/SECRET in `.env` + payment-status webhook.

### 6.5.4 Drag-and-Drop Pipelines — `/admin/pipelines`
- Builds on existing `Pipeline` + `PipelineStage` models (Phase 2)
- **New endpoint:** `POST /api/pipelines/<id>/reorder/` accepts `{stages: [{id, order}, ...]}` and atomically reorders
- **UI:** Lists both lead + deal pipelines with stages. Each stage has ↑↓ buttons for reordering. Dirty state shows **Save order** button.
- **Status:** Reorder fully functional. **True HTML5 drag-and-drop NOT IMPLEMENTED** — needs `@dnd-kit/core` package (UI replacement, API already done).

### 6.5.5 Custom Fields Engine — `/admin/custom-fields`
- **Models:** `CustomField` (per-org, per-module, 11 field types: text/textarea/number/date/datetime/select/multiselect/checkbox/email/phone/url) + `CustomFieldValue` (FK to lead/deal/task with `value_text`/`value_number`/`value_date`)
- **Endpoints:** `GET/POST /api/custom-fields/?module=lead|deal|task|customer`, `PATCH/DELETE /api/custom-fields/<id>/`
- **UI:** Module tabs (Lead/Deal/Task/Customer), full CRUD modal (display name, slug, type, required, position, choices for select types, help text)
- **Status:** Field definitions save and list correctly. **Dynamic form rendering NOT IMPLEMENTED** — Lead/Deal create-edit modals don't yet display custom field inputs or persist values.

### 6.5.6 Audit Logs — `/admin/audit-logs`
- **Model:** `AuditLog` (org, user, action CREATE/UPDATE/DELETE/LOGIN/LOGOUT/EXPORT/IMPORT, model_name, object_id, object_repr, changes JSON, ip_address, user_agent, timestamp)
- **Endpoint:** `GET /api/audit-logs/` — tenant-scoped, returns latest 500
- **UI:** Sortable table with colored action badges, IP, user-agent
- **Status:** Read endpoint works. **Django signals NOT YET WIRED** — table stays empty until `post_save` / `post_delete` handlers call `AuditLog.objects.create()`.

### 6.5.7 Two-Factor Authentication — `/admin/two-factor`
- **Model:** `TwoFactorSecret` (one-per-user with `secret` base32, `is_enabled`, `backup_codes` JSON, `enabled_at`, `last_used_at`)
- **Endpoints:** `GET /api/2fa/status/`, `POST /api/2fa/setup/` (stub), `POST /api/2fa/verify/` (stub), `POST /api/2fa/disable/`
- **UI:** Status panel + 4-step "how it will work" explainer
- **Status:** Status + disable endpoints functional. **TOTP setup/verify NOT IMPLEMENTED** — needs `pyotp` + `qrcode` packages + login-flow interception to enforce 2nd factor.

### 6.5.8 Notifications — `/api/notifications/` + bell icon in Navbar
- **Model:** `Notification` (user, type info/success/warning/error/lead_assigned/deal_won/task_due/payment_received, title, body, link, read, read_at)
- **Endpoints:** `GET /api/notifications/` (returns `{unread_count, notifications: [...]}`), `POST /api/notifications/<id>/read/`, `POST /api/notifications/read-all/`
- **UI:** Real `NotificationBell` component in user app Navbar — polls every 60s, shows unread badge (9+ cap), dropdown with mark-as-read on click
- **Status:** **Fully working** — list, mark-read, mark-all-read all functional. **No event producers yet** — code paths that should emit notifications (lead assignment, deal won, task overdue) need to be wired with `Notification.objects.create(...)` calls.

---

## 7. Web Frontend Features

### 7.1 Public Landing Page (`/`)
13-section premium SaaS landing page at [Landing.jsx](frontend/src/pages/Landing.jsx) with announcement bar, sticky nav, animated hero, partner marquee, animated stats counter, dashboard preview, features grid, how-it-works, mobile app showcase, testimonials, pricing tiers, integrations grid, FAQ accordion, multi-column footer.

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

### 8.1 Screens
- **LandingScreen** — first-launch welcome with glowing orbs, hero, card preview, feature rows, Get Started CTA
- **LoginScreen** — JWT auth
- **DashboardScreen** — KPIs scoped to user's org, pull-to-refresh
- **LeadsScreen** — searchable, status-coloured cards
- **DealsScreen** — stats summary + cards
- **ProfileScreen** — username + API URL + logout

### 8.2 Auth
- AsyncStorage tokens (`crm_access`, `crm_refresh`, `crm_username`)
- Auto-refresh on 401 (same pattern as web)
- Bootstrapping splash while AsyncStorage loads

### 8.3 Configurable API URL
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

- **WhiteNoise** serving compressed + cache-busted static files
- **Gunicorn** as WSGI server
- **PostgreSQL** with persistent connections
- **collectstatic** + manifest storage ready
- **Structured logging** to console (formatter + level driven by `DEBUG`)
- **HTTPS toggles** env-driven so the same codebase runs local + prod
- **Media files** served by Django only in `DEBUG=True`; production expects nginx / cloud storage in front
- **Requirements.txt** UTF-8, includes Pillow + gunicorn + whitenoise + simplejwt
- **.gitignore** covers `.env`, `staticfiles/`, `media/`, `node_modules/`, `frontend/dist/`

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

| Feature | Models | Endpoints | UI | Working? |
|---------|--------|-----------|------|----------|
| Automation engine | `AutomationRule` | 4 routes | `/admin/automation` | CRUD ✅ · Execution ❌ (Celery+Redis) |
| WhatsApp API | `WhatsAppConfig`, `WhatsAppMessage` | 3 routes | `/admin/whatsapp` | Config + log ✅ · Send ❌ |
| Billing system | `Plan`, `Subscription`, `Invoice` | 4 routes | `/admin/billing` | Subscribe ✅ · Razorpay ❌ |
| Drag-drop pipelines | (uses existing `Pipeline`/`PipelineStage`) | 1 reorder route | `/admin/pipelines` | ↑↓ reorder ✅ · @dnd-kit ❌ |
| Custom fields engine | `CustomField`, `CustomFieldValue` | 4 routes | `/admin/custom-fields` | CRUD ✅ · Form rendering ❌ |
| Audit logs | `AuditLog` | 1 read route | `/admin/audit-logs` | View ✅ · Signals ❌ |
| 2FA (TOTP) | `TwoFactorSecret` | 4 routes | `/admin/two-factor` | Status + disable ✅ · Setup/verify ❌ |
| Notifications | `Notification` | 3 routes | Bell icon in Navbar | **Fully working** ✅ |

3 default plans seeded: Free (₹0), Pro (₹2499/mo), Enterprise (₹9999/mo).

---

## 16. Out of Scope (deferred to future phases)

These items still need work (most are "scaffold exists but execution-layer not wired"):

**Wiring left for scaffolds in section 6.5:**
- **Automation execution** — install Celery + Redis, wire signal-based dispatcher to read `AutomationRule.actions` JSON and execute them
- **WhatsApp send** — sign up Meta WhatsApp Business Cloud API, drop in HTTP adapter that calls `https://graph.facebook.com/v18.0/<phone_number_id>/messages`
- **Razorpay checkout** — `pip install razorpay`, add `RAZORPAY_KEY_ID/SECRET` to `.env`, implement webhook `/api/billing/webhook/` for payment-status updates
- **Custom field rendering** — dynamic form-input generator on `/app/leads/` create/edit modals, persist values to `CustomFieldValue` rows
- **Audit signals** — wire `post_save`/`post_delete` Django signals on Leads/Deal/User/Payment to call `AuditLog.objects.create()` with serialized diff
- **2FA enforcement** — `pip install pyotp qrcode`, generate base32 secret + otpauth:// URI, render QR, gate JWT issuance on TOTP verification
- **Drag-drop with @dnd-kit** — `npm install @dnd-kit/core @dnd-kit/sortable`, replace ↑↓ buttons in `AdminPipelines` with `<DndContext>`
- **Notification producers** — emit `Notification.objects.create()` on Lead assignment, Deal won, Task overdue, Payment received

**Not yet started:**
- **Granular RBAC editor** — current roles are fixed strings; no per-org permission overrides
- **Mobile push notifications** (Expo Notifications)
- **Mobile offline-mode caching**
- **White-label theming per org driving UI tokens** — colors stored but not yet applied
- **Customer-facing portal** (separate URL for end customers)
- **Tally / accounting export**
- **Automated lead-scoring / ML predictions**
- **Public Swagger / OpenAPI docs**
- **E2E tests** (Playwright / Detox)
- **CI/CD pipeline + Docker setup**

Each subsequent phase is purely additive — the multi-tenant foundation is the load-bearing wall, and it's in place.
