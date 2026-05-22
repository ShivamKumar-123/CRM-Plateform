import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowRight, ArrowLeft, Users, Briefcase, BarChart3, ShieldCheck,
  Sparkles, Check, X, Sun, Layers, GitBranch, Quote, Star, Target,
  IndianRupee, TrendingUp, Smartphone, Bell, Lock, FileCheck2,
  Workflow, HeartHandshake, Rocket, ChevronDown, Trophy, Phone,
  Home as HomeIcon, Stethoscope, Shield, Truck, GraduationCap,
  ChevronLeft, ChevronRight, Play, Pause, Flame, Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { SectionHeading, FeatureCard, CTABanner } from "./_components.jsx";
import { TextParallaxContentExample } from "../../components/ui/text-parallax-content-scroll.jsx";

const industries = [
  "Real Estate", "Healthcare", "Education", "Logistics",
  "E-commerce", "Manufacturing", "Solar / Renewables",
  "Finance", "Insurance", "Agencies", "B2B Sales", "Services",
];

const stats = [
  { value: 1245, suffix: "+", label: "Leads tracked this month", icon: Users, color: "text-yellow-300" },
  { value: 87,   suffix: "%", label: "Lead-to-deal conversion rate", icon: TrendingUp, color: "text-sky-300" },
  { value: 48,   suffix: "L", prefix: "₹", label: "Revenue closed last quarter", icon: IndianRupee, color: "text-emerald-300" },
  { value: 12,   suffix: "min", label: "Average response time", icon: Zap, color: "text-pink-300" },
];

const topFeatures = [
  { icon: Users,       title: "Lead Pipeline",          body: "Capture from website, WhatsApp, public forms, email, events. Auto-scored. Auto-distributed to the right rep.", tint: "from-yellow-400 to-amber-500" },
  { icon: Sparkles,    title: "AI CRM Assistant",       body: "Lead summaries · follow-up drafts · deal-risk scoring · email drafting · meeting summaries — OpenAI + Anthropic ready.", tint: "from-fuchsia-400 to-pink-500" },
  { icon: Workflow,    title: "Automation Engine",      body: "Visual trigger → action chains. 7 action types. Celery worker scales to millions of events. Inline fallback for dev.", tint: "from-violet-400 to-purple-500" },
  { icon: Target,      title: "Lead Scoring",           body: "Auto-classify HOT / WARM / COLD on 13 activity events. Full score history per lead. Drives auto-priority.", tint: "from-pink-400 to-rose-500" },
  { icon: Trophy,      title: "Sales Leaderboards",     body: "Monthly leaderboards + per-user targets + auto-computed commissions. Driven by actual won deals.", tint: "from-emerald-400 to-green-500" },
  { icon: GitBranch,   title: "Drag-Drop Pipelines",    body: "Configure stages per module. Real @dnd-kit drag handles. 7 industry templates one-click seed.", tint: "from-sky-400 to-blue-500" },
  { icon: Layers,      title: "Custom Fields",          body: "11 field types, per module, per organization. Zero code. From BHK to watt capacity to patient ID.", tint: "from-amber-400 to-orange-500" },
  { icon: Bell,        title: "Notifications + Push",   body: "Live bell · Web Push · Expo mobile push. Auto-emit on lead-assign, deal-won, payment, ticket SLA breach.", tint: "from-cyan-400 to-blue-500" },
  { icon: Smartphone,  title: "Native Mobile App",      body: "iOS + Android via Expo. Field teams update leads from the customer's location — offline-ready.", tint: "from-orange-400 to-red-500" },
  { icon: ShieldCheck, title: "Enterprise Security",    body: "JWT auth · TOTP 2FA · session/device revoke · multi-tenant isolation · audit logs · approval workflows.", tint: "from-indigo-400 to-violet-500" },
];

