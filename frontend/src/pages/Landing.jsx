import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Users,
  Briefcase,
  BarChart3,
  ShieldCheck,
  FileCheck2,
  Smartphone,
  Sparkles,
  Check,
  Sun,
  Clock,
  Workflow,
  Bell,
  IndianRupee,
  TrendingUp,
  MessageSquare,
  Lock,
  Quote,
  ChevronDown,
  Star,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Cloud,
  Database,
  Layers,
  Target,
  Rocket,
  HeartHandshake,
  GitBranch,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

/* ────────────────────────────────────────────────────────────────
 *  Animation variants
 * ──────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: "easeOut" },
  }),
};

/* ────────────────────────────────────────────────────────────────
 *  Animated counter
 * ──────────────────────────────────────────────────────────────── */
function Counter({ to, suffix = "", duration = 1.6 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
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
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Data
 * ──────────────────────────────────────────────────────────────── */
const stats = [
  { value: 1245, suffix: "+", label: "Leads tracked this month" },
  { value: 87, suffix: "%", label: "Lead-to-deal conversion rate" },
  { value: 48, suffix: "L", prefix: "₹", label: "Revenue closed last quarter" },
  { value: 12, suffix: "min", label: "Average response time" },
];

const featureList = [
  {
    icon: Users,
    title: "Lead Pipeline",
    body: "Capture leads from website, referrals, WhatsApp or dealer network — all flowing into one pipeline.",
    tint: "from-yellow-400 to-amber-500",
  },
  {
    icon: Briefcase,
    title: "Deal Management",
    body: "Track Open, Won, Cancelled. See deal value, cost price, and net profit on every closure.",
    tint: "from-sky-400 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    body: "Live dashboards for revenue, win rate, top performers — refresh once, see truth.",
    tint: "from-emerald-400 to-green-500",
  },
  {
    icon: FileCheck2,
    title: "KYC & Documents",
    body: "Aadhaar, PAN, address proof — collect, store, and attach to every customer record.",
    tint: "from-pink-400 to-rose-500",
  },
  {
    icon: IndianRupee,
    title: "Payment Tracking",
    body: "Booking → Partial → Full. Cash, cheque, online, finance — every transaction logged with proof.",
    tint: "from-orange-400 to-red-500",
  },
  {
    icon: ShieldCheck,
    title: "Role-based Access",
    body: "Admin sees all. Sales sees assigned. Dealer sees their territory. Permissions enforced server-side.",
    tint: "from-violet-400 to-purple-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    body: "Native iOS + Android apps for field sales. Update lead status from the customer's rooftop.",
    tint: "from-cyan-400 to-blue-500",
  },
  {
    icon: Bell,
    title: "Task Automation",
    body: "Auto-assign leads, smart status updates from task messages — write 'completed' and it's done.",
    tint: "from-fuchsia-400 to-pink-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    body: "JWT auth, rotating refresh tokens, HTTPS enforced, audit trail on every change.",
    tint: "from-indigo-400 to-violet-500",
  },
];

const steps = [
  {
    icon: Target,
    title: "Capture",
    body: "Lead arrives via your website form, a WhatsApp ping, or a phone call — gets dropped into the pipeline with full source attribution.",
  },
  {
    icon: Workflow,
    title: "Qualify",
    body: "Assign to sales, schedule site visit, generate quotation. Status moves through NEW → CONTACTED → SITE VISIT → QUOTATION SENT.",
  },
  {
    icon: HeartHandshake,
    title: "Close",
    body: "Deal marked Won. Booking payment recorded. KYC documents uploaded. Customer signs.",
  },
  {
    icon: Rocket,
    title: "Install & Retain",
    body: "Track installation milestones, log final payment, and surface customer for referrals & service calls.",
  },
];

const testimonials = [
  {
    name: "Rakesh Agarwal",
    role: "Founder, SunPower Rajasthan",
    body: "We were drowning in Excel sheets and WhatsApp screenshots. After switching to CRM Suite our team converts 40% more leads — and I finally know what's happening without calling everyone.",
    rating: 5,
    avatar: "RA",
    tint: "from-yellow-400 to-amber-500",
  },
  {
    name: "Priya Iyer",
    role: "Sales Head, GreenWatt Solar",
    body: "The mobile app is a game-changer. My field team updates leads from the customer's rooftop. By the time they're back at the office, the deal is half-closed.",
    rating: 5,
    avatar: "PI",
    tint: "from-sky-400 to-blue-500",
  },
  {
    name: "Mohammed Ansari",
    role: "Director, Crescent Power",
    body: "Finally a CRM built for Indian solar — not retrofit from a US sales tool. Watt capacity, DCR/non-DCR, dealer hierarchy — it just understands our business.",
    rating: 5,
    avatar: "MA",
    tint: "from-emerald-400 to-green-500",
  },
];

const pricing = [
  {
    name: "Starter",
    tagline: "For solo installers",
    price: "₹0",
    period: "/forever",
    cta: "Start free",
    highlight: false,
    features: [
      "Up to 100 leads",
      "1 user account",
      "Basic dashboard",
      "Email support",
      "Mobile app access",
    ],
  },
  {
    name: "Growth",
    tagline: "Most popular",
    price: "₹2,499",
    period: "/month",
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "Unlimited leads & deals",
      "Up to 10 users",
      "Advanced analytics",
      "KYC document storage",
      "Payment workflow",
      "Role-based access",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For dealer networks",
    price: "Custom",
    period: "",
    cta: "Talk to sales",
    highlight: false,
    features: [
      "Everything in Growth",
      "Unlimited users",
      "Dealer hierarchy",
      "Custom integrations",
      "Dedicated success manager",
      "99.9% uptime SLA",
      "On-premise option",
    ],
  },
];

const faqs = [
  {
    q: "Is the data hosted in India?",
    a: "Yes. All data is stored on servers located in Mumbai (AWS ap-south-1). We comply with India's Digital Personal Data Protection Act, and you own your data — export it anytime.",
  },
  {
    q: "Can I import my existing leads from Excel?",
    a: "Yes — CSV / XLSX upload with column mapping. Onboarding team helps you migrate from Excel, Zoho, HubSpot, or any existing CRM in under 48 hours.",
  },
  {
    q: "Do you support the brands I sell (Gautam, Waaree, Adani)?",
    a: "Built-in. We have brand presets for Gautam, Waaree, and Adani — plus configurable templates for any other panel/inverter brand you carry.",
  },
  {
    q: "How does the mobile app handle no internet?",
    a: "The app caches your assigned leads locally. Updates sync when you're back online — works perfectly at remote rural installations.",
  },
  {
    q: "Can I give my dealers limited access?",
    a: "Yes. Dealers see only their territory and assigned leads. Channel partners get a separate role with read-only commission reports.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Cancel anytime — no contract lock-in. We'll export all your data on request, and you keep ownership.",
  },
];

const partnerLogos = [
  "Gautam Solar",
  "Waaree",
  "Adani Solar",
  "Tata Power",
  "Vikram Solar",
  "Luminous",
  "Renewsys",
  "Microtek",
  "Su-Kam",
  "Polycab",
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/* ────────────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────────── */
function Landing() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : "Sign In";
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, -100]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-yellow-400/30">
      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-yellow-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-sky-500/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl animate-pulse-glow" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Spotlight cursor */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-radial" />

      {/* ─────────────────────────────────────────────────────────
       *  ANNOUNCEMENT BAR
       * ───────────────────────────────────────────────────────── */}
      <div className="relative z-20 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-sky-500/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black font-bold tracking-wider text-[10px]">
            NEW
          </span>
          <span className="text-gray-300">
            Mobile app for iOS and Android is live —
          </span>
          <a href="#mobile" className="text-yellow-300 hover:text-yellow-200 font-semibold inline-flex items-center gap-1">
            See it <ChevronRight size={12} />
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
       *  STICKY NAV
       * ───────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/70 backdrop-blur-xl border-b border-yellow-500/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/30 group-hover:scale-110 transition-transform"
              style={{ boxShadow: "0 0 24px rgba(250,204,21,0.55)" }}
            >
              <Zap size={20} className="text-black fill-black" />
            </div>
            <span className="font-bold tracking-widest text-sm bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
              CRM SUITE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-gray-400 hover:text-yellow-300 transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 to-sky-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline text-sm text-gray-300 hover:text-white transition"
            >
              Sign in
            </Link>
            <Link
              to={ctaHref}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-semibold shadow-lg hover:shadow-yellow-500/50 hover:scale-105 transition-all"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* ─────────────────────────────────────────────────────────
         *  HERO
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <motion.div style={{ y: heroParallax }} className="max-w-6xl mx-auto text-center">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-yellow-400/30 mb-8 backdrop-blur"
            >
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-xs tracking-widest uppercase text-yellow-300">
                India's #1 solar CRM
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-xs text-gray-400">Trusted by 500+ installers</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-5xl md:text-7xl lg:text-[110px] font-black tracking-tight leading-[0.95]"
            >
              The CRM that runs{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  India's
                </span>
                <Sun
                  size={32}
                  className="absolute -top-4 -right-8 text-yellow-400 animate-spin-slow hidden md:block"
                />
              </span>
              <br />
              solar businesses.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              Replace your WhatsApp groups, Excel sheets, and sticky notes with one
              clean pipeline. Manage <span className="text-white">leads, deals, KYC, and payments</span> —
              built specifically for rooftop solar.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to={ctaHref}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-bold shadow-[0_8px_30px_rgba(250,204,21,0.35)] hover:shadow-[0_12px_40px_rgba(250,204,21,0.6)] transition-all"
              >
                {ctaLabel} — it's free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 backdrop-blur transition-colors"
              >
                Watch demo (2 min)
              </a>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-500"
            >
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> 14-day free trial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Setup in 5 minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" /> Data hosted in India
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  PARTNER MARQUEE
         * ───────────────────────────────────────────────────────── */}
        <section className="py-12 border-y border-white/5 backdrop-blur">
          <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-6">
            Compatible with every panel & inverter brand you sell
          </p>
          <div className="overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
              {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                <div
                  key={i}
                  className="text-2xl md:text-3xl font-black text-white/15 hover:text-yellow-400/50 transition-colors tracking-tight"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  STATS
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-sky-400 mb-3">
                The numbers
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto">
                Powering thousands of solar sales every day.
              </h2>
            </motion.div>

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
                  <p className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                    {s.prefix}
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mt-3 leading-tight">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  DASHBOARD PREVIEW
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl bg-gradient-to-br from-yellow-500/20 via-white/5 to-sky-500/20 p-1 shadow-[0_30px_120px_rgba(250,204,21,0.15)]"
            >
              <div className="rounded-[22px] bg-gray-950 border border-white/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/5 bg-black/50">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="text-xs text-gray-500 ml-3 font-mono">
                    crm.advance-solar.in/app
                  </span>
                </div>

                <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6">
                  {/* Left column */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <p className="text-xs text-gray-500">DASHBOARD</p>
                      <h3 className="text-2xl font-bold mt-1">Good morning, Rakesh ☀️</h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "Total Leads", value: "1,245", icon: Users, tint: "from-yellow-400 to-amber-500" },
                        { label: "Open Deals", value: "87", icon: Briefcase, tint: "from-sky-400 to-blue-500" },
                        { label: "Revenue", value: "₹48L", icon: IndianRupee, tint: "from-emerald-400 to-green-500" },
                        { label: "Win Rate", value: "68%", icon: TrendingUp, tint: "from-pink-400 to-rose-500" },
                      ].map((c) => (
                        <div
                          key={c.label}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.tint} flex items-center justify-center mb-2`}>
                            <c.icon size={14} className="text-black" />
                          </div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{c.label}</p>
                          <p className="text-xl font-bold mt-0.5">{c.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
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

                  {/* Right column — activity */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Recent activity
                    </p>
                    {[
                      { name: "Ramesh Kumar", action: "marked DEALED", time: "2m", color: "bg-green-400" },
                      { name: "Priya Sharma", action: "scheduled site visit", time: "12m", color: "bg-yellow-400" },
                      { name: "Arjun Mehta", action: "new lead from website", time: "1h", color: "bg-sky-400" },
                      { name: "Anita Patel", action: "₹2.4L payment received", time: "3h", color: "bg-emerald-400" },
                      { name: "Vikram Singh", action: "uploaded Aadhaar", time: "5h", color: "bg-violet-400" },
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
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  FEATURES
         * ───────────────────────────────────────────────────────── */}
        <section id="features" className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-yellow-400 mb-3">
                Everything you need
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                One CRM, the{" "}
                <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-sky-500 bg-clip-text text-transparent">
                  whole pipeline.
                </span>
              </h2>
              <p className="mt-5 text-gray-400 max-w-2xl mx-auto text-lg">
                From the first phone call to the final invoice — every step of a
                solar sale, tracked.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featureList.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur hover:border-yellow-400/30 transition-all overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${f.tint}`}
                  />
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.tint} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <f.icon size={22} className="text-black" />
                  </div>
                  <h3 className="relative text-lg font-bold mb-2">{f.title}</h3>
                  <p className="relative text-sm text-gray-400 leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  HOW IT WORKS
         * ───────────────────────────────────────────────────────── */}
        <section id="how" className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-emerald-400 mb-3">
                How it works
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Four steps from{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-green-500 bg-clip-text text-transparent">
                  lead to install.
                </span>
              </h2>
            </motion.div>

            <div className="relative grid md:grid-cols-4 gap-6">
              {/* Connecting line */}
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
         *  MOBILE APP SHOWCASE
         * ───────────────────────────────────────────────────────── */}
        <section id="mobile" className="px-6 py-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest text-cyan-400 mb-3">
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
                rooftop, log payments at the site, capture KYC documents with your
                phone camera.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Offline-first — works without internet, syncs when back online",
                  "Push notifications for new leads & status changes",
                  "Camera capture for KYC documents and payment proofs",
                  "Biometric login (Face ID / fingerprint)",
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
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-black hover:scale-105 transition-transform"
                >
                  <Smartphone size={20} />
                  <div className="text-left">
                    <p className="text-[10px] -mb-0.5">Download on the</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-black hover:scale-105 transition-transform"
                >
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
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

                <div className="h-full overflow-hidden bg-black p-4 pt-10">
                  {/* App content */}
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
                      <div
                        key={c.label}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className={`w-5 h-5 rounded ${c.color} mb-2`} />
                        <p className="text-[9px] text-gray-500">{c.label}</p>
                        <p className="text-sm font-bold mt-0.5">{c.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">Ramesh Kumar</p>
                      <span className="px-2 py-0.5 rounded-full bg-green-400 text-black text-[9px] font-bold">DEALED</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Waaree · 5kW · Jaipur</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">Priya Sharma</p>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[9px] font-bold">VISIT</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Adani · 10kW · Pune</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">Arjun Mehta</p>
                      <span className="px-2 py-0.5 rounded-full bg-sky-400 text-black text-[9px] font-bold">NEW</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Gautam · 3kW · Delhi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  TESTIMONIALS
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-pink-400 mb-3">
                Loved by solar teams
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Don't take{" "}
                <span className="bg-gradient-to-r from-pink-300 to-rose-500 bg-clip-text text-transparent">
                  our word
                </span>
                {" "}for it.
              </h2>
            </motion.div>

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
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed flex-1">"{t.body}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.tint} flex items-center justify-center text-black font-bold flex-shrink-0`}
                    >
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
         *  PRICING
         * ───────────────────────────────────────────────────────── */}
        <section id="pricing" className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-violet-400 mb-3">
                Pricing
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Simple, honest{" "}
                <span className="bg-gradient-to-r from-violet-300 to-purple-500 bg-clip-text text-transparent">
                  pricing.
                </span>
              </h2>
              <p className="mt-5 text-gray-400 max-w-2xl mx-auto text-lg">
                No hidden fees. No per-feature charges. Cancel anytime.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricing.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl p-8 flex flex-col ${
                    p.highlight
                      ? "bg-gradient-to-b from-yellow-500/20 via-amber-500/10 to-transparent border-2 border-yellow-400/40 shadow-[0_20px_60px_rgba(250,204,21,0.2)] scale-105"
                      : "bg-white/[0.04] border border-white/10"
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold tracking-wider">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{p.tagline}</p>

                  <div className="my-6">
                    <span className="text-5xl font-black">{p.price}</span>
                    <span className="text-gray-500 ml-1">{p.period}</span>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-400" strokeWidth={3} />
                        </div>
                        <span className="text-gray-300">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={ctaHref}
                    className={`mt-8 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      p.highlight
                        ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:shadow-yellow-500/50"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    {p.cta}
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  INTEGRATIONS
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-xs uppercase tracking-widest text-orange-400 mb-3">
                Plays well with others
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Connects to{" "}
                <span className="bg-gradient-to-r from-orange-300 to-red-500 bg-clip-text text-transparent">
                  every tool
                </span>{" "}
                you already use.
              </h2>
            </motion.div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { icon: MessageSquare, name: "WhatsApp" },
                { icon: Mail, name: "Gmail" },
                { icon: IndianRupee, name: "Razorpay" },
                { icon: Cloud, name: "Drive" },
                { icon: Database, name: "Excel" },
                { icon: Phone, name: "Exotel" },
                { icon: Activity, name: "Slack" },
                { icon: GitBranch, name: "Zapier" },
                { icon: Layers, name: "Tally" },
                { icon: Bell, name: "SMS" },
                { icon: FileCheck2, name: "DigiLocker" },
                { icon: Sun, name: "Solar APIs" },
              ].map((tool, i) => (
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
                  <span className="text-[10px] text-gray-500">{tool.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  FAQ
         * ───────────────────────────────────────────────────────── */}
        <section id="faq" className="px-6 py-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs uppercase tracking-widest text-sky-400 mb-3">
                FAQ
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Questions, answered.
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((f, i) => (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-semibold text-base md:text-lg">{f.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-yellow-400 flex-shrink-0 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
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
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  FINAL CTA
         * ───────────────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-sky-500/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(250,204,21,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(56,189,248,0.2),transparent_50%)]" />

            <div className="relative border border-white/10 rounded-3xl p-12 md:p-20 text-center backdrop-blur">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-6">
                <Clock size={12} className="text-yellow-400" />
                <span className="text-[10px] tracking-widest uppercase text-yellow-300 font-bold">
                  Setup in 5 minutes
                </span>
              </div>

              <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                Ready to{" "}
                <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  power up
                </span>
                <br />
                your sales?
              </h2>
              <p className="text-gray-300 mt-6 mb-10 max-w-xl mx-auto text-lg">
                Join 500+ solar businesses already closing more deals with CRM Suite.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={ctaHref}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-[0_8px_30px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform"
                >
                  Start free trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="mailto:hello@advance-solar.in"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Talk to sales
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─────────────────────────────────────────────────────────
         *  FOOTER
         * ───────────────────────────────────────────────────────── */}
        <footer className="px-6 pt-20 pb-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-5 gap-10 mb-16">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center"
                    style={{ boxShadow: "0 0 20px rgba(250,204,21,0.4)" }}
                  >
                    <Zap size={20} className="text-black fill-black" />
                  </div>
                  <span className="font-bold tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
                    CRM SUITE
                  </span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                  The CRM built for Indian rooftop solar businesses. From first
                  lead to final invoice — one clean pipeline.
                </p>

                <div className="flex gap-3 mt-6">
                  <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="#">
                    <Twitter size={16} className="text-gray-400" />
                  </a>
                  <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="#">
                    <Linkedin size={16} className="text-gray-400" />
                  </a>
                  <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="#">
                    <Mail size={16} className="text-gray-400" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  Product
                </p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-gray-400 hover:text-yellow-300">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-yellow-300">Pricing</a></li>
                  <li><a href="#mobile" className="text-gray-400 hover:text-yellow-300">Mobile app</a></li>
                  <li><a href="#how" className="text-gray-400 hover:text-yellow-300">How it works</a></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-yellow-300">Sign in</Link></li>
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  Company
                </p>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-yellow-300">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-yellow-300">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-yellow-300">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-yellow-300">Press</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-yellow-300">Contact</a></li>
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  Contact
                </p>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <MapPin size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Sector 18, Gurugram<br />Haryana 122015, India</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-yellow-400 flex-shrink-0" />
                    <span>+91 98XX XX XXXX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-yellow-400 flex-shrink-0" />
                    <span>hello@advance-solar.in</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <p>© {new Date().getFullYear()} CRM Suite · Advance International Solar. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-yellow-300 transition">Privacy</a>
                <a href="#" className="hover:text-yellow-300 transition">Terms</a>
                <a href="#" className="hover:text-yellow-300 transition">Security</a>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
