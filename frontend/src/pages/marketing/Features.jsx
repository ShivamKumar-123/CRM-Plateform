import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Briefcase, BarChart3, ShieldCheck, FileCheck2, IndianRupee,
  Building2, Bell, Lock, Smartphone, GitBranch, Layers, Target, Trophy,
  Phone, Bookmark, Sliders, Zap, ArrowRight,
  Check, Workflow, HeartHandshake, Rocket,
  MessageSquare, Mail, Database, FileText, Cloud, Activity,
  Sparkles, Headphones, KeyRound, BookOpen, FileInput, PenTool,
  Filter, FileSpreadsheet, Users2, Monitor, Globe, Puzzle,
  LayoutDashboard, Bell as BellIcon, TrendingUp, Cpu,
} from "lucide-react";
import { PageHero, SectionHeading, FeatureCard, CTABanner } from "./_components.jsx";

const groupedFeatures = [
  {
    label: "Sales & Pipeline",
    accentColor: "from-yellow-300 to-amber-500",
    eyebrowColor: "text-yellow-400",
    items: [
      { icon: Users,       title: "Lead Pipeline",         body: "Capture from website, WhatsApp, email, events, public web forms. All flow into one pipeline with source attribution.", tint: "from-yellow-400 to-amber-500" },
      { icon: GitBranch,   title: "Drag-Drop Pipelines",   body: "Configure stages per module with real @dnd-kit drag handles. Per-stage colors + won/lost flags.", tint: "from-sky-400 to-blue-500" },
      { icon: Layers,      title: "Custom Fields",         body: "11 field types per module per org — text, number, date, select, multi-select, checkbox, email, phone, URL, textarea, datetime.", tint: "from-violet-400 to-purple-500" },
      { icon: Target,      title: "Lead Scoring",          body: "Auto-classify HOT (≥70) · WARM (40-69) · COLD (<40) on activity events. 13 default rules + full audit trail per lead.", tint: "from-pink-400 to-rose-500" },
      { icon: Users2,      title: "Lead Distribution",     body: "5 auto-assignment strategies — round robin · least loaded · territory · weighted · skill-based. Match-filter rules.", tint: "from-emerald-400 to-green-500" },
      { icon: Briefcase,   title: "Deal Management",       body: "Track Open / Won / Cancelled with deal value, cost price, server-computed profit, expected close date.", tint: "from-orange-400 to-red-500" },
      { icon: Trophy,      title: "Sales Targets",         body: "Monthly/quarterly/yearly targets with auto-computed achievement + commission. Live leaderboard.", tint: "from-amber-400 to-yellow-500" },
      { icon: Phone,       title: "Call Logs",             body: "Log calls with outcome (Connected · Voicemail · Converted · Callback), duration, notes, next-action follow-up.", tint: "from-cyan-400 to-blue-500" },
      { icon: Filter,      title: "Advanced Filter Builder", body: "Visual AND / OR / NOT tree with 13 operators — contains · between · in · is_empty and more. Save as Views.", tint: "from-fuchsia-400 to-pink-500" },
      { icon: Bookmark,    title: "Saved Views",           body: "Save filter + sort combinations as named views. Share with team or keep private. Per-module defaults.", tint: "from-violet-400 to-purple-500" },
    ],
  },
  {
    label: "Customer Service & Communication",
    accentColor: "from-cyan-300 to-blue-500",
    eyebrowColor: "text-cyan-400",
    items: [
      { icon: Headphones,  title: "Helpdesk / Ticketing",  body: "Tickets with SLA timers, escalations, departments, agent assignment, internal notes + customer replies.", tint: "from-yellow-400 to-amber-500" },
      { icon: KeyRound,    title: "Customer Portal",       body: "Magic-link auth · customers self-serve tickets, invoices, documents, deals. No password needed.", tint: "from-sky-400 to-blue-500" },
      { icon: BookOpen,    title: "Knowledge Base",        body: "Markdown article CMS with categories, tags, search, voting, view tracking, related-article suggestions.", tint: "from-emerald-400 to-green-500" },
      { icon: FileInput,   title: "Public Form Builder",   body: "10 field types · drag-drop config · auto-creates leads on submit · public /forms/<slug>/ URLs for any site.", tint: "from-pink-400 to-rose-500" },
      { icon: MessageSquare, title: "Real WhatsApp Cloud", body: "Meta Graph v18 send · template + media · delivery status webhooks · incoming reply log · bulk send.", tint: "from-violet-400 to-purple-500" },
      { icon: Bell,        title: "Live Notifications",    body: "Bell with unread badge polls every 60s. Auto-emit on lead-assign, deal-won, payment, task-due, SLA breach.", tint: "from-orange-400 to-red-500" },
      { icon: BellIcon,    title: "Push Notifications",    body: "Web Push (VAPID) + Expo / mobile push. Deep links, multi-device, auto-deactivate on subscription death.", tint: "from-amber-400 to-orange-500" },
      { icon: Mail,        title: "Email & SMTP",          body: "Per-org SMTP, transactional + marketing templates, variable interpolation, delivery logs.", tint: "from-cyan-400 to-blue-500" },
    ],
  },
  {
    label: "Intelligence & Automation",
    accentColor: "from-fuchsia-300 to-purple-500",
    eyebrowColor: "text-fuchsia-400",
    items: [
      { icon: Sparkles,    title: "AI CRM Features",       body: "Lead summaries · follow-up drafts · deal-risk scoring · email draft · meeting summary. OpenAI + Anthropic abstraction.", tint: "from-yellow-400 to-amber-500" },
      { icon: Workflow,    title: "Automation Engine",     body: "Trigger → action chains with 7 action types (task · assign · notify · score · stage move · webhook · WhatsApp). Celery-ready.", tint: "from-pink-400 to-rose-500" },
      { icon: TrendingUp,  title: "Advanced Analytics",    body: "Least-squares revenue forecast · weekly cohort analysis · churn detection · funnel intelligence · executive summary.", tint: "from-emerald-400 to-green-500" },
      { icon: BarChart3,   title: "Real-time Dashboards",  body: "Live KPIs for revenue, win rate, top performers, monthly trends — auto-refreshed on every refresh.", tint: "from-violet-400 to-purple-500" },
      { icon: LayoutDashboard, title: "Dashboard Builder", body: "Drag-resize widgets with react-grid-layout. 6 widget types. Save per-user or role-shared layouts.", tint: "from-orange-400 to-red-500" },
      { icon: PenTool,     title: "E-Signature",           body: "Multi-signer ordered chains · 6-digit OTP verification · canvas signature pad · audit-stamped PDF.", tint: "from-fuchsia-400 to-pink-500" },
      { icon: Sliders,     title: "Industry Templates",    body: "7 one-click presets — Solar · Real Estate · Healthcare · Insurance · Logistics · Education · General.", tint: "from-cyan-400 to-blue-500" },
      { icon: Cpu,         title: "Approval Workflows",    body: "Multi-step approval chains for discounts, contracts, leave, refunds. Inbox + requested + all tabs.", tint: "from-amber-400 to-orange-500" },
    ],
  },
  {
    label: "Platform & Infrastructure",
    accentColor: "from-emerald-300 to-green-500",
    eyebrowColor: "text-emerald-400",
    items: [
      { icon: Building2,   title: "Multi-Tenant SaaS",     body: "Each organization gets isolated data, users, pipelines, branding and quotas. Server-enforced isolation.", tint: "from-yellow-400 to-amber-500" },
      { icon: ShieldCheck, title: "Role-Based Access",     body: "8 built-in roles — Owner, Admin, Manager, Team Lead, Sales, Support, Employee, Viewer. Enforced server-side.", tint: "from-sky-400 to-blue-500" },
      { icon: Lock,        title: "TOTP 2FA",              body: "Real pyotp enrollment with QR codes + 8 backup codes. Enforced on login — works on web and mobile.", tint: "from-violet-400 to-purple-500" },
      { icon: Activity,    title: "Audit Logs",            body: "Every CREATE / UPDATE / DELETE / LOGIN logged with field-level diffs, IP, user-agent. Compliance-ready.", tint: "from-emerald-400 to-green-500" },
      { icon: Monitor,     title: "Sessions & Devices",    body: "List + revoke active devices · suspicious login detection · 'sign out all' on stolen-device · JWT blacklist.", tint: "from-orange-400 to-red-500" },
      { icon: FileSpreadsheet, title: "Import / Export",   body: "CSV + Excel with field mapping, dry-run preview, validation log, one-click rollback of any import job.", tint: "from-amber-400 to-orange-500" },
      { icon: Database,    title: "Backup & Restore",      body: "Scheduled snapshots · optional Fernet (AES) encryption · retention pruning · one-click restore.", tint: "from-pink-400 to-rose-500" },
      { icon: Cloud,       title: "Cloud Storage OAuth",   body: "Google Drive · Dropbox · OneDrive integrations with one-click connect + per-user tokens.", tint: "from-fuchsia-400 to-pink-500" },
      { icon: IndianRupee, title: "Razorpay Billing",      body: "Real checkout · webhook signature verify · GST invoice PDF · subscription auto-renewals.", tint: "from-cyan-400 to-blue-500" },
      { icon: BookOpen,    title: "Public API + Docs",     body: "Swagger UI · ReDoc · raw OpenAPI schema · per-org API keys with module-scoped permissions.", tint: "from-yellow-400 to-amber-500" },
      { icon: Puzzle,      title: "Plugin System",         body: "Drop modules in plugins/<slug>.py · register against named hooks · dynamic load/unload per org.", tint: "from-violet-400 to-purple-500" },
      { icon: Globe,       title: "Multi-language (i18n)", body: "English + Hindi out of the box. Lightweight dict-based translation with locale persistence.", tint: "from-emerald-400 to-green-500" },
      { icon: Smartphone,  title: "Native Mobile App",     body: "iOS + Android via Expo. Field teams update leads from the customer's location with offline-ready architecture.", tint: "from-orange-400 to-red-500" },
      { icon: FileCheck2,  title: "KYC & Documents",       body: "Aadhaar, PAN, contracts, invoices — collect, store, attach to every customer record. PDF/JPG/PNG up to 5MB.", tint: "from-amber-400 to-orange-500" },
      { icon: IndianRupee, title: "Payment Tracking",      body: "Booking → Partial → Full. Cash, cheque, UPI, card, online, finance — every transaction logged with proof.", tint: "from-pink-400 to-rose-500" },
    ],
  },
];

