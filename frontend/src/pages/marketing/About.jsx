import { motion } from "framer-motion";
import {
  Sparkles, Target, Heart, Zap, Globe, Lock, Users, Building2,
  Award, Lightbulb,
} from "lucide-react";
import { PageHero, SectionHeading, CTABanner } from "./_components.jsx";

const values = [
  { icon: Target,    title: "Built for India",       body: "Indian businesses face India-specific problems. We don't retrofit a US tool — we build for ₹, GSTIN, Aadhaar, UPI, and the realities of small-to-mid Indian sales teams." },
  { icon: Zap,       title: "Speed over scope",     body: "Ship the 80% solution this month, the perfect one never. We'd rather ship lead scoring today than spend 6 months building an ML model nobody asked for." },
  { icon: Heart,     title: "Honest pricing",      body: "No per-feature gotchas, no per-user upcharges at small scale, no surprise enterprise sales calls. The price you see is the price you pay." },
  { icon: Lock,      title: "Privacy first",       body: "Your data lives in Indian datacenters. We never sell to third parties. Multi-tenant isolation enforced at the database layer, not just the UI." },
  { icon: Globe,     title: "Industry-agnostic",   body: "Solar, real estate, healthcare, education — every industry runs the same loop. We make the platform configurable enough to serve all of them." },
  { icon: Lightbulb, title: "Code over slideware", body: "We don't pitch \"AI-powered\" buzzwords. We ship working features, document them in plain language, and link to the actual source files." },
];

const milestones = [
  { year: "2024", title: "Started as a solar CRM",
    body: "Built originally for Advance International Solar's own installer network in Rajasthan. Lead → site visit → quotation → installation tracking, with KW capacity and DCR/Non-DCR specifics." },
  { year: "Early 2026", title: "Multi-tenant transformation",
    body: "Refactored into a multi-tenant SaaS — Organization model, tenant scoping helpers, role-based access. Zero data loss for existing customers." },
  { year: "Mid 2026", title: "De-solar + configurable pipelines",
    body: "Removed hardcoded solar enums, added configurable Pipeline + PipelineStage models. CRM Suite became industry-agnostic." },
  { year: "Late 2026", title: "Platform extensions (Phase 3-5)",
    body: "Shipped 14 enterprise features: custom fields, drag-drop pipelines, 2FA, audit logs, notifications, lead scoring, sales targets, industry templates, call logs, saved views." },
  { year: "Today", title: "500+ Indian businesses",
    body: "Serving solar installers, real-estate brokerages, healthcare clinics, education franchises, insurance brokers, and logistics operators across India." },
];

const platformStats = [
  { label: "Indian businesses on platform", value: "500+" },
  { label: "Industries supported",          value: "12+" },
  { label: "API endpoints",                 value: "50+" },
  { label: "Hosted in",                     value: "🇮🇳 India" },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="A CRM built in India,"
        accent="for India."
        subtitle="We started as the in-house tool for a single solar installer in Rajasthan. Today we serve hundreds of Indian businesses across a dozen industries — and we still ship updates every week."
      />

      {/* ── Platform stats strip ── */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {platformStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-6 rounded-2xl bg-white/[0.04] border border-white/10"
            >
              <p className="text-3xl md:text-4xl font-black bg-gradient-to-br from-yellow-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-xs text-gray-400 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-4">Our mission</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Replace WhatsApp groups and Excel sheets with one{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              clean pipeline.
            </span>
          </h2>
          <p className="text-lg text-gray-400 mt-6 leading-relaxed max-w-3xl mx-auto">
            Every Indian SMB runs sales through a hairball of WhatsApp groups, half-filled Excel sheets,
            sticky notes, and tribal knowledge that walks out the door when someone quits.
            We think that's a problem worth solving — properly, affordably, and built for how Indian businesses actually work.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="What we believe"
            title="Six values that"
            accent="shape every decision."
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 to-blue-500"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4">
                  <v.icon size={20} className="text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            eyebrow="The journey"
            title="From solar tool to"
            accent="universal CRM."
            eyebrowColor="text-emerald-400"
            accentColor="from-emerald-300 to-green-500"
          />

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/40 via-sky-400/40 to-yellow-400/40" />

            <div className="space-y-12">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex md:items-center gap-6 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? "text-right" : "text-left"}`} />

                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 ring-4 ring-black z-10" />

                  <div className={`flex-1 ml-12 md:ml-0 ${i % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                    <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-1">{m.year}</p>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{m.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{m.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team placeholder ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/10 via-transparent to-sky-500/10 border border-white/10 p-10 md:p-14 text-center backdrop-blur">
          <Users size={36} className="mx-auto text-yellow-400 mb-4" />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            A small team, shipping fast.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We're a tight team of engineers, designers, and ex-sales-ops folks who've all worked at Indian SMBs
            and felt the pain firsthand. No outside funding, no growth-at-all-costs pressure — just a sustainable
            business serving customers we like.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
