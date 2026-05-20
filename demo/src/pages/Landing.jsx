import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import CTAModal from "../components/CTAModal.jsx";
import Particles from "../components/Particles.jsx";

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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-xl bg-black/70 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Zap size={18} className="text-black fill-black" />
          </div>
          <span className="font-bold tracking-wider text-white">CRM<span className="text-yellow-400">.</span>demo</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#workflow" className="hover:text-white transition">Workflow</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm hover:scale-105 transition"
            >
              Open App
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-white">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm hover:scale-105 transition shadow-lg shadow-yellow-500/20"
              >
                Try Demo
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
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
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
            <Zap size={13} className="text-black fill-black" />
          </div>
          <span>CRM Demo · Built with React + localStorage</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white flex items-center gap-1.5">
            <Github size={14} /> GitHub
          </a>
          <span>© {new Date().getFullYear()} CRM Suite</span>
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
