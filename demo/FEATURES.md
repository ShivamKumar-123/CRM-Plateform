# CRM Suite — Demo App Features

A fully **client-side, zero-backend** premium SaaS showcase of the CRM Suite platform.
Sab kuch browser ke `localStorage` mein chalta hai — koi API, koi database, koi server nahi.
Investor-ready demo, client sales tool, and interactive CRM presentation experience — designed to feel like **HubSpot / Zoho / Salesforce demos**.

> **Last updated:** 2026-05-20 — Major upgrade. 14 new demo-enhancement features layered on top of the original demo app. All client-side, all `localStorage`-backed, build-verified (≈ 295 kB gzipped).

---

## 🎯 At a Glance

| Aspect | Details |
|--------|---------|
| **Type** | Static, single-page React app (no backend required) |
| **Persistence** | `localStorage` key → `crm_demo_v1` |
| **Auth** | Local signup + login (passwords stored client-side, for demo only) |
| **Public pages** | Landing · Login · Signup |
| **Protected pages** | Dashboard · Leads · Deals · Customers · Reports · **Automation** · **Command Center** · Settings |
| **Industries supported** | Solar · Real Estate · Healthcare · Logistics · Insurance |
| **Pre-seeded user** | `demo@demo.com` / `demo123` |
| **Dev port** | `http://localhost:5174` |
| **Reset** | Topbar avatar, Settings page, Command Center, ya `localStorage` clear |

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2 | UI framework |
| **Vite** | 7.3 | Build tool + dev server |
| **React Router** | 7.13 | Client-side routing |
| **Tailwind CSS** | 4.1 | Utility-first styling |
| **Framer Motion** | 12.34 | Page transitions, animated counters, spring physics |
| **Recharts** | 3.8 | Area, pie, bar charts in Reports |
| **lucide-react** | 0.563 | Icon library |

Zero runtime server dependencies — production build is pure static files in `dist/`.

---

## 🗺 Route Map

Defined in [src/App.jsx](src/App.jsx). All `/app/*` routes are wrapped in `ProtectedRoute` + `Layout`.

### Public routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | [Landing.jsx](src/pages/Landing.jsx) | Marketing landing — hero, features, workflow, pricing, testimonials, FAQ, **+ 4-button CTA grid** |
| `/login` | [Login.jsx](src/pages/Login.jsx) | Email + password sign-in |
| `/signup` | [Signup.jsx](src/pages/Signup.jsx) | New account creation |

### Protected `/app` routes
| Path | Component | Description |
|------|-----------|-------------|
| `/app` | [Dashboard.jsx](src/pages/Dashboard.jsx) | **Animated KPI counters · Pipeline bars · Sales leaderboard · Activity timeline** |
| `/app/leads` | [Leads.jsx](src/pages/Leads.jsx) | Lead table — search, stage filter, CRUD |
| `/app/deals` | [Deals.jsx](src/pages/Deals.jsx) | Kanban pipeline with stage movement |
| `/app/customers` | [Customers.jsx](src/pages/Customers.jsx) | Card grid — status + lifetime value |
| `/app/reports` | [Reports.jsx](src/pages/Reports.jsx) | **Recharts-powered:** revenue trend · funnel · pie · rep performance · MoM growth |
| `/app/automation` | [Automation.jsx](src/pages/Automation.jsx) | **NEW** — Visual workflow chains (trigger → actions) |
| `/app/command-center` | [CommandCenter.jsx](src/pages/CommandCenter.jsx) | **NEW** — Demo control panel (industries / modes / data ops) |
| `/app/settings` | [Settings.jsx](src/pages/Settings.jsx) | Profile, data overview, danger zone |

---

## ✨ Feature Catalogue

### Existing modules (Phase 1)

#### 1. Landing Page
- Animated **aurora background** with gradient blobs (yellow / fuchsia / sky)
- Fixed navbar with scroll-aware **backdrop blur**
- Sections: Hero, Features, Workflow, Pricing, Testimonials, FAQ
- **NEW:** 4-button CTA grid (Book Demo · Full Platform · Enterprise · Free Trial) with modal forms
- **NEW:** Animated canvas particles in CTA section ([Particles.jsx](src/components/Particles.jsx))

#### 2. Authentication (Client-side only)
- **Signup** / **Login** persisted in `localStorage`
- Session managed via [AuthContext.jsx](src/context/AuthContext.jsx)
- `ProtectedRoute` redirects to `/login` if no active session
- Pre-seeded demo account: `demo@demo.com` / `demo123` / company "Acme Solar"
- ⚠️ Plaintext passwords — **demo only**

