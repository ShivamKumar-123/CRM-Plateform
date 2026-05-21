/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Clock } from "lucide-react";

/* ────────────────────────────────────────────────────────────────
 *  Shared motion variants
 * ──────────────────────────────────────────────────────────────── */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: "easeOut" },
  }),
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ────────────────────────────────────────────────────────────────
 *  Page hero — used at the top of every page except home
 * ──────────────────────────────────────────────────────────────── */
export function PageHero({ eyebrow, title, accent, subtitle, eyebrowColor = "text-yellow-300" }) {
  return (
    <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-20 text-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-yellow-400/30 mb-6 backdrop-blur"
      >
        <Sparkles size={14} className="text-yellow-400" />
        <span className={`text-xs tracking-widest uppercase font-bold ${eyebrowColor}`}>
          {eyebrow}
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]"
      >
        {title}{" "}
        {accent && (
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            {accent}
          </span>
        )}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Feature card — used in feature grids
 * ──────────────────────────────────────────────────────────────── */
export function FeatureCard({ icon: Icon, title, body, tint = "from-yellow-400 to-amber-500", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group relative p-7 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur hover:border-yellow-400/30 transition-all overflow-hidden"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${tint}`} />
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${tint} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-black" />
      </div>
      <h3 className="relative text-lg font-bold mb-2">{title}</h3>
      <p className="relative text-sm text-gray-400 leading-relaxed">{body}</p>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Final CTA banner — used at bottom of every page
 * ──────────────────────────────────────────────────────────────── */
export function CTABanner({ ctaHref = "/login", ctaLabel = "Start free trial" }) {
  return (
    <section className="px-6 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-sky-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(250,204,21,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(56,189,248,0.2),transparent_50%)]" />

        <div className="relative border border-white/10 rounded-3xl p-10 md:p-16 text-center backdrop-blur">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-5">
            <Clock size={12} className="text-yellow-400" />
            <span className="text-[10px] tracking-widest uppercase text-yellow-300 font-bold">
              Setup in 5 minutes
            </span>
          </div>

          <h2 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              power up
            </span>{" "}
            your sales?
          </h2>
          <p className="text-gray-300 mt-5 mb-8 max-w-xl mx-auto">
            Join 500+ Indian businesses across solar, real estate, healthcare and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaHref}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-[0_8px_30px_rgba(250,204,21,0.4)] hover:scale-105 transition-transform"
            >
              {ctaLabel}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Bullet list with checkmark icons
 * ──────────────────────────────────────────────────────────────── */
export function CheckList({ items, tint = "from-emerald-400 to-green-500" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <div className={`mt-0.5 w-6 h-6 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center flex-shrink-0`}>
            <Check size={14} className="text-black" strokeWidth={3} />
          </div>
          <span className="text-gray-300 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Section heading — used inside pages
 * ──────────────────────────────────────────────────────────────── */
export function SectionHeading({ eyebrow, title, accent, subtitle, accentColor = "from-yellow-300 via-amber-400 to-yellow-500", eyebrowColor = "text-yellow-400" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 md:mb-16"
    >
      {eyebrow && (
        <p className={`text-xs uppercase tracking-widest font-bold mb-3 ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-black tracking-tight">
        {title}{" "}
        {accent && (
          <span className={`bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
            {accent}
          </span>
        )}
      </h2>
      {subtitle && (
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
}
