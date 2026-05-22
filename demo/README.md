# CRM Suite — Demo

A fully self-contained, **client-side** version of CRM Suite. No backend, no database,
no API server — everything lives in your browser's `localStorage`.

Perfect for sharing with prospects: they get to play with a real CRM in 5 seconds.

## What's inside

### User app (`/app/*`) — what sales reps see
- **Dashboard** — live KPIs computed from your data
- **Leads** — searchable table with stage filters and full CRUD
- **Deals** — kanban-style pipeline with stage movement
- **Customers** — card grid with status + lifetime value
- **Reports** — visual breakdowns by stage and source
- **Automation** — rules in action
- **Command center** — power-user shortcuts
- **Settings** — profile, data overview, reset

### Admin console (`/admin/*`) — what org admins see
- **Overview** — system-wide KPIs + recent activity + team snapshot
- **Team** — users with roles (OWNER / ADMIN / MANAGER / SALES / SUPPORT), invite + edit + deactivate
- **Pipelines** — configure lead/deal stages, reorder, recolor
- **Custom Fields** — extend modules with text/number/toggle/dropdown fields
- **Automation** — no-code rule builder (when/then)
- **Audit Logs** — full activity history with CSV export
- **Two-Factor** — TOTP setup + org-wide policies

### Marketing
- **Landing page** — hero, features, workflow, pricing (5-tier SaaS + 3-tier source code), testimonials, CTA
- **Signup / Login** — with one-click "Try as User" and "Try as Admin" buttons

## One-click demo entry

Visit the login page and click either:
- **👥 Try as User** — instant access to the sales view (`/app`)
- **👑 Try as Admin** — instant access to the admin console (`/admin`)

No sign-up. Credentials are auto-filled and submitted.

Manual fallback: `demo@demo.com` / `demo123`

## Running locally

```bash
cd demo
npm install
npm run dev        # → http://localhost:5174
npm run build      # production bundle in dist/
npm run preview    # serve the production build locally
```

## Reset the demo data

- Top banner → **Reset demo** button, **or**
- Settings page → **Danger zone → Reset all demo data**, **or**
- Browser DevTools → Application → Local Storage → delete `crm_demo_v1`

## Deploying to Vercel

The demo is configured for one-click Vercel deployment.

### Quick deploy
```powershell
# install Vercel CLI once
npm install -g vercel

# from the demo folder
cd demo
vercel              # preview deploy
vercel --prod       # production deploy
```

### Or via GitHub auto-deploy
1. Push to GitHub
2. https://vercel.com/new → Import repository
3. **Important:** set **Root Directory** = `demo`
4. Framework Preset = Vite (auto-detected)
5. Click Deploy

The `vercel.json` already configures:
- SPA rewrites (so direct URLs like `/app/leads` don't 404)
- Long-term caching for hashed assets
- Security headers (X-Frame-Options, etc.)

### Optional environment variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_FULL_VERSION_URL` | Where the "Get full version" button in the demo banner sends users | `mailto:sales@yourcrmdomain.com` |

Set these in **Vercel Project → Settings → Environment Variables** before redeploying.

## Tech

React 19 · Vite 7 · Tailwind 4 · React Router 7 · Framer Motion · lucide-react · Recharts.
Zero runtime dependencies on a server.

## Folder structure

```
demo/
├── vercel.json           ← Vercel deployment config
├── index.html            ← SEO + OG metadata
├── src/
│   ├── App.jsx           ← Routes (public + /app + /admin)
│   ├── Layout.jsx        ← User app shell
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx     ← One-click user/admin login
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx · Leads.jsx · Deals.jsx · Customers.jsx
│   │   ├── Reports.jsx · Automation.jsx · CommandCenter.jsx · Settings.jsx
│   │   └── admin/        ← 7 admin pages + _shared.jsx
│   ├── components/
│   │   └── DemoBanner.jsx  ← Top banner with Reset + Get Full Version
│   ├── context/          ← Auth, Theme, Industry, DemoMode, Notification
│   └── lib/
│       ├── db.js         ← localStorage CRUD
│       └── fakeData.js   ← seed data
└── README.md             ← (this file)
```