const steps = [
  { icon: Target,         title: "Capture", body: "Lead arrives from website, WhatsApp, or phone — auto-scored and dropped into your pipeline." },
  { icon: Workflow,       title: "Qualify", body: "Assign to sales, schedule visit, send quotation. Status moves through configurable stages." },
  { icon: HeartHandshake, title: "Close",   body: "Deal won. Payment recorded. KYC uploaded. Audit log captures everything end-to-end." },
  { icon: Rocket,         title: "Retain",  body: "Track installation, log final payment, surface for referrals. Notifications keep team aligned." },
];

const industriesSpotlight = [
  { icon: Sun,           name: "Solar",         stages: 7, fields: 4, tint: "from-yellow-400 to-amber-500", accentClass: "text-yellow-300" },
  { icon: HomeIcon,      name: "Real Estate",   stages: 7, fields: 5, tint: "from-sky-400 to-blue-500", accentClass: "text-sky-300" },
  { icon: Stethoscope,   name: "Healthcare",    stages: 7, fields: 5, tint: "from-emerald-400 to-green-500", accentClass: "text-emerald-300" },
  { icon: Shield,        name: "Insurance",     stages: 7, fields: 5, tint: "from-violet-400 to-purple-500", accentClass: "text-violet-300" },
  { icon: Truck,         name: "Logistics",     stages: 7, fields: 5, tint: "from-orange-400 to-red-500", accentClass: "text-orange-300" },
  { icon: GraduationCap, name: "Education",     stages: 7, fields: 5, tint: "from-pink-400 to-rose-500", accentClass: "text-pink-300" },
];

const stopStart = [
  {
    stop: "Lost lead in 4 WhatsApp groups",
    start: "Every lead in one pipeline + auto-distributed to the right rep",
  },
  {
    stop: "Excel sheets that nobody updates",
    start: "Live dashboards + revenue forecast + cohort + churn analytics",
  },
  {
    stop: "Sales rep quits, takes deals with them",
    start: "Org-scoped data + session revoke + audit log on every change",
  },
  {
    stop: "Manual lead-priority guesswork",
    start: "Auto HOT/WARM/COLD scoring + AI follow-up drafts on demand",
  },
  {
    stop: "Forgot to follow up — deal goes cold",
    start: "Automation rules + notifications + Web Push + Expo mobile push",
  },
  {
    stop: "Customer support buried in inboxes",
    start: "Built-in helpdesk · SLA timers · customer portal · knowledge base",
  },
  {
    stop: "Manual contracts + chasing signatures",
    start: "E-signature with OTP verification + audit-stamped PDF in 2 minutes",
  },
  {
    stop: "Compliance + backup panic",
    start: "Field-level audit log + Fernet-encrypted scheduled backups",
  },
];

const testimonials = [
  {
    name: "Rakesh Agarwal", role: "Founder · SunPower Solar, Rajasthan",
    body: "We were drowning in Excel and WhatsApp screenshots. CRM Suite cut our lead handoff time by 60% and our team converts 40% more leads.",
    avatar: "RA", tint: "from-yellow-400 to-amber-500", rating: 5,
  },
  {
    name: "Priya Iyer", role: "Sales Head · Stellar Homes, Bengaluru",
    body: "Custom fields let us add property-size, BHK, parking — fields no off-the-shelf CRM had. The mobile app means agents update inquiries from the property site itself.",
    avatar: "PI", tint: "from-sky-400 to-blue-500", rating: 5,
  },
  {
    name: "Dr. Mohammed Ansari", role: "Director · Crescent Dental Group",
    body: "We run six clinics across two cities. Multi-tenant pipelines + role-based access mean each branch sees only its patients. Best decision this year.",
    avatar: "MA", tint: "from-emerald-400 to-green-500", rating: 5,
  },
];

