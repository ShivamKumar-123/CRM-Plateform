import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { PageHero, SectionHeading, CTABanner } from "./_components.jsx";

const plans = [
  {
    slug: "free",
    name: "Free",
    tagline: "For solo users + evaluation",
    price: 0,
    period: "/forever",
    features: [
      "Up to 100 leads",
      "1 user account",
      "Basic dashboard",
      "Mobile app access",
      "Default pipelines",
      "Email support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "Most popular for growing teams",
    price: 2499,
    period: "/month",
    features: [
      "Unlimited leads & deals",
      "Up to 10 users",
      "Custom fields engine (11 types)",
      "Lead scoring + priority badges",
      "Sales targets + leaderboard",
      "Drag-drop pipelines",
      "Industry templates (7 presets)",
      "Notifications + audit logs",
      "TOTP 2FA + role-based access",
      "Priority email + chat support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "For multi-branch organizations",
    price: 9999,
    period: "/month",
    features: [
      "Everything in Pro, plus:",
      "Unlimited users",
      "Multi-tenant isolation",
      "White-label branding per org",
      "Dedicated success manager",
      "Custom integrations",
      "Priority phone support",
      "99.9% uptime SLA",
      "On-premise option available",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

const comparison = [
  { feature: "Leads stored",           free: "100",          pro: "Unlimited",  enterprise: "Unlimited" },
  { feature: "Users",                  free: "1",            pro: "10",         enterprise: "Unlimited" },
  { feature: "Storage",                free: "100 MB",       pro: "5 GB",       enterprise: "Custom" },
  { feature: "Mobile app",             free: true,           pro: true,         enterprise: true },
  { feature: "Configurable pipelines", free: true,           pro: true,         enterprise: true },
  { feature: "Custom fields engine",   free: false,          pro: true,         enterprise: true },
  { feature: "Lead scoring",           free: false,          pro: true,         enterprise: true },
  { feature: "Sales targets + leaderboard", free: false,     pro: true,         enterprise: true },
  { feature: "Industry templates",     free: "Default only", pro: "All 7",      enterprise: "All 7 + custom" },
  { feature: "Drag-drop pipelines",    free: false,          pro: true,         enterprise: true },
  { feature: "Audit logs",             free: false,          pro: "90 days",    enterprise: "Unlimited" },
  { feature: "Notifications",          free: true,           pro: true,         enterprise: true },
  { feature: "2FA (TOTP + backup codes)", free: true,        pro: true,         enterprise: true },
  { feature: "Role-based access (8 roles)", free: false,     pro: true,         enterprise: true },
  { feature: "WhatsApp integration",   free: false,          pro: "Coming soon", enterprise: "Coming soon" },
  { feature: "White-label branding",   free: false,          pro: false,        enterprise: true },
  { feature: "Multi-tenant isolation", free: false,          pro: false,        enterprise: true },
  { feature: "Support",                free: "Email",        pro: "Email + chat", enterprise: "Phone + dedicated CSM" },
  { feature: "SLA",                    free: "Best effort",  pro: "24h response", enterprise: "99.9% uptime, 1h response" },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade anytime — proration is automatic. Downgrade takes effect at the end of the current billing cycle.",
  },
  {
    q: "Do you offer annual billing discounts?",
    a: "Yes — pay annually and get 2 months free (effectively 16% off). Contact sales for enterprise yearly contracts.",
  },
  {
    q: "What happens after the 14-day Pro trial?",
    a: "Your account drops to the Free plan. All your data is preserved. You can upgrade back to Pro anytime to unlock the features again.",
  },
  {
    q: "Is GST included in the prices?",
    a: "Listed prices are excluding 18% GST. Indian businesses with a valid GSTIN receive a tax invoice and can claim input credit.",
  },
  {
    q: "Can I self-host CRM Suite?",
    a: "Enterprise plan includes an on-premise option — we deliver a Docker bundle + Kubernetes manifests + an annual support contract. Contact sales for pricing.",
  },
  {
    q: "Do you offer a refund policy?",
    a: "Yes — 14-day money-back guarantee on all paid plans. No questions asked, full refund processed within 5 business days.",
  },
];

function Cell({ value }) {
  if (value === true)  return <Check size={18} className="text-emerald-400 mx-auto" />;
  if (value === false) return <X size={18} className="text-gray-600 mx-auto" />;
  return <span className="text-sm text-gray-300">{value}</span>;
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, honest"
        accent="pricing."
        subtitle="No hidden fees. No per-feature charges. Cancel anytime. 14-day money-back guarantee."
      />

      {/* ── Billing toggle ── */}
      <div className="flex justify-center px-6 mb-10">
        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              !yearly ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >Monthly</button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
              yearly ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px]">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* ── Pricing tiers ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => {
            const displayPrice = yearly && p.price > 0 ? Math.round(p.price * 10) : p.price;
            const displayPeriod = yearly && p.price > 0 ? "/year" : p.period;
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  p.highlight
                    ? "bg-gradient-to-b from-yellow-500/20 via-amber-500/10 to-transparent border-2 border-yellow-400/40 shadow-[0_20px_60px_rgba(250,204,21,0.2)] md:scale-105 z-10"
                    : "bg-white/[0.04] border border-white/10"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold tracking-wider inline-flex items-center gap-1">
                    <Sparkles size={11} /> MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-1 mb-6">{p.tagline}</p>

                <div className="my-2">
                  <span className="text-5xl font-black">
                    {displayPrice === 0 ? "₹0" : `₹${displayPrice.toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-gray-500 ml-1">{displayPeriod}</span>
                </div>

                <ul className="space-y-3 flex-1 my-6">
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
                  to={p.slug === "enterprise" ? "/contact" : "/login"}
                  className={`mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    p.highlight
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:shadow-yellow-500/50"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {p.cta} <ArrowRight size={16} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Side by side"
            title="Compare all"
            accent="plans"
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 to-blue-500"
          />

          <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-400 font-bold">Feature</th>
                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-400 font-bold">Free</th>
                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-yellow-300 font-bold">Pro</th>
                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-400 font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={`border-t border-white/5 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
                    <td className="px-6 py-4 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><Cell value={row.free} /></td>
                    <td className="px-6 py-4 text-center bg-yellow-400/5"><Cell value={row.pro} /></td>
                    <td className="px-6 py-4 text-center"><Cell value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions about"
            accent="pricing."
            eyebrowColor="text-pink-400"
            accentColor="from-pink-300 to-rose-500"
          />

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
        </div>
      </section>

      <CTABanner />
    </>
  );
}
