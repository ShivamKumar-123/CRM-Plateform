import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Twitter, Linkedin, Mail, MapPin, Phone, Menu, X,
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

export default function MarketingLayout() {
  const { isAuthenticated } = useAuth();
  const ctaHref  = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : "Sign In";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
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

      {/* ── Sticky Nav ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/70 backdrop-blur-xl border-b border-yellow-500/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative text-sm transition-colors ${
                    isActive ? "text-yellow-300" : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 to-sky-400"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
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
              className="hidden sm:inline px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-semibold shadow-lg hover:shadow-yellow-500/50 hover:scale-105 transition-all"
            >
              {ctaLabel}
            </Link>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-yellow-500/10 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-yellow-400/10 text-yellow-300 border border-yellow-400/30"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <Link
                  to={ctaHref}
                  className="block mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold text-center"
                >
                  {ctaLabel}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ── */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* ── Footer — shared across all pages ── */}
      <footer className="relative z-10 px-6 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-16">
            {/* Brand col */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center"
                  style={{ boxShadow: "0 0 20px rgba(250,204,21,0.4)" }}
                >
                  <Zap size={20} className="text-black fill-black" />
                </div>
                <span className="font-bold tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
                  CRM SUITE
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Industry-agnostic CRM built in India for Indian businesses.
                Multi-tenant, configurable, mobile-first. From first lead to
                final invoice — one clean pipeline.
              </p>

              <div className="flex gap-3 mt-6">
                <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="#" aria-label="Twitter">
                  <Twitter size={16} className="text-gray-400" />
                </a>
                <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="#" aria-label="LinkedIn">
                  <Linkedin size={16} className="text-gray-400" />
                </a>
                <a className="w-9 h-9 rounded-lg bg-white/5 hover:bg-yellow-400/20 border border-white/10 flex items-center justify-center transition-colors" href="mailto:hello@advance-solar.in" aria-label="Email">
                  <Mail size={16} className="text-gray-400" />
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="text-gray-400 hover:text-yellow-300">Features</Link></li>
                <li><Link to="/industries" className="text-gray-400 hover:text-yellow-300">Industries</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-yellow-300">Pricing</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-yellow-300">Sign in</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-400 hover:text-yellow-300">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-yellow-300">Contact</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-300">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yellow-300">Blog</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">Contact</p>
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
                  <a href="mailto:hello@advance-solar.in" className="hover:text-yellow-300">
                    hello@advance-solar.in
                  </a>
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
  );
}