#### 3. Leads / Deals / Customers / Settings
Same as Phase 1 — searchable tables, kanban, card grids, profile edit + danger zone.

---

### 🆕 Phase 2 — Premium SaaS Demo Upgrades (14 new features)

#### 1. Fake Real-Time Notifications  🟢
[NotificationContext.jsx](src/context/NotificationContext.jsx) · [NotificationBell.jsx](src/components/NotificationBell.jsx)

- Top-right bell with **unread count badge** (capped at 9+)
- Auto-generates a new notification every **20–40 seconds** while tab is visible
- 6 notification types — `lead`, `deal`, `meeting`, `payment`, `customer`, `task` — with color-coded gradient icons
- Animated dropdown panel — entrance spring + per-row enter/exit
- **Mark as read** (click row), **mark all read** (✓✓ button), **clear all** (🗑 button)
- **Sound toggle** with built-in WebAudio "ping" (no audio file dependency)
- Persisted in `localStorage.notifications`

#### 2. Animated KPI Counters  🟢
[AnimatedCounter.jsx](src/components/AnimatedCounter.jsx)

- Smooth 0 → value animation using Framer Motion's `animate()`
- Triggers on enter-view via `useInView` (only animates once visible)
- Supports custom formatters (`formatINR` for `₹2.4 Cr` style) + prefix/suffix (`%`, `₹`, etc.)
- Used on Dashboard KPI cards + Reports KPI cards + month-over-month growth widget
- Tabular-nums spacing prevents jitter during animation

#### 3. Activity Timeline Feed  🟢
[ActivityTimeline.jsx](src/components/ActivityTimeline.jsx)

- Vertical timeline rail (gradient line) with circular nodes
- 7 activity types (`call`, `email`, `meeting`, `task`, `won`, `lead`, `proposal`) — each with unique icon + color badge
- Relative timestamps via existing `timeAgo()` utility
- Staggered enter animation (each row delays 50ms from previous)
- Rendered on Dashboard with up to 8 events

#### 4. Industry Switcher  🟢
[industries.js](src/lib/industries.js) · [fakeData.js](src/lib/fakeData.js) · [IndustryContext.jsx](src/context/IndustryContext.jsx) · [IndustrySwitcher.jsx](src/components/IndustrySwitcher.jsx)

- **5 industry presets:** Solar · Real Estate · Healthcare · Logistics · Insurance
- Topbar dropdown — click any preset to instantly repopulate **every module** with industry-appropriate data
- Each preset defines its own:
  - Vocabulary (`leadNoun`, `dealNoun`, `customerNoun`)
  - Lead pipeline stages + deal pipeline stages
  - Lead sources (Practo, 99acres, Aggregator, etc.)
  - Sample products (5kW Rooftop · 2BHK Apartment · Term Plan 1Cr · MRI Package · FTL Pan-India)
  - Sales rep names (Aarav · Dr. Nidhi · Imran · Arpit · Rohan…)
  - Cities (industry-relevant)
  - Indian first/last name pools
  - Company name suffixes (Estates · Clinic · Logistics · Insure · Industries)
  - Accent color + Lucide icon (Sun · Building2 · HeartPulse · Truck · ShieldCheck)
- Active industry persisted in `localStorage.industry`
- `dataVersion` counter broadcasts to all pages so they re-pull data on switch

#### 5. Automation Flow Visualizer  🟢
[Automation.jsx](src/pages/Automation.jsx)

- Dedicated `/app/automation` page
- 3 pre-built workflow cards:
  - **When a new lead arrives** → Auto WhatsApp + Task assigned + Manager notified
  - **When a deal moves to WON** → Send invoice + Generate contract PDF + Onboarding pipeline
  - **Renewal reminder** → Follow-up call + Personalized renewal offer
- Visual trigger card (yellow gradient) → animated `↓` connectors → action cards
- Per-flow run counter, status pulse indicator (green dot), glow halo behind cards
- KPI strip on top — Active flows · Runs this month · Success rate

#### 6. Sales Leaderboard  🟢
[SalesLeaderboard.jsx](src/components/SalesLeaderboard.jsx)

