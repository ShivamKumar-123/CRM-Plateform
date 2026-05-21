import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Twitter, Linkedin, Mail, MapPin, Phone, Menu, X,
  Sparkles, ArrowRight, Github, Youtube, Instagram, ShieldCheck,
  Send, Check, Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const NAV_LINKS = [
  { label: "Features",   to: "/features" },
  { label: "Industries", to: "/industries" },
  { label: "Pricing",    to: "/pricing" },
  { label: "About",      to: "/about" },
  { label: "Contact",    to: "/contact" },
];

const SOCIAL = [
  { icon: Twitter,   href: "#",                          label: "Twitter / X" },
  { icon: Linkedin,  href: "#",                          label: "LinkedIn" },
  { icon: Github,    href: "#",                          label: "GitHub" },
  { icon: Youtube,   href: "#",                          label: "YouTube" },
  { icon: Instagram, href: "#",                          label: "Instagram" },
  { icon: Mail,      href: "mailto:hello@advance-solar.in", label: "Email" },
];

const TRUST_BADGES = [
  { label: "SOC 2", sub: "Type II ready" },
  { label: "GDPR", sub: "Compliant" },
  { label: "ISO 27001", sub: "In progress" },
  { label: "DPDP", sub: "India 2023" },
];

export default function MarketingLayout() {
  const { isAuthenticated } = useAuth();
  const ctaHref  = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : "Get Started";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-yellow-400/30">
      {/* ── Ambient background — shared across all marketing pages ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-yellow-500/15 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-sky-500/15 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl animate-pulse-glow" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Announcement bar ── */}
      <AnnouncementBar />

      {/* ── Sticky Nav ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-2xl border-b border-yellow-500/15 shadow-[0_2px_30px_rgba(250,204,21,0.06)]"
            : "bg-transparent"
        }`}
      >
        {/* Animated top hairline */}
        <div
          className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                style={{ boxShadow: "0 0 28px rgba(250,204,21,0.6), inset 0 1px 0 rgba(255,255,255,0.4)" }}
              >
                <Zap size={20} className="text-black fill-black" />
              </div>
              {/* Pulsing glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-yellow-400/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black tracking-[0.22em] text-sm bg-gradient-to-r from-yellow-200 via-white to-sky-200 bg-clip-text text-transparent">
                CRM SUITE
              </span>
              <span className="text-[9px] tracking-[0.3em] text-gray-500 mt-1 hidden sm:block">
                ENTERPRISE · INDIA
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 rounded-full text-sm transition-all ${
                    isActive
                      ? "text-black font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 shadow-[0_4px_20px_rgba(250,204,21,0.4)] -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign in
            </Link>

            <Link
              to={ctaHref}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-black text-sm font-bold shadow-[0_8px_30px_rgba(250,204,21,0.35)] hover:shadow-[0_8px_40px_rgba(250,204,21,0.6)] hover:scale-[1.04] transition-all group"
            >
              {ctaLabel}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Animated hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="lg:hidden w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 hover:border-yellow-400/40 hover:bg-yellow-400/10 flex items-center justify-center text-white transition-all"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 top-[var(--nav-h,72px)] bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden relative z-50 bg-black/95 backdrop-blur-2xl border-t border-yellow-500/15"
              >
                <div className="px-6 py-5 space-y-1.5">
                  {NAV_LINKS.map((l, i) => (
                    <motion.div
                      key={l.to}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <NavLink
                        to={l.to}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-yellow-400/15 to-amber-400/5 text-yellow-300 border border-yellow-400/30"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <span>{l.label}</span>
                        <ArrowRight size={14} className="opacity-50" />
                      </NavLink>
                    </motion.div>
                  ))}
                  <div className="pt-3 grid gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center text-sm text-gray-200 hover:bg-white/10"
                    >
                      Sign in
                    </Link>
                    <Link
                      to={ctaHref}
                      className="px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-black text-sm font-bold shadow-lg shadow-yellow-500/30 text-center inline-flex items-center justify-center gap-2"
                    >
                      {ctaLabel} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ── */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-20 border-t border-white/5">
        {/* Gradient hairline above footer */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

        {/* Newsletter row */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.04] via-transparent to-sky-500/[0.04]" />
          <div className="relative max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center border-b border-white/5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-400 font-bold mb-3 inline-flex items-center gap-2">
                <Sparkles size={12} /> Newsletter
              </p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                Get monthly CRM tips, <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-yellow-300 to-sky-300 bg-clip-text text-transparent">
                  delivered in 2 minutes.
                </span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                No spam. Unsubscribe in one click. Read by 8,000+ sales leaders.
              </p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmailSubscribed(true); setTimeout(() => setEmailSubscribed(false), 3000); }}
              className="flex gap-2"
            >
              <input
                required
                type="email"
                placeholder="you@company.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-yellow-400/40 focus:bg-white/[0.08] outline-none text-sm placeholder:text-gray-500 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-yellow-500/30 hover:scale-[1.02] transition inline-flex items-center gap-2"
              >
                {emailSubscribed ? (
                  <><Check size={14} /> Subscribed!</>
                ) : (
                  <>Subscribe <Send size={13} /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-12 gap-10 mb-14">
            {/* Brand col */}
            <div className="md:col-span-4">
              <Link to="/" className="inline-flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/40"
                  style={{ boxShadow: "0 0 24px rgba(250,204,21,0.5)" }}
                >
                  <Zap size={20} className="text-black fill-black" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black tracking-[0.22em] text-sm bg-gradient-to-r from-yellow-200 via-white to-sky-200 bg-clip-text text-transparent">
                    CRM SUITE
                  </span>
                  <span className="text-[9px] tracking-[0.3em] text-gray-500 mt-1">
                    ENTERPRISE · INDIA
                  </span>
                </div>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-6">
                Industry-agnostic CRM built in India for Indian businesses.
                Multi-tenant, configurable, mobile-first. From first lead to
                final invoice — one clean pipeline.
              </p>

              {/* Social rail */}
              <div className="flex gap-2 mb-6">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-yellow-400/15 border border-white/10 hover:border-yellow-400/40 flex items-center justify-center text-gray-400 hover:text-yellow-300 hover:-translate-y-0.5 transition-all"
                  >
                    <s.icon size={14} />
                  </a>
                ))}
              </div>

              {/* Locale + status row */}
              <div className="flex items-center gap-3 text-xs">
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20">
                  <Globe size={12} /> English
                </button>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
                    <span className="relative rounded-full w-1.5 h-1.5 bg-emerald-400" />
                  </span>
                  All systems operational
                </span>
              </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">Product</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/industries" className="text-gray-400 hover:text-white transition">Industries</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Changelog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">Company</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Press kit</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">Resources</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Docs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">API reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Status</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-400 mb-4 font-bold">Contact</p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">Sector 18, Gurugram<br />Haryana 122015, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-yellow-400 flex-shrink-0" />
                  <a href="tel:+919800000000" className="hover:text-white transition">+91 98XX XX XXXX</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-yellow-400 flex-shrink-0" />
                  <a href="mailto:hello@advance-solar.in" className="hover:text-white transition truncate">
                    hello@advance-solar.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Trust badges row */}
          <div className="border-y border-white/5 py-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-bold inline-flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-400" />
                Compliance &amp; certifications
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {TRUST_BADGES.map((b) => (
                  <div
                    key={b.label}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition"
                  >
                    <div className="text-xs font-bold text-gray-200">{b.label}</div>
                    <div className="text-[9px] text-gray-500">{b.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom legal bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} CRM Suite · Advance International Solar. All rights reserved.</p>
            <div className="flex items-center gap-5 flex-wrap">
              <a href="#" className="hover:text-yellow-300 transition">Privacy</a>
              <a href="#" className="hover:text-yellow-300 transition">Terms</a>
              <a href="#" className="hover:text-yellow-300 transition">Security</a>
              <a href="#" className="hover:text-yellow-300 transition">Cookies</a>
              <a href="#" className="hover:text-yellow-300 transition">DPA</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Slim announcement bar above the nav. Dismissible. Three rotating messages.
 */
function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [idx, setIdx] = useState(0);
  const messages = [
    { emoji: "🎉", text: "Phase 8 just shipped — AI assistant, helpdesk, customer portal, and 8 more.", cta: { label: "What's new", href: "/features" } },
    { emoji: "🚀", text: "Save 20% with annual billing — limited-time offer.", cta: { label: "See pricing", href: "/pricing" } },
    { emoji: "📱", text: "Mobile app now on iOS + Android via Expo.", cta: { label: "Learn more", href: "/features" } },
  ];

  useEffect(() => {
    if (dismissed) return undefined;
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 6000);
    return () => clearInterval(t);
  }, [dismissed, messages.length]);

  if (dismissed) return null;
  const m = messages[idx];

  return (
    <div className="relative z-50 bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-sky-500/15 border-b border-yellow-500/20 backdrop-blur-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-3 text-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 min-w-0 flex-1"
          >
            <span aria-hidden>{m.emoji}</span>
            <span className="text-gray-200 truncate">{m.text}</span>
            <Link
              to={m.cta.href}
              className="hidden sm:inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200 font-semibold whitespace-nowrap"
            >
              {m.cta.label} <ArrowRight size={11} />
            </Link>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="text-gray-400 hover:text-white p-1 rounded transition"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
