import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Workflow,
  BarChart3,
  Check,
  Star,
  Github,
  PlayCircle,
  Calendar, Rocket, Building, Send,
  Headphones, BookOpen, FileInput, PenTool, KeyRound,
  MessageSquare, IndianRupee, Bell, LayoutDashboard,
  Filter, Users2, Database, Cloud, Globe, Puzzle, Monitor, Cpu,
  GitBranch, Target, Trophy, Layers,
  Menu, X, Twitter, Linkedin, Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import CTAModal from "../components/CTAModal.jsx";
import Particles from "../components/Particles.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" },
  }),
};

function Aurora() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-yellow-400/20 blur-[120px] animate-float-slow" />
      <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] rounded-full bg-fuchsia-500/15 blur-[140px] animate-float-slower" />
      <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[400px] rounded-full bg-sky-500/15 blur-[150px] animate-pulse-glow" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
    </div>
  );
}

function Nav({ user }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#features");
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#workflow", label: "Workflow" },
    { href: "#pricing",  label: "Pricing" },
    { href: "#faq",      label: "FAQ" },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      // Lightweight scroll-spy.
      const offsets = navLinks.map(l => {
        const el = document.querySelector(l.href);
        return el ? { hash: l.href, top: el.getBoundingClientRect().top } : null;
      }).filter(Boolean);
      const current = offsets.filter(o => o.top <= 140).slice(-1)[0];
      if (current) setActiveHash(current.hash);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-2xl bg-black/60 border-b border-yellow-500/15 shadow-[0_2px_30px_rgba(250,204,21,0.05)]"
            : "bg-transparent"
        }`}
      >
        {/* Animated top hairline */}
        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                style={{ boxShadow: "0 0 24px rgba(250,204,21,0.55), inset 0 1px 0 rgba(255,255,255,0.35)" }}
              >
                <Zap size={17} className="text-black fill-black" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-yellow-400/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <div className="leading-none">
              <div className="font-black tracking-wider text-white">
                CRM<span className="text-yellow-400">.</span>demo
              </div>
              <div className="text-[9px] tracking-[0.25em] text-gray-500 mt-1 hidden sm:block">
                LIVE · IN BROWSER
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            {navLinks.map((l) => {
              const isActive = activeHash === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-1.5 rounded-full text-sm transition-all ${
                    isActive ? "text-black font-semibold" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="demoNavPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 shadow-[0_4px_20px_rgba(250,204,21,0.4)] -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    />
                  )}
                  {l.label}
                </a>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-black font-bold text-sm shadow-[0_8px_30px_rgba(250,204,21,0.35)] hover:shadow-[0_8px_40px_rgba(250,204,21,0.6)] hover:scale-[1.04] transition-all group"
              >
                Open App
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-black font-bold text-sm shadow-[0_8px_30px_rgba(250,204,21,0.35)] hover:shadow-[0_8px_40px_rgba(250,204,21,0.6)] hover:scale-[1.04] transition-all group"
                >
                  Try Demo
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="md:hidden w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 hover:border-yellow-400/40 hover:bg-yellow-400/10 flex items-center justify-center text-white transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X size={17} />
                  </motion.div>
                ) : (
                  <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Menu size={17} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-yellow-500/15"
            >
              <div className="px-6 py-4 space-y-1.5">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    {l.label}
                    <ArrowRight size={13} className="opacity-50" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-6">
      <Aurora />
      <motion.div style={{ y }} className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-yellow-300 mb-6"
          >
            <Sparkles size={14} />
            <span>AI · Helpdesk · Automation · Portal · 5 industries · live in browser</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            The complete CRM that
            <br />
            <span className="gradient-text">runs in your browser.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed"
          >
            Leads, deals, customers, <b className="text-white">AI assistant</b>, <b className="text-white">helpdesk</b>,
            <b className="text-white"> automation</b>, <b className="text-white">customer portal</b>, <b className="text-white">analytics</b>
            — 14 features layered on top of the live CRM, running locally on your device. Your data stays yours.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-xl shadow-yellow-500/30 hover:scale-105 transition"
            >
              Start Free Demo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            >
              <PlayCircle size={18} />
              Sign in as demo@demo.com
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex items-center gap-6 text-xs text-gray-500"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>100% client-side</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>No tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              <span>Open-source friendly</span>
            </div>
          </motion.div>
        </div>

        {/* Mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: -5 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative"
          style={{ perspective: 1200 }}
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-yellow-500/20 via-fuchsia-500/10 to-sky-500/20 rounded-3xl blur-2xl animate-pulse-glow" />
          <div className="relative glass-strong rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="ml-3 text-xs text-gray-500">crm.demo / dashboard</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Leads", value: "248", trend: "+12%" },
                { label: "Open Deals", value: "37", trend: "+5%" },
                { label: "Pipeline", value: "₹4.2 Cr", trend: "+22%" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-xl bg-white/5 border border-white/10 p-3"
                >
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider">{s.label}</div>
                  <div className="text-lg font-bold mt-1">{s.value}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">{s.trend}</div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Pipeline by stage</span>
                <span className="text-[10px] text-yellow-400">Live</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { stage: "Qualified", width: 92, color: "from-yellow-400 to-amber-500" },
                  { stage: "Proposal", width: 74, color: "from-fuchsia-400 to-pink-500" },
                  { stage: "Negotiation", width: 58, color: "from-sky-400 to-blue-500" },
                  { stage: "Closed Won", width: 41, color: "from-emerald-400 to-green-500" },
                ].map((b, i) => (
                  <div key={b.stage}>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>{b.stage}</span>
                      <span>{b.width}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.width}%` }}
                        transition={{ delay: 0.7 + i * 0.15, duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r ${b.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "14+", label: "Demo-only features layered on top" },
    { value: "5", label: "Industry presets · switch live" },
    { value: "0", label: "Backend servers · 100% localStorage" },
    { value: "<5s", label: "From landing → working dashboard" },
  ];
  return (
    <section className="py-20 px-6 border-y border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold gradient-text">{s.value}</div>
            <div className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Users, color: "from-yellow-400 to-amber-500", title: "Lead Pipeline", body: "Capture, score and qualify. Auto-distribution across reps (5 strategies). HOT/WARM/COLD priority." },
    { icon: Briefcase, color: "from-fuchsia-400 to-pink-500", title: "Deal Kanban", body: "Drag-and-drop pipelines. Track every deal from qualification to closed-won with full history." },
    { icon: Sparkles, color: "from-violet-400 to-purple-500", title: "AI Assistant", body: "Lead summaries, follow-up drafts, deal-risk scoring, email drafting, meeting summaries — chat interface." },
    { icon: Workflow, color: "from-emerald-400 to-green-500", title: "Automation Engine", body: "Trigger → action chains. 7 action types — create task · assign · notify · update score · move stage · webhook · WhatsApp." },
    { icon: Headphones, color: "from-cyan-400 to-blue-500", title: "Helpdesk & SLA", body: "Tickets with SLA timers, departments, escalations, canned replies, internal notes + customer replies." },
    { icon: KeyRound, color: "from-orange-400 to-red-500", title: "Customer Portal", body: "Magic-link auth · customers self-serve tickets, invoices, documents, deals. No password needed." },
    { icon: BookOpen, color: "from-amber-400 to-yellow-500", title: "Knowledge Base", body: "Markdown article CMS · categories · tags · search · voting · related-article suggestions." },
    { icon: FileInput, color: "from-sky-400 to-blue-500", title: "Form Builder", body: "Drag-drop public forms with 10 field types. Auto-create leads on submit. Embed anywhere." },
    { icon: PenTool, color: "from-rose-400 to-pink-500", title: "E-Signature", body: "Multi-signer chains · OTP verification · canvas signature pad · audit-stamped PDF." },
    { icon: MessageSquare, color: "from-emerald-400 to-green-500", title: "Real WhatsApp", body: "Meta Cloud API send · templates · media · webhook delivery status · incoming reply log." },
    { icon: IndianRupee, color: "from-yellow-400 to-amber-500", title: "Razorpay Billing", body: "Real checkout · signature verify · webhook · GST invoice PDF · subscription auto-renewals." },
    { icon: TrendingUp, color: "from-fuchsia-400 to-purple-500", title: "Advanced Analytics", body: "Revenue forecast · cohort · churn · funnel · executive summary — all with Recharts." },
    { icon: LayoutDashboard, color: "from-sky-400 to-blue-500", title: "Dashboard Builder", body: "Drag-resize widgets · save layouts · 6 widget types · per-user customization." },
    { icon: Filter, color: "from-orange-400 to-red-500", title: "Filter Builder + Views", body: "Nested AND/OR/NOT visual tree with 13 operators. Save filter combos as named views." },
    { icon: Database, color: "from-violet-400 to-purple-500", title: "Backups & Restore", body: "Encrypted snapshots covering 24 tables · scheduled retention · one-click restore." },
    { icon: Cloud, color: "from-cyan-400 to-blue-500", title: "Cloud Storage", body: "Connect Google Drive · Dropbox · OneDrive via OAuth. Per-user tokens with auto-refresh." },
    { icon: ShieldCheck, color: "from-emerald-400 to-green-500", title: "Enterprise Security", body: "JWT · TOTP 2FA · session/device revoke · 8 RBAC roles · field-level audit logs · approval workflows." },
    { icon: Globe, color: "from-amber-400 to-yellow-500", title: "Multi-language", body: "English + Hindi out of the box. Locale switcher in topbar. Dictionary-driven, easy to extend." },
  ];

  return (
    <section id="features" className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-300 mb-4">
            <Sparkles size={12} /> 18 features and counting
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            One CRM. <span className="gradient-text">Every workflow.</span>
          </h2>
          <p className="text-gray-400 mt-4">
            From the first lead capture to the signed contract, the support ticket, the cohort report — built for teams that hate jumping between tools.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 hover:border-white/20 transition"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon size={20} className="text-black" />
              </div>
              <h3 className="font-semibold text-lg text-white">{f.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoExclusives() {
  const items = [
    { icon: Bell,             title: "Fake real-time notifications",  body: "Auto-generates one every 20-40 seconds with sound ping. Mark-read, mark-all, clear all." },
    { icon: TrendingUp,       title: "Animated KPI counters",         body: "Smooth 0→value spring animations on every KPI card. Triggers on enter-view." },
    { icon: Workflow,         title: "Live activity ticker",          body: "Floating bottom-left widget spawns industry-flavored events every 6-12s. Pause/resume." },
    { icon: Sparkles,         title: "5 industry presets",            body: "Solar · Real Estate · Healthcare · Logistics · Insurance — switch live, repopulates every module." },
    { icon: Trophy,           title: "Sales leaderboard",             body: "Top-5 reps with gold/silver/bronze medals + animated revenue bars + conversion rates." },
    { icon: PlayCircle,       title: "Presentation mode",             body: "Fullscreen with spotlight vignette + keyboard nav (←/→/Esc) + auto-rotate routes." },
    { icon: LayoutDashboard,  title: "Command center",                body: "One-click reset · industry switch · generate leads · simulate activity · toggle modes." },
    { icon: Sparkles,         title: "AI demo assistant",             body: "Floating sparkle bubble with route-aware tips. Auto-rotates every 8 seconds." },
  ];

  return (
    <section className="py-28 px-6 relative">
      <Particles density={20} />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-400/10 border border-fuchsia-400/20 text-xs text-fuchsia-300 mb-4">
            <Sparkles size={12} /> Demo-only enhancements
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Investor-ready <span className="gradient-text">showcase polish.</span>
          </h2>
          <p className="text-gray-400 mt-4">
            14 demo-specific features layered on top of the real CRM — perfect for client demos, investor pitches, and offline marketing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl p-5 hover:border-fuchsia-400/30 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center mb-3">
                <f.icon size={16} className="text-black" />
              </div>
              <h3 className="font-semibold text-sm text-white">{f.title}</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow_() {
  const steps = [
    { num: "01", title: "Sign up in 5 seconds", body: "No email verification, no credit card. Just pick an email and password — it's stored on your device." },
    { num: "02", title: "Explore pre-seeded data", body: "Jump straight into a fully populated CRM. Leads, deals, customers — all ready to play with." },
    { num: "03", title: "Add, edit, delete freely", body: "Every change persists in localStorage. Refresh the page — your changes are still there." },
    { num: "04", title: "Reset whenever", body: "One click and you're back to a fresh demo. Perfect for showing prospects, training reps, or testing flows." },
  ];

  return (
    <section id="workflow" className="py-28 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/[0.03] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How the <span className="gradient-text">demo works.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative glass rounded-2xl p-6"
            >
              <div className="text-5xl font-bold gradient-text opacity-60 mb-3">{s.num}</div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Demo", price: "Free", desc: "This very page.",
      features: ["18 feature modules", "5 industry presets", "AI assistant chat", "Reset anytime"],
      cta: "Try now", to: "/signup",
    },
    {
      name: "Pro", price: "₹2,499", suffix: "/mo", desc: "Real backend + team.",
      features: ["Helpdesk + customer portal", "Form builder + e-signature", "WhatsApp + Razorpay", "Push notifications", "Audit logs + 2FA"],
      cta: "Contact sales", to: "/signup", highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", desc: "Made for scale.",
      features: ["AI (OpenAI / Anthropic)", "Advanced analytics + dashboard builder", "Cloud storage + plugins", "Multi-tenant isolation", "Dedicated support · 99.9% SLA"],
      cta: "Get in touch", to: "/signup",
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simple <span className="gradient-text">honest pricing.</span>
          </h2>
          <p className="text-gray-400 mt-4">The demo is free forever. Plans below apply to the full hosted product.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                p.highlight
                  ? "bg-gradient-to-b from-yellow-400/10 to-transparent border-2 border-yellow-400/40"
                  : "glass"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
                  Most popular
                </div>
              )}
              <div className="text-sm text-gray-400">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                {p.suffix && <span className="text-sm text-gray-500">{p.suffix}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-2">{p.desc}</p>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={p.to}
                className={`mt-6 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                  p.highlight
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-[1.02]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { name: "Aakash Verma", role: "Sales Head, GreenWatt", body: "We replaced three different tools with this. The pipeline view alone saved my team 6 hours a week.", stars: 5 },
    { name: "Ritu Khanna", role: "Founder, BrightCare Clinics", body: "Tried six CRMs before settling here. Onboarding took 10 minutes — not 10 days.", stars: 5 },
    { name: "Sameer Joshi", role: "BD Manager, Patel Hospitals", body: "The lead scoring catches deals my reps would have missed. ROI was visible in the first month.", stars: 5 },
  ];
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Loved by <span className="gradient-text">growth teams.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {t.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: q.stars }).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">"{q.body}"</p>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="font-semibold text-sm">{q.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{q.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ onOpenCTA }) {
  const tiles = [
    { kind: "bookDemo", icon: Calendar, label: "Book live demo", color: "from-yellow-400 to-amber-500" },
    { kind: "fullPlatform", icon: Building, label: "Request full platform", color: "from-sky-400 to-blue-500" },
    { kind: "enterprise", icon: Rocket, label: "View enterprise features", color: "from-fuchsia-400 to-pink-500" },
    { kind: "trial", icon: Send, label: "Start free 14-day trial", color: "from-emerald-400 to-green-500" },
  ];
  return (
    <section className="py-28 px-6 relative">
      <Particles density={28} />
      <div className="max-w-5xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-fuchsia-500/10 to-sky-500/20 rounded-3xl blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative glass-strong rounded-3xl p-12 md:p-16 text-center"
        >
          <Sparkles size={32} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to take it for a spin?
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Try the live in-browser demo, or talk to our team about the full platform.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-xl shadow-yellow-500/30 hover:scale-105 transition"
          >
            Launch the demo
            <ArrowRight size={20} />
          </Link>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <motion.button
                key={t.kind}
                onClick={() => onOpenCTA(t.kind)}
                whileHover={{ y: -3 }}
                className="text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-yellow-400/30 transition"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-2`}>
                  <t.icon size={15} className="text-black" />
                </div>
                <div className="text-sm font-semibold">{t.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    Demo: [
      { label: "Features",  href: "#features" },
      { label: "Workflow",  href: "#workflow" },
      { label: "Pricing",   href: "#pricing" },
      { label: "FAQ",       href: "#faq" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "Reset data",    href: "#" },
      { label: "Architecture",  href: "#" },
      { label: "Changelog",     href: "#" },
    ],
    Platform: [
      { label: "Full CRM Suite", href: "#" },
      { label: "Mobile app",     href: "#" },
      { label: "Backend API",    href: "#" },
      { label: "Book a demo",    href: "#" },
    ],
  };

  return (
    <footer className="relative mt-20">
      {/* Gradient hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      {/* Aurora glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-yellow-500/[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-500/[0.04] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Top — brand + links */}
        <div className="grid md:grid-cols-12 gap-8 mb-12">
          {/* Brand col */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/40"
                  style={{ boxShadow: "0 0 20px rgba(250,204,21,0.45)" }}
                >
                  <Zap size={16} className="text-black fill-black" />
                </div>
              </div>
              <div className="leading-none">
                <div className="font-black tracking-wider text-white">
                  CRM<span className="text-yellow-400">.</span>demo
                </div>
                <div className="text-[9px] tracking-[0.25em] text-gray-500 mt-1">
                  LIVE · IN BROWSER
                </div>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              A fully client-side showcase of CRM Suite — runs in your browser with{" "}
              <code className="text-yellow-300 text-xs bg-white/5 px-1.5 py-0.5 rounded">localStorage</code>.
              Perfect for client demos, investor pitches, and offline marketing.
            </p>

            {/* Social rail */}
            <div className="flex gap-2 mt-5">
              {[
                { icon: Github,   label: "GitHub" },
                { icon: Twitter,  label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-yellow-400/15 border border-white/10 hover:border-yellow-400/40 flex items-center justify-center text-gray-400 hover:text-yellow-300 hover:-translate-y-0.5 transition-all"
                >
                  <s.icon size={14} />
                </a>
              ))}
            </div>

            {/* Status pill */}
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
                <span className="relative rounded-full w-1.5 h-1.5 bg-emerald-400" />
              </span>
              Demo running smoothly · no server needed
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">
                {title}
              </p>
              <ul className="space-y-2.5 text-sm">
                {items.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-gray-400 hover:text-white transition">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Build info */}
          <div className="md:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">
              Built with
            </p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>React 19</li>
              <li>Vite 7</li>
              <li>Tailwind 4</li>
              <li>Recharts 3</li>
              <li>Framer Motion</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="inline-flex items-center gap-1.5">
            © {new Date().getFullYear()} CRM Suite ·{" "}
            <span className="inline-flex items-center gap-1">
              built with <Heart size={11} className="text-pink-400 fill-pink-400" /> in India
            </span>
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <a href="#" className="hover:text-yellow-300 transition">Privacy</a>
            <a href="#" className="hover:text-yellow-300 transition">Terms</a>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={11} className="text-yellow-400" />
              v1.0 · 14 demo features
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [ctaKind, setCtaKind] = useState(null);
  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Nav user={user} />
      <Hero />
      <Stats />
      <Features />
      <DemoExclusives />
      <Workflow_ />
      <Pricing />
      <Testimonials />
      <CTA onOpenCTA={setCtaKind} />
      <Footer />
      <CTAModal open={!!ctaKind} kind={ctaKind || "bookDemo"} onClose={() => setCtaKind(null)} />
    </div>
  );
}