const steps = [
  { icon: Target,         title: "Capture", body: "Lead arrives via website form, WhatsApp ping, or phone call — auto-scored and dropped into your pipeline with source attribution." },
  { icon: Workflow,       title: "Qualify", body: "Auto-assigned to the right rep, AI drafts the follow-up, status moves through configurable stages with audit-log diffs." },
  { icon: HeartHandshake, title: "Close",   body: "Deal marked Won. Razorpay checkout. KYC + e-signed contract attached. Customer portal opens automatically." },
  { icon: Rocket,         title: "Retain",  body: "Tickets, knowledge base, scheduled backups, AI follow-ups — the same platform keeps customers engaged for years." },
];

const integrations = [
  { icon: MessageSquare, name: "WhatsApp" },
  { icon: Mail,          name: "Gmail / SMTP" },
  { icon: IndianRupee,   name: "Razorpay" },
  { icon: Cloud,         name: "Google Drive" },
  { icon: Cloud,         name: "Dropbox" },
  { icon: Cloud,         name: "OneDrive" },
  { icon: Sparkles,      name: "OpenAI" },
  { icon: Sparkles,      name: "Anthropic" },
  { icon: BellIcon,      name: "Web Push" },
  { icon: Smartphone,    name: "Expo Push" },
  { icon: Database,      name: "CSV / Excel" },
  { icon: Zap,           name: "Webhooks" },
];