- Top-5 sales reps with avatar circles
- 🏆 Gold trophy · 🥈 Silver medal · 🥉 Bronze award badges for top 3
- Animated horizontal revenue bars (gradient matches medal color)
- Shows deals-won count + conversion percentage
- Mounted on Dashboard right column
- Rep data swaps automatically when industry changes (Aarav Khanna for Solar, Dr. Nidhi for Healthcare, etc.)

#### 7. Live Activity Ticker  🟢
[LiveTicker.jsx](src/components/LiveTicker.jsx)

- Floating bottom-left widget
- Spawns a fake CRM event every **6–12 seconds**
- Each card auto-dismisses after 4.5 seconds; stacks up to 3 visible
- Spring-physics slide-in from the left
- Pause/resume toggle below the stack
- Event copy adapts to active industry — e.g.
  - Solar: "+ New installation lead from Facebook Ads"
  - Real Estate: "+ Booking worth ₹18L moved to Site Visit"
  - Healthcare: "+ Dr. Nidhi closed a deal"

#### 8. Advanced Demo Reports  🟢
[Reports.jsx](src/pages/Reports.jsx) — completely rewritten

Built with **Recharts**:
- **KPI strip** — Weighted Pipeline / Avg Deal Size / Win Rate / Lost Deals (all with `AnimatedCounter`)
- **Month-over-month growth widget** — arrow-up/down + percentage delta
- **Revenue trend** — dual-area chart (Revenue vs Target) with gradient fills + dashed target line
- **Conversion funnel** — horizontal stage-by-stage bars sized by lead count
- **Lead source pie chart** — donut with custom colors + legend
- **Sales rep performance** — dual-axis bar chart (revenue vs conversion %)

All charts re-render on industry switch.

#### 9. Demo Command Center  🟢
[CommandCenter.jsx](src/pages/CommandCenter.jsx)

Dedicated `/app/command-center` page with:
- **Mode toggle cards:** Presentation mode · Sales demo mode (live pulse dot when active)
- **Industry preset cards** — all 5 industries with one-click switch
- **Data actions:**
  - Regenerate dataset (fresh data, same industry)
  - Generate 5 new random leads
  - Simulate activity burst (5 notifications fired in sequence)
  - Full reset (signs out + wipes everything)
- **Notification controls** — Sound on/off · Push test notification

#### 10. Presentation Mode  🟢
[DemoModeContext.jsx](src/context/DemoModeContext.jsx) · [PresentationOverlay.jsx](src/components/PresentationOverlay.jsx)

- Hides sidebar + topbar for fullscreen optimized layout
- **Spotlight vignette** (radial dim toward edges)
- Top banner "● PRESENTATION MODE" pulse chip with step counter (e.g., 3 / 6)
- Bottom control strip: prev / route label / next / Exit
- **Keyboard navigation:**
  - `→` or `Space` → next route
  - `←` → previous route
  - `Esc` → exit presentation mode
- Auto-cycles through: Dashboard → Leads → Deals → Customers → Reports → Automation

#### 11. Demo Assistant Widget  🟢
[DemoAssistant.jsx](src/components/DemoAssistant.jsx)

- Floating bottom-right sparkle bubble that expands into a glass-strong tip panel
- **Route-aware tips** — different suggestions per page:
  - Dashboard: "Try moving a deal to WON — pipeline values update live."
  - Leads: "Create a new lead — the dashboard KPIs animate with new totals."
  - Reports: "Open Reports — funnel + revenue trends + sales-rep breakdown."
  - Automation: "Automation flow shows trigger → action chains, fully visual."
  - Command Center: "Reset data, generate leads, toggle Presentation Mode."
- Auto-rotates every 8 seconds
- "Next tip" button + dismiss (X) to collapse to bubble
- 11 tips total across all routes + global

#### 12. Premium Visual Polish  🟢
[index.css](src/index.css) extended with:
- **`.glow-border`** — conic-gradient animated border (yellow → fuchsia → sky → yellow), 6s rotation
- **`.pulse-ring`** — expanding yellow ring shadow (1.8s loop)
- **`.spotlight`** — mouse-position radial gradient on hover
- **`.border-gradient`** — gradient padding-box / border-box trick
- Existing `.glass` + `.glass-strong` + `.gradient-text` preserved
- [Particles.jsx](src/components/Particles.jsx) canvas — 40 floating particles, single requestAnimationFrame loop, honours `prefers-reduced-motion`
- Hover lift micro-interactions on every card (`whileHover={{ y: -3 }}`)

