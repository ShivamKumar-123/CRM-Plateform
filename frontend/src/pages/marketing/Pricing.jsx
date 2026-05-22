import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, ArrowRight, ChevronDown, Sparkles, Building2, Flame,
} from "lucide-react";
import { PageHero, SectionHeading, CTABanner } from "./_components.jsx";

/* ─────────────────────────────────────────────────────────
   PRICING DATA
   ───────────────────────────────────────────────────────── */

const SAAS_PLANS = [
  {
    slug: "demo",
    name: "Demo",
    price: "Free",
    desc: "Perfect for testing & live demos.",
    features: [
      "18 feature modules",
      "5 industry presets",
      "AI demo assistant",
      "Analytics dashboard",
      "Presentation mode",
      "Reset anytime",
    ],
    cta: "Try now",
    to: "/login",
  },
  {
    slug: "growth",
    name: "Growth",
    price: "₹4,999",
    period: "/month",
    desc: "For startups & growing businesses.",
    features: [
      "Lead & deal management",
      "Configurable pipelines",
      "Mobile app access",
      "Reports & analytics",
      "Import / export",
      "Notifications",
      "Role-based access",
      "Up to 5 users",
    ],
    cta: "Start trial",
    to: "/login",
  },
  {
    slug: "business",
    name: "Business",
    price: "₹9,999",
    period: "/month",
    desc: "Advanced operations & automation.",
    badge: "Most Popular",
    features: [
      "Everything in Growth",
      "Helpdesk + customer portal",
      "Custom fields engine",
      "Automation workflows",
      "Audit logs & 2FA",
      "Dashboard builder",
      "API access",
      "Up to 25 users",
    ],
    cta: "Start trial",
    to: "/login",
    highlight: true,
  },
];

const SOURCE_PLANS = [
  {
    name: "Starter License",
    price: "₹3L+",
    desc: "Get the full code, deploy it yourself.",
    features: [
      "Full source code",
      "Web + mobile apps",
      "Documentation",
      "Basic deployment support",
    ],
  },
  {
    name: "White-Label Commercial License",
    price: "₹8L – ₹15L",
    desc: "Resell under your own brand.",
    features: [
      "Full platform access",
      "White-label rights",
      "Custom branding",
      "Deployment assistance",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Exclusive Ownership / Acquisition",
    price: "₹25L – ₹50L+",
    desc: "Buy the entire platform outright.",
    features: [
      "Complete ownership transfer",
      "Full source code rights",
      "SaaS platform rights",
      "Mobile app rights",
      "Demo platform included",
      "Enterprise modules included",
    ],
  },
];

const ADDITIONAL_SERVICES = [
  { service: "White-label branding", price: "₹50k+" },
  { service: "Mobile app branding", price: "₹75k+" },
  { service: "Dedicated deployment", price: "₹1L+" },
  { service: "Custom integrations", price: "Custom" },
  { service: "WhatsApp setup", price: "₹25k+" },
  { service: "Annual support contract", price: "₹50k+ / year" },
];

const AI_PACK_FEATURES = [
  "AI lead summaries",
  "AI follow-up generation",
  "AI assistant chat",
  "AI deal risk analysis",
  "AI sales insights",
  "AI drafting tools",
  "Priority AI processing",
];

const ENTERPRISE_FEATURES_A = [
  "Multi-tenant deployment",
  "White-label branding",
  "Dedicated support",
  "SLA & onboarding",
];

const ENTERPRISE_FEATURES_B = [
  "Custom integrations",
  "Cloud storage integrations",
  "Plugin ecosystem",
  "Unlimited scale options",
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
    q: "Can I add the AI Intelligence Pack later?",
    a: "Absolutely. The AI pack is an add-on you can attach to any SaaS plan (Growth, Business, or Enterprise) at any time. It activates instantly on your next billing cycle.",
  },
  {
    q: "What is included in the Source Code / Platform Sale?",
    a: "You receive the full codebase (backend Django, frontend React, mobile React Native, demo). License terms vary — Starter is for internal use, White-Label allows resale under your brand, Exclusive Ownership transfers all rights to you.",
  },
  {
    q: "Is GST included in the prices?",
    a: "Listed prices are excluding 18% GST. Indian businesses with a valid GSTIN receive a tax invoice and can claim input credit.",
  },
  {
    q: "Can I self-host CRM Suite?",
    a: "Yes — Enterprise plan and all Source Code tiers include self-hosting. We deliver a Docker bundle + deployment guide + an optional annual support contract.",
  },
  {
    q: "Do you offer a refund policy?",
    a: "Yes — 14-day money-back guarantee on all SaaS plans. Source Code / Platform Sale agreements have custom refund terms negotiated case by case.",
  },
];