export default function Features() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="One CRM, the"
        accent="whole pipeline."
        subtitle="From the first website visit to the signed contract, the support ticket, and the renewal — every step tracked. 50+ features, configurable for any industry."
      />

      {/* ── Grouped feature sections ── */}
      <section className="px-6 pb-20 space-y-20">
        {groupedFeatures.map((group, gi) => (
          <div key={group.label} className="max-w-6xl mx-auto">
            <SectionHeading
              eyebrow={`${String(gi + 1).padStart(2, "0")} · ${group.label}`}
              title={group.label.split(" & ")[0]}
              accent={group.label.includes(" & ") ? `& ${group.label.split(" & ")[1].toLowerCase()}.` : "."}
              eyebrowColor={group.eyebrowColor}
              accentColor={group.accentColor}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.items.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={i * 0.03} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="How it works"
            title="From first touch to"
            accent="lifelong customer."
            eyebrowColor="text-emerald-400"
            accentColor="from-emerald-300 to-green-500"
          />
          <div className="relative grid md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                      <s.icon size={28} className="text-black" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-black border border-yellow-400 text-yellow-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-5">{s.title}</h3>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile app showcase ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-3 font-bold">
              Mobile app
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
              Your CRM, in{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                your pocket.
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Built with Expo (React Native). Update leads from the customer's
              location, log payments on site, capture KYC with your phone camera.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Live notifications tab with unread badge + Expo push",
                "2FA OTP challenge on login",
                "Organization context + plan badge in profile",
                "Industry-agnostic lead cards",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-black" strokeWidth={3} />
                  </div>
                  <span className="text-gray-300">{t}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-black hover:scale-105 transition-transform">
                <Smartphone size={20} />
                <div className="text-left">
                  <p className="text-[10px] -mb-0.5">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-black hover:scale-105 transition-transform">
                <Smartphone size={20} />
                <div className="text-left">
                  <p className="text-[10px] -mb-0.5">Get it on</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative w-[280px] h-[580px] rounded-[48px] bg-gradient-to-b from-gray-900 to-black border-8 border-gray-800 shadow-[0_30px_80px_rgba(56,189,248,0.3)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
              <div className="h-full overflow-hidden bg-black p-4 pt-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-gray-500">DASHBOARD</p>
                    <p className="text-base font-bold">Welcome, admin</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
                    <Zap size={14} className="text-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    { label: "Leads", value: "1,245", color: "bg-yellow-400" },
                    { label: "Deals", value: "87", color: "bg-sky-400" },
                    { label: "Revenue", value: "₹48L", color: "bg-green-400" },
                    { label: "Win", value: "68%", color: "bg-pink-400" },
                  ].map((c) => (
                    <div key={c.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className={`w-5 h-5 rounded ${c.color} mb-2`} />
                      <p className="text-[9px] text-gray-500">{c.label}</p>
                      <p className="text-sm font-bold mt-0.5">{c.value}</p>
                    </div>
                  ))}
                </div>
                {[
                  { name: "Ramesh Kumar", tag: "WON", meta: "Solar · 5kW · Jaipur", color: "bg-green-400" },
                  { name: "Priya Sharma", tag: "VISIT", meta: "Real Estate · 3BHK · Pune", color: "bg-yellow-400" },
                  { name: "Dr. Arjun Mehta", tag: "NEW", meta: "Healthcare · Consult · Delhi", color: "bg-sky-400" },
                ].map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{c.name}</p>
                      <span className={`px-2 py-0.5 rounded-full ${c.color} text-black text-[9px] font-bold`}>{c.tag}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Plays well with others"
            title="Connects to"
            accent="every tool"
            subtitle="you already use."
            eyebrowColor="text-orange-400"
            accentColor="from-orange-300 to-red-500"
          />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {integrations.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="aspect-square rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center gap-2 hover:border-yellow-400/30 hover:bg-white/[0.08] transition-all"
              >
                <tool.icon size={24} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 text-center px-1">{tool.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
