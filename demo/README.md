# CRM Suite — Demo

A fully self-contained, **client-side** version of CRM Suite. No backend, no database,
no API server — everything lives in your browser's `localStorage`.

Perfect for sharing with prospects: they get to play with a real CRM in 5 seconds.

## What's inside

- **Modern landing page** — hero, features, workflow, pricing, testimonials, CTA
- **Authentication** — signup + login, all stored locally
- **Dashboard** — live KPIs computed from your data
- **Leads** — searchable table with stage filters and full CRUD
- **Deals** — kanban-style pipeline with stage movement
- **Customers** — card grid with status + lifetime value
- **Reports** — visual breakdowns by stage and source
- **Settings** — profile edit, data overview, reset / sign out

## Pre-seeded demo user

Email: `demo@demo.com`
Password: `demo123`

Or sign up with any email — accounts are stored in localStorage.

## Running

```bash
cd demo
npm install
npm run dev      # → http://localhost:5174
npm run build    # production bundle in dist/
npm run preview  # serve the production build locally
```

## Reset the demo

- Topbar avatar → **Reset demo data**, **or**
- Settings page → **Danger zone → Reset all demo data**, **or**
- Browser DevTools → Application → Local Storage → delete `crm_demo_v1`

## Tech

React 19 · Vite 7 · Tailwind 4 · React Router 7 · Framer Motion · lucide-react.
Zero runtime dependencies on a server.
