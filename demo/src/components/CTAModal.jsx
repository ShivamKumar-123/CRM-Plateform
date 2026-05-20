import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Calendar, Rocket, Building, Send } from "lucide-react";

const PRESETS = {
  bookDemo: {
    title: "Book a live demo",
    subtitle: "30-minute walkthrough with our solutions team.",
    icon: Calendar,
    accent: "from-yellow-400 to-amber-500",
    cta: "Request slot",
    calendlyHint: "calendly.com/your-team/30min",
  },
  fullPlatform: {
    title: "Request the full platform",
    subtitle: "Backend + mobile + admin console with multi-tenancy.",
    icon: Building,
    accent: "from-sky-400 to-blue-500",
    cta: "Send request",
    calendlyHint: null,
  },
  enterprise: {
    title: "View enterprise features",
    subtitle: "SSO, audit logs, custom SLAs and dedicated infra.",
    icon: Rocket,
    accent: "from-fuchsia-400 to-pink-500",
    cta: "Get a quote",
    calendlyHint: null,
  },
  trial: {
    title: "Start a free 14-day trial",
    subtitle: "Full access, no credit card. Cancel any time.",
    icon: Send,
    accent: "from-emerald-400 to-green-500",
    cta: "Start trial",
    calendlyHint: null,
  },
};

export default function CTAModal({ open, kind = "bookDemo", onClose }) {
  const preset = PRESETS[kind] || PRESETS.bookDemo;
  const [form, setForm] = useState({ name: "", email: "", company: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!form.email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", company: "", note: "" });
      onClose?.();
    }, 1800);
  }

  const Icon = preset.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-strong rounded-3xl p-6 relative shadow-2xl shadow-yellow-500/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X size={16} />
            </button>

            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${preset.accent} flex items-center justify-center mb-4 shadow-lg`}>
              <Icon size={20} className="text-black" />
            </div>

            <h2 className="text-xl font-bold mb-1">{preset.title}</h2>
            <p className="text-sm text-gray-400 mb-5">{preset.subtitle}</p>

            {submitted ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                <div className="text-lg font-semibold">We'll be in touch!</div>
                <div className="text-sm text-gray-500 mt-1">Check your inbox in a few minutes.</div>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  type="email"
                  placeholder="Work email *"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                />
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Company"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
                />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="What would you like to see?"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 resize-none"
                />

                {preset.calendlyHint && (
                  <div className="text-[11px] text-gray-500 italic">
                    Will redirect to <span className="text-yellow-400">{preset.calendlyHint}</span> in production.
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${preset.accent} text-black font-semibold text-sm hover:scale-[1.02] transition shadow-lg`}
                >
                  {preset.cta}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