#### 13. Demo CTA System  🟢
[CTAModal.jsx](src/components/CTAModal.jsx)

- 4 CTA variants:
  - **Book live demo** (yellow) — 30-min walkthrough · Calendly placeholder
  - **Request full platform** (sky) — backend + mobile + admin
  - **View enterprise features** (fuchsia) — SSO, audit logs, custom SLAs
  - **Start free 14-day trial** (emerald) — no card required
- Wired into Landing page CTA section (4-button grid)
- Each opens a glass-strong modal with name/email/company/note form
- Animated success state (CheckCircle2 + "We'll be in touch!" + auto-close after 1.8s)

#### 14. Industry-Specific Demo Data  🟢
[fakeData.js](src/lib/fakeData.js)

Per industry, generators produce:
- **Leads** — name, company, email, phone, source, stage, score, value, owner, product, city, notes
- **Customers** — same + city + status (85% Active) + lifetime value
- **Deals** — title, customer, value, stage, probability (auto-100/0 for Won/Lost), expected close
- **Activities** — call/email/meeting/task with industry-relevant copy
- **Reps** — 4 industry-flavored sales reps with deals-won, revenue, conversion

Generator functions are pure — given an industry preset, return collections suitable for `db.set()`.

---

## 💾 Data Layer — [src/lib/db.js](src/lib/db.js)

Extended localStorage wrapper acting as a "database":

```js
db.init()                          // seed on first load
db.reset()                         // wipe + re-seed
db.get('leads')                    // read collection
db.set('leads', list)              // overwrite collection
db.insert('leads', record)         // append with auto-id + createdAt
db.update('leads', id, patch)      // partial update by id
db.remove('leads', id)             // delete by id
db.merge(patch)                    // multi-collection swap (industry switch)
db.prepend('notifications', item)  // notifications without timestamp injection

db.session.get() / .set() / .clear()
db.preferences.get() / .set({...})   // sound, assistant, notifications enabled
db.industry.get() / .set(id)          // active industry preset
```

Collections stored: `users`, `leads`, `customers`, `deals`, `activities`, **`reps`**, **`notifications`**, `session`, **`industry`**, **`preferences`**.

Single root key `crm_demo_v1` — easy to wipe in one shot.

---

## 🧠 State Architecture (4 Providers Stacked)

```
<AuthProvider>             ← session
  <IndustryProvider>       ← active industry + dataVersion broadcaster
    <NotificationProvider> ← fake realtime, sound toggle
      <DemoModeProvider>   ← presentation + sales demo toggles + keyboard nav
        <RouterProvider>
```

Each consumer page subscribes to `useIndustry().dataVersion` in `useEffect` deps — so an industry switch (or "Regenerate") triggers automatic re-pull across Dashboard / Reports / Leads / Deals / Customers.

---

## 🎨 Design System

| Token | Value | Role |
|-------|-------|------|
| ⬛ Black | `#000` | Base background |
| 🟡 Yellow | `#FACC15` | Primary accent, CTAs, active states |
| 🟠 Amber | `#F59E0B` | Gradient partner, icons |
| 🟣 Fuchsia | `#D946EF` | Aurora accent |
| 🩵 Sky | `#0EA5E9` | Secondary accent, hover states |
| 🟢 Emerald | `#34D399` | Success states, Logistics industry, leaderboard top-1 |
| 🌹 Rose | `#FB7185` | Healthcare industry, danger states |
| 🟪 Violet | `#A78BFA` | Insurance industry, premium accents |

**Effects:** glassmorphism · gradient borders · glow shadows · animated aurora · grid background · canvas particles · spotlight hover · conic-gradient borders · pulse rings.

---

## 🚀 Getting Started

```bash
cd demo
npm install
npm run dev      # → http://localhost:5174
npm run build    # static bundle in dist/
npm run preview  # serve production build locally
```

Open browser, click **Sign in** → use `demo@demo.com` / `demo123`, or sign up fresh.

---

## 🔄 Reset Options

Four ways to wipe and re-seed:

1. **Command Center** → Data actions → "Full reset"
2. **Topbar avatar** → "Reset demo data"
3. **Settings page** → Danger zone → "Reset all demo data"
4. **DevTools** → Application → Local Storage → delete `crm_demo_v1`

---

## ⌨️ Keyboard Shortcuts (Presentation Mode)

| Key | Action |
|-----|--------|
| `→` / `Space` | Next route |
| `←` | Previous route |
| `Esc` | Exit presentation mode |