const pricingTeaser = [
  { name: "Demo",      price: "Free",   period: "",        blurb: "18 feature modules · 5 industry presets · AI demo assistant · Reset anytime" },
  { name: "Growth",    price: "₹4,999", period: "/mo",     blurb: "5 users · Pipelines · Mobile app · Reports · Import/export · Notifications" },
  { name: "Business",  price: "₹9,999", period: "/mo",     blurb: "25 users · Helpdesk + portal · Automation · Audit logs + 2FA · API access", highlight: true },
];

const topFaqs = [
  { q: "Which industries does CRM Suite support?",
    a: "12+ industries with one-click templates — solar, real estate, healthcare, education, insurance, logistics, manufacturing, agencies, e-commerce, finance, B2B sales, services. Each preset seeds pipelines + custom fields + scoring rules in 5 seconds." },
  { q: "Do I really get AI assistance built in?",
    a: "Yes. Lead summaries, follow-up drafts, deal-risk scoring (0-100 confidence with reasoning), email drafting, meeting summaries — all via the AI assistant page. Plug in your OpenAI or Anthropic API key and it works immediately; without a key it runs in deterministic stub mode for the UI to flow." },
  { q: "How do I bring my existing leads + customers in?",
    a: "Built-in CSV + Excel import engine with column mapping, dry-run preview, validation log, and one-click rollback. Onboarding team helps migrate from Excel, Zoho, HubSpot, Salesforce in under 48 hours." },
  { q: "Can my customers self-serve?",
    a: "Yes — the Customer Portal lets you mint magic-link tokens; customers see their own tickets, invoices, documents, and deals without a password. Pair with the built-in Helpdesk + Knowledge Base for a complete support stack." },
  { q: "Is real WhatsApp + Razorpay integrated?",
    a: "Yes. Real Meta WhatsApp Cloud API (text · template · media · webhook · delivery status · incoming replies) and real Razorpay checkout (signature verify · webhook · GST invoice PDF · subscription auto-renewals). Add your credentials and they go live." },
  { q: "Is the data hosted in India?",
    a: "Yes. All data lives on servers in Mumbai (AWS ap-south-1), fully compliant with India's DPDP Act. You own your data, can backup any time (Fernet-encrypted), and export to CSV / API at will." },
];

/* ───────────────── HERO SLIDES ───────────────── */
const heroSlides = [
  {
    id: "industries",
    eyebrow: "Multi-industry CRM platform",
    eyebrowIcon: Sparkles,
    title: "One CRM for",
    accent: "every",
    titleSuffix: "industry you run.",
    subtitle: "Real estate, healthcare, education, solar, manufacturing — every business runs the same loop. CRM Suite gives you that loop, configurable for any industry.",
    primaryCta: { label: "Sign In", href: "/login" },
    secondaryCta: { label: "See all features", href: "/features" },
    accentClass: "from-yellow-300 via-amber-400 to-yellow-500",
    glow: "rgba(250,204,21,0.35)",
    eyebrowColor: "text-yellow-300",
    badgeBorder: "border-yellow-400/30",
    visual: "industries",
  },
  {
    id: "scoring",
    eyebrow: "AI lead scoring engine",
    eyebrowIcon: Flame,
    title: "Auto-rank every lead",
    accent: "HOT / WARM / COLD",
    titleSuffix: "in real time.",
    subtitle: "13 default activity rules score every lead 0-100. Your reps call the hottest leads first — and the cold ones don't get forgotten. Full audit trail per lead.",
    primaryCta: { label: "Try lead scoring", href: "/login" },
    secondaryCta: { label: "How scoring works", href: "/features" },
    accentClass: "from-pink-300 via-rose-400 to-red-500",
    glow: "rgba(244,63,94,0.35)",
    eyebrowColor: "text-pink-300",
    badgeBorder: "border-pink-400/30",
    visual: "scoring",
  },
  {
    id: "mobile",
    eyebrow: "Native iOS + Android app",
    eyebrowIcon: Smartphone,
    title: "Your CRM, in",
    accent: "your pocket.",
    titleSuffix: "",
    subtitle: "Field reps update leads at the customer's location, log payments on-site, capture KYC with the phone camera. Built with Expo (React Native) — same data, offline-ready.",
    primaryCta: { label: "Download app", href: "/login" },
    secondaryCta: { label: "Mobile features", href: "/features" },
    accentClass: "from-cyan-300 via-sky-400 to-blue-500",
    glow: "rgba(56,189,248,0.35)",
    eyebrowColor: "text-cyan-300",
    badgeBorder: "border-cyan-400/30",
    visual: "mobile",
  },
  {
    id: "india",
    eyebrow: "Built for India",
    eyebrowIcon: IndianRupee,
    title: "₹, GSTIN, UPI —",
    accent: "made for Bharat.",
    titleSuffix: "",
    subtitle: "Hindi + 8 regional languages, ₹ everywhere, GSTIN/PAN/Aadhaar fields ready-made, data hosted in Mumbai (AWS ap-south-1), DPDP Act compliant.",
    primaryCta: { label: "Start free trial", href: "/login" },
    secondaryCta: { label: "Pricing in ₹", href: "/pricing" },
    accentClass: "from-emerald-300 via-green-400 to-teal-500",
    glow: "rgba(52,211,153,0.35)",
    eyebrowColor: "text-emerald-300",
    badgeBorder: "border-emerald-400/30",
    visual: "india",
  },
];