/* ─────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────── */

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, honest"
        accent="pricing."
        subtitle="Start free. Scale on a SaaS plan. Or own the entire platform — your choice."
      />

      {/* ── SaaS plans ── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {SAAS_PLANS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                p.highlight
                  ? "bg-gradient-to-b from-yellow-500/20 via-amber-500/10 to-transparent border-2 border-yellow-400/40 shadow-[0_20px_60px_rgba(250,204,21,0.2)] md:scale-105 z-10"
                  : "bg-white/[0.04] border border-white/10"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold tracking-wider inline-flex items-center gap-1">
                  <Sparkles size={11} /> ⭐ {p.badge.toUpperCase()}
                </div>
              )}
              <h3 className="text-2xl font-bold">{p.name}</h3>
              <p className="text-sm text-gray-400 mt-1 mb-6">{p.desc}</p>

              <div className="my-2 flex items-baseline gap-1">
                <span className="text-5xl font-black">{p.price}</span>
                {p.period && <span className="text-gray-500 ml-1">{p.period}</span>}
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
                to={p.to}
                className={`mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                  p.highlight
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:shadow-yellow-500/50"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                {p.cta} <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI Intelligence Pack (add-on) ── */}
      <section className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-3xl p-8 md:p-10 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-sky-500/10 border-2 border-violet-400/30 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-violet-400/20 border border-violet-400/40 text-[10px] font-bold uppercase tracking-wider text-violet-200">
                <Sparkles size={10} /> Add-on
              </div>
              <h3 className="text-3xl font-bold mt-2">AI Intelligence Pack</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-violet-300">+ ₹20,000</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                AI-powered sales intelligence on top of any SaaS plan.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold hover:scale-[1.02] transition"
              >
                Add to plan <ArrowRight size={14} />
              </Link>
            </div>
            <div className="md:col-span-2 grid sm:grid-cols-2 gap-2.5">
              {AI_PACK_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-gray-200">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={11} className="text-violet-300" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Enterprise band ── */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-3xl p-8 md:p-10 bg-gradient-to-r from-gray-900/80 via-black to-gray-900/80 border border-white/10"
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Enterprise</div>
              <div className="text-4xl font-black mt-1">Custom Pricing</div>
              <p className="text-sm text-gray-400 mt-3">
                Built for enterprise scale, multi-branch, and white-label SaaS.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition"
              >
                📞 Contact Sales <ArrowRight size={14} />
              </Link>
            </div>
            <ul className="md:col-span-1 grid grid-cols-1 gap-2 text-sm text-gray-300">
              {ENTERPRISE_FEATURES_A.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <ul className="md:col-span-1 grid grid-cols-1 gap-2 text-sm text-gray-300">
              {ENTERPRISE_FEATURES_B.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* ── Source Code / Platform Sale ── */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="💼 Source Code / Platform Sale"
            title="Own the"
            accent="entire platform"
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 to-blue-500"
          />
          <p className="text-center text-gray-400 -mt-4 mb-12 max-w-2xl mx-auto">
            Not a recurring fee — a one-time payment for the full codebase or exclusive rights.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {SOURCE_PLANS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-3xl p-7 flex flex-col ${
                  p.highlight
                    ? "bg-gradient-to-b from-sky-500/15 via-blue-500/8 to-transparent border-2 border-sky-400/40 shadow-[0_20px_60px_rgba(56,189,248,0.15)]"
                    : "bg-white/[0.04] border border-white/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-sky-400" />
                  <h4 className="text-lg font-bold">{p.name}</h4>
                </div>
                <div className="text-3xl md:text-4xl font-black mt-2">{p.price}</div>
                <p className="text-sm text-gray-400 mt-2 mb-5">{p.desc}</p>
                <ul className="space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-6 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
                    p.highlight
                      ? "bg-gradient-to-r from-sky-400 to-blue-500 text-black hover:scale-[1.02]"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  Enquire now <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Additional Services ── */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="🔥 Additional Services"
            title="A la carte"
            accent="add-ons"
            eyebrowColor="text-orange-400"
            accentColor="from-orange-300 to-red-500"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Service
                  </th>
                  <th className="text-right px-6 py-4 text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Pricing
                  </th>
                </tr>
              </thead>
              <tbody>
                {ADDITIONAL_SERVICES.map((s, i) => (
                  <tr
                    key={s.service}
                    className={`border-t border-white/5 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                  >
                    <td className="px-6 py-4 text-gray-200 inline-flex items-center gap-2">
                      <Flame size={12} className="text-orange-400" /> {s.service}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-yellow-300">{s.price}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
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