---

## 🆚 Demo vs Full Platform

| Feature | Demo | Full (frontend + backend + mobile) |
|---------|:----:|:----------------------------------:|
| Persistence | `localStorage` | PostgreSQL via Django REST |
| Auth | Client-side passwords | JWT + 2FA (TOTP) |
| Multi-tenancy | ❌ (single workspace) | ✅ per-org isolation |
| Roles | Single "admin" | OWNER / ADMIN / MANAGER / SALES / VIEWER … |
| Pipelines | Industry-driven static | Configurable per org (drag-drop reorder) |
| Custom Fields | ❌ | ✅ 11 field types |
| Lead Scoring | Static seeded | Rule-based engine + 13 event types + history |
| Notifications | ✅ **fake realtime** | Real signal-driven (Django signals) |
| Audit Logs | ❌ | Full diff trail via `signals.py` |
| Industries | ✅ 5 presets switchable | ✅ 7 templates with auto-seed |
| Reports | ✅ Recharts | ✅ Recharts (real data) |
| Automation | ✅ Visual showcase | Scaffold (needs Celery + Redis) |
| Sales Leaderboard | ✅ Static + medals | Real `/api/sales-leaderboard/` |
| Mobile App | ❌ | ✅ Expo / React Native companion |
| Reports Export | ❌ | CSV / Excel |
| Presentation Mode | ✅ | ❌ (web-app focused) |

---

## 📂 File Structure

```
demo/
├── index.html
├── package.json           (+ recharts dependency)
├── vite.config.js
├── README.md
├── FEATURES.md            ← this file
├── dist/                  (production build output)
└── src/
    ├── main.jsx
    ├── App.jsx            (provider stack + routes)
    ├── Layout.jsx         (mounts global overlays)
    ├── index.css          (Tailwind + polish CSS)
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx     (industry switcher + notification bell)
    │   ├── Modal.jsx
    │   ├── PageHeader.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── NotificationBell.jsx     🆕
    │   ├── IndustrySwitcher.jsx     🆕
    │   ├── AnimatedCounter.jsx      🆕
    │   ├── ActivityTimeline.jsx     🆕
    │   ├── LiveTicker.jsx           🆕
    │   ├── DemoAssistant.jsx        🆕
    │   ├── SalesLeaderboard.jsx     🆕
    │   ├── PresentationOverlay.jsx  🆕
    │   ├── CTAModal.jsx             🆕
    │   └── Particles.jsx            🆕
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── IndustryContext.jsx      🆕
    │   ├── NotificationContext.jsx  🆕
    │   └── DemoModeContext.jsx      🆕
    ├── lib/
    │   ├── db.js          (extended with merge/prepend/preferences/industry)
    │   ├── api.js         (extended with notifications/reps/industry switching)
    │   ├── format.js
    │   ├── industries.js  🆕 (5 industry presets)
    │   └── fakeData.js    🆕 (industry-aware generators)
    └── pages/
        ├── Landing.jsx    (+ CTA grid + particles)
        ├── Login.jsx
        ├── Signup.jsx
        ├── Dashboard.jsx  (counters + leaderboard + timeline)
        ├── Leads.jsx
        ├── Deals.jsx
        ├── Customers.jsx
        ├── Reports.jsx    (Recharts rewrite)
        ├── Automation.jsx     🆕
        ├── CommandCenter.jsx  🆕
        └── Settings.jsx
```

---

## ⚠️ Limitations (by design)

- **No backend** — data does not sync across browsers / devices
- **No real auth** — passwords are plaintext in localStorage
- **No file uploads / documents / payments** — full platform handles these via Django
- **No mobile build** — see `mobile/` workspace for Expo app
- **No multi-tenancy** — single shared dataset per browser
- **Calendly / form submissions** — CTA modal shows success state, no actual email sent

For a production-grade experience, run the full stack: `backend/backendCRM` (Django) + `frontend` (React) + `mobile` (Expo).

---

## 📈 Build Stats

| Metric | Value |
|--------|-------|
| Modules transformed | 2,803 |
| CSS bundle | 66.99 kB (10.30 kB gzip) |
| JS bundle | 975.23 kB (294.92 kB gzip) |
| Build time | ~6.5 s |
| Lighthouse-friendly | ✅ Particles honour `prefers-reduced-motion` |

---

**Built as a zero-friction sales demo that looks and feels like a production SaaS.** 🔥