const SLIDE_DURATION = 7000;

function HeroVisual({ kind }) {
  if (kind === "industries") {
    const items = [
      { icon: Sun, name: "Solar", tint: "from-yellow-400 to-amber-500" },
      { icon: HomeIcon, name: "Real Estate", tint: "from-sky-400 to-blue-500" },
      { icon: Stethoscope, name: "Healthcare", tint: "from-emerald-400 to-green-500" },
      { icon: Shield, name: "Insurance", tint: "from-violet-400 to-purple-500" },
      { icon: Truck, name: "Logistics", tint: "from-orange-400 to-red-500" },
      { icon: GraduationCap, name: "Education", tint: "from-pink-400 to-rose-500" },
    ];
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-sky-500/20 blur-3xl" />
        <div className="relative grid grid-cols-3 gap-3 p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur">
          {items.map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, scale: 0.7, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 200, damping: 14 }}
              className="aspect-square rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center gap-2 hover:border-yellow-400/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${it.tint} flex items-center justify-center shadow-lg`}>
                <it.icon size={18} className="text-black" />
              </div>
              <span className="text-[10px] font-bold text-gray-300">{it.name}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black border border-yellow-400/40 text-xs font-bold text-yellow-300 whitespace-nowrap shadow-lg"
        >
          + 6 more industries
        </motion.div>
      </div>
    );
  }

  if (kind === "scoring") {
    const leads = [
      { name: "Ramesh Kumar", score: 92, label: "HOT",  color: "from-red-500 to-pink-500",       text: "text-red-300" },
      { name: "Priya Sharma", score: 58, label: "WARM", color: "from-amber-400 to-orange-500",   text: "text-amber-300" },
      { name: "Arjun Mehta",  score: 24, label: "COLD", color: "from-sky-400 to-blue-500",       text: "text-sky-300" },
    ];
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-transparent to-rose-500/20 blur-3xl" />
        <div className="relative p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Lead priority queue</p>
            <span className="text-[10px] text-pink-300 font-bold">LIVE</span>
          </div>
          {leads.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{l.name}</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r ${l.color} text-white`}>
                  {l.label} · {l.score}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${l.score}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${l.color}`}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Activity size={10} className={l.text} />
                <span className={`text-[10px] ${l.text}`}>auto-scored on 13 rules</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "mobile") {
    return (
      <div className="relative w-full flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-[240px] h-[480px] rounded-[40px] bg-gradient-to-b from-gray-900 to-black border-8 border-gray-800 shadow-[0_30px_80px_rgba(56,189,248,0.3)] overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-2xl z-10" />
          <div className="h-full overflow-hidden bg-black p-3.5 pt-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] text-gray-500">CRM SUITE</p>
                <p className="text-sm font-bold">Hi, Rakesh</p>
              </div>
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center">
                  <Bell size={12} className="text-black" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Leads",   value: "1,245", color: "bg-yellow-400" },
                { label: "Deals",   value: "87",    color: "bg-cyan-400" },
                { label: "Revenue", value: "₹48L",  color: "bg-green-400" },
                { label: "Win",     value: "68%",   color: "bg-pink-400" },
              ].map((c) => (
                <div key={c.label} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className={`w-4 h-4 rounded ${c.color} mb-1.5`} />
                  <p className="text-[8px] text-gray-500">{c.label}</p>
                  <p className="text-xs font-bold">{c.value}</p>
                </div>
              ))}
            </div>
            {[
              { name: "Ramesh K.", p: "HOT 82",  pc: "bg-red-500 text-white" },
              { name: "Priya S.",  p: "WARM 55", pc: "bg-amber-400 text-black" },
              { name: "Arjun M.",  p: "COLD 18", pc: "bg-sky-400 text-black" },
            ].map((c) => (
              <div key={c.name} className="p-2.5 rounded-lg bg-white/5 border border-white/10 mb-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold">{c.name}</p>
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${c.pc}`}>{c.p}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (kind === "india") {
    const chips = [
      { label: "₹ INR", tint: "from-emerald-400 to-green-500" },
      { label: "GSTIN", tint: "from-yellow-400 to-amber-500" },
      { label: "PAN",   tint: "from-sky-400 to-blue-500" },
      { label: "Aadhaar", tint: "from-violet-400 to-purple-500" },
      { label: "UPI",   tint: "from-pink-400 to-rose-500" },
      { label: "DPDP",  tint: "from-orange-400 to-red-500" },
      { label: "हिंदी", tint: "from-cyan-400 to-blue-500" },
      { label: "ap-south-1", tint: "from-teal-400 to-emerald-500" },
    ];
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 blur-3xl" />
        <div className="relative p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur">
          <div className="flex items-center gap-3 mb-5">
            <div className="text-4xl">🇮🇳</div>
            <div>
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Hosted in</p>
              <p className="text-base font-bold">Mumbai · AWS ap-south-1</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {chips.map((c, i) => (
              <motion.span
                key={c.label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 220, damping: 16 }}
                className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${c.tint} text-black text-xs font-bold shadow-lg`}
              >
                {c.label}
              </motion.span>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5">
            {[
              "DPDP Act compliant",
              "No data leaves India",
              "Hindi + 8 regional languages",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className="text-emerald-400" strokeWidth={3} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function HeroSlider({ ctaHref, ctaLabel }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const go = useCallback((n) => {
    setIndex(() => (n + heroSlides.length) % heroSlides.length);
    setProgress(0);
  }, []);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const tickRate = 40;
    const id = setInterval(() => {
      setProgress((p) => {
        const np = p + (tickRate / SLIDE_DURATION) * 100;
        if (np >= 100) {
          setIndex((i) => (i + 1) % heroSlides.length);
          return 0;
        }
        return np;
      });
    }, tickRate);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = heroSlides[index];
  const PrimaryCtaIcon = slide.eyebrowIcon;

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow follows the active slide */}
      <motion.div
        key={slide.id + "-glow"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(800px 400px at 30% 30%, ${slide.glow}, transparent 60%), radial-gradient(600px 400px at 80% 70%, ${slide.glow}, transparent 60%)`,
        }}
      />

      <div className="relative px-6 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[560px]">
          {/* LEFT: text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border ${slide.badgeBorder} mb-6 backdrop-blur`}>
                <PrimaryCtaIcon size={14} className={slide.eyebrowColor} />
                <span className={`text-xs tracking-widest uppercase ${slide.eyebrowColor} font-bold`}>
                  {slide.eyebrow}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                {slide.title}{" "}
                <span className="relative inline-block">
                  <span className={`bg-gradient-to-r ${slide.accentClass} bg-clip-text text-transparent`}>
                    {slide.accent}
                  </span>
                </span>
                {slide.titleSuffix && (
                  <>
                    <br />
                    {slide.titleSuffix}
                  </>
                )}
              </h1>

              <p className="mt-6 text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold shadow-[0_8px_30px_rgba(250,204,21,0.35)] hover:shadow-[0_12px_40px_rgba(250,204,21,0.6)] transition-all"
                >
                  {ctaLabel} — it's free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={slide.secondaryCta.href}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 backdrop-blur transition-colors"
                >
                  {slide.secondaryCta.label}
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> No credit card</span>
                <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> 14-day trial</span>
                <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Setup in 5 min</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT: visual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + "-visual"}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <HeroVisual kind={slide.visual} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slider controls */}
        <div className="relative max-w-7xl mx-auto mt-10 flex items-center justify-between gap-4">
          {/* Arrow + pause group */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-400/40 backdrop-blur flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-400/40 backdrop-blur flex items-center justify-center transition-colors"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-400/40 backdrop-blur flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dot indicators with progress */}
          <div className="flex items-center gap-2 flex-1 justify-center lg:justify-end max-w-xl">
            {heroSlides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative flex-1 max-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden hover:bg-white/20 transition-colors"
              >
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${s.accentClass} transition-all`}
                  style={{
                    width:
                      i < index ? "100%" :
                      i === index ? `${progress}%` :
                      "0%",
                  }}
                />
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-2 font-mono tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ to, suffix = "", prefix = "", duration = 1.6 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / (duration * 1000), 1);
          setV(Math.floor(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{v.toLocaleString("en-IN")}{suffix}</span>;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaHref  = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : "Sign In";
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -80]);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="relative z-20 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-sky-500/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black font-bold tracking-wider text-[10px]">
            NEW
          </span>
          <span className="text-gray-300">
            Phase 5 shipped — Lead Scoring · Sales Targets · Industry Templates · Call Logs —
          </span>
          <Link to="/features" className="text-yellow-300 hover:text-yellow-200 font-semibold">
            What's new →
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
       *  HERO SLIDER (4 slides · auto-advance · keyboard + dot nav)
       * ───────────────────────────────────────────────────────── */}
      <motion.div style={{ y: heroParallax }}>
        <HeroSlider ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────
       *  LIVE DASHBOARD PREVIEW
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/20 via-white/5 to-sky-500/20 p-1 shadow-[0_30px_120px_rgba(250,204,21,0.15)]"
        >
          <div className="rounded-[22px] bg-gray-950 border border-white/10 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5 bg-black/50">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-xs text-gray-500 ml-3 font-mono">crm.advance-solar.in/app</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[9px] font-bold">LIVE</span>
            </div>

            <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6">
              {/* Left col: KPIs + chart */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <p className="text-xs text-gray-500">DASHBOARD</p>
                  <h3 className="text-2xl font-bold mt-1 flex items-center gap-2">
                    Good morning, Rakesh <Sun size={20} className="text-yellow-400" />
                  </h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Total Leads", value: "1,245", icon: Users, tint: "from-yellow-400 to-amber-500" },
                    { label: "Open Deals",  value: "87",    icon: Briefcase, tint: "from-sky-400 to-blue-500" },
                    { label: "Revenue",     value: "₹48L",  icon: IndianRupee, tint: "from-emerald-400 to-green-500" },
                    { label: "Win Rate",    value: "68%",   icon: TrendingUp, tint: "from-pink-400 to-rose-500" },
                  ].map((c) => (
                    <div key={c.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.tint} flex items-center justify-center mb-2`}>
                        <c.icon size={14} className="text-black" />
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.label}</p>
                      <p className="text-xl font-bold mt-0.5">{c.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-yellow-300">Revenue trend</p>
                    <span className="text-xs text-gray-500">Last 12 months</span>
                  </div>
                  <div className="h-32 flex items-end justify-around gap-1.5">
                    {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 78].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.6 }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-yellow-500/70 to-sky-400/70 hover:from-yellow-400 hover:to-sky-400 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col: activity feed */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recent activity</p>
                {[
                  { name: "Ramesh Kumar", action: "deal WON · ₹3.2L",         time: "2m",  color: "bg-green-400" },
                  { name: "Priya Sharma", action: "site visit scheduled",     time: "12m", color: "bg-yellow-400" },
                  { name: "Dr. Arjun Mehta", action: "new lead from website", time: "1h",  color: "bg-sky-400" },
                  { name: "Anita Patel",  action: "₹2.4L payment received",   time: "3h",  color: "bg-emerald-400" },
                  { name: "Vikram Singh", action: "uploaded KYC document",    time: "5h",  color: "bg-violet-400" },
                ].map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className={`w-2 h-2 rounded-full ${a.color} mt-1.5 flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{a.name}</p>
                      <p className="text-xs text-gray-500 truncate">{a.action}</p>
                    </div>
                    <span className="text-[10px] text-gray-600">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  INDUSTRIES MARQUEE
       * ───────────────────────────────────────────────────────── */}
      <section className="py-10 border-y border-white/5 backdrop-blur">
        <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-5">
          One platform, every industry
        </p>
        <div className="overflow-hidden">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {[...industries, ...industries].map((label, i) => (
              <div key={i} className="text-xl md:text-2xl font-bold text-white/20 hover:text-yellow-400/60 transition-colors tracking-tight inline-flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  ANIMATED STATS
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="By the numbers"
            title="Powering thousands of"
            accent="Indian businesses"
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 via-blue-400 to-sky-500"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="gradient-border rounded-2xl p-6 md:p-8 text-center"
              >
                <s.icon size={20} className={`mx-auto mb-3 ${s.color}`} />
                <p className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                  <Counter to={s.value} suffix={s.suffix} prefix={s.prefix || ""} />
                </p>
                <p className="text-xs md:text-sm text-gray-400 mt-3 leading-tight">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  HOW IT WORKS
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="How it works"
            title="Four steps from"
            accent="lead to install."
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

      {/* ─────────────────────────────────────────────────────────
       *  TOP FEATURES (8)
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Everything you need"
            title="The features your team"
            accent="actually uses."
            subtitle="Lead pipelines, scoring, drag-drop, custom fields, leaderboards, security — every piece is built to be configurable."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {topFeatures.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.05} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-colors">
              See all 18 features <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  INDUSTRIES SPOTLIGHT
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Industry presets"
            title="One click to set up your"
            accent="industry-specific pipeline."
            subtitle="Each preset includes pipeline stages, custom fields, and scoring rules tuned for that industry."
            eyebrowColor="text-violet-400"
            accentColor="from-violet-300 to-purple-500"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industriesSpotlight.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to="/industries"
                  className="block p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 transition-colors text-center group"
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${ind.tint} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <ind.icon size={22} className="text-black" />
                  </div>
                  <p className="font-bold text-sm">{ind.name}</p>
                  <p className={`text-[10px] ${ind.accentClass} mt-1`}>
                    {ind.stages} stages · {ind.fields} fields
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/industries" className="inline-flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200 font-semibold">
              Browse all 12 industries <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  MOBILE APP SHOWCASE
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-3 font-bold">
              Native mobile app
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
            <ul className="space-y-3 mb-8">
              {[
                "Live notifications tab with unread badge",
                "2FA OTP challenge on login",
                "Organization context + plan badge in profile",
                "Industry-agnostic lead cards with priority scoring",
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
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
                      <Bell size={14} className="text-black" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[
                    { label: "Leads",   value: "1,245", color: "bg-yellow-400" },
                    { label: "Deals",   value: "87",    color: "bg-sky-400" },
                    { label: "Revenue", value: "₹48L",  color: "bg-green-400" },
                    { label: "Win",     value: "68%",   color: "bg-pink-400" },
                  ].map((c) => (
                    <div key={c.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className={`w-5 h-5 rounded ${c.color} mb-2`} />
                      <p className="text-[9px] text-gray-500">{c.label}</p>
                      <p className="text-sm font-bold mt-0.5">{c.value}</p>
                    </div>
                  ))}
                </div>
                {[
                  { name: "Ramesh Kumar",   priority: "HOT  · 82", priorityColor: "bg-red-500 text-white", meta: "Solar · 5kW · Jaipur" },
                  { name: "Priya Sharma",   priority: "WARM · 55", priorityColor: "bg-yellow-400 text-black", meta: "Real Estate · 3BHK · Pune" },
                  { name: "Dr. Arjun Mehta",priority: "COLD · 18", priorityColor: "bg-sky-400 text-black",   meta: "Healthcare · Delhi" },
                ].map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{c.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${c.priorityColor}`}>{c.priority}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{c.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  STOP / START COMPARISON
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="The transformation"
            title="Stop doing this."
            accent="Start doing this."
            eyebrowColor="text-pink-400"
            accentColor="from-pink-300 to-rose-500"
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* STOP column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-red-500/5 border border-red-500/20 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <X size={20} className="text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-300">Stop doing this</h3>
              </div>
              <ul className="space-y-3">
                {stopStart.map((row, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <X size={14} className="text-red-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-400 line-through decoration-red-500/40">{row.stop}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* START column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-yellow-500/10 border border-emerald-500/30 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check size={20} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-300">Start doing this</h3>
              </div>
              <ul className="space-y-3">
                {stopStart.map((row, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check size={14} className="text-emerald-400 mt-1 flex-shrink-0" />
                    <span className="text-white">{row.start}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  PARALLAX SCROLL STORY (3 sticky-image sections)
       * ───────────────────────────────────────────────────────── */}
      <section className="py-10">
        <TextParallaxContentExample />
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  TESTIMONIALS
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Loved by Indian sales teams"
            title="Don't take"
            accent="our word"
            subtitle="for it."
            eyebrowColor="text-yellow-400"
            accentColor="from-yellow-300 to-amber-500"
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="gradient-border rounded-2xl p-7 flex flex-col"
              >
                <Quote size={28} className="text-yellow-400/50 mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 leading-relaxed flex-1">"{t.body}"</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.tint} flex items-center justify-center text-black font-bold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 truncate">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  PRICING TEASER
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Pricing"
            title="Honest, simple,"
            accent="₹-priced."
            subtitle="Free demo. SaaS plans from ₹4,999/mo. Or own the entire platform — source code from ₹3L. Cancel anytime, 14-day money-back guarantee."
            eyebrowColor="text-emerald-400"
            accentColor="from-emerald-300 to-green-500"
          />

          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {pricingTeaser.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-2xl p-7 ${
                  p.highlight
                    ? "bg-gradient-to-b from-yellow-500/20 to-transparent border-2 border-yellow-400/40 shadow-[0_20px_60px_rgba(250,204,21,0.2)]"
                    : "bg-white/[0.04] border border-white/10"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold tracking-wider">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className="text-gray-500 ml-1 text-sm">{p.period}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{p.blurb}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-colors"
            >
              See full pricing + comparison <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
       *  FAQ TEASER
       * ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="FAQ"
            title="Common"
            accent="questions."
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 to-blue-500"
          />

          <div className="space-y-3">
            {topFaqs.map((f, i) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold text-base md:text-lg">{f.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-yellow-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-400 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing#faq" className="inline-flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200 font-semibold">
              More questions on the Pricing page <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <CTABanner ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </>
  );
}
