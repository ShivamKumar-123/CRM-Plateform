import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, MessageSquare, Send, Clock, Headphones,
  Building2, Check, ArrowRight, Briefcase,
} from "lucide-react";
import { PageHero, SectionHeading } from "./_components.jsx";

const channels = [
  {
    icon: Headphones,
    title: "Sales enquiries",
    body: "For evaluating CRM Suite, enterprise plans, or custom requirements.",
    email: "sales@advance-solar.in",
    response: "We reply within 4 working hours",
    tint: "from-yellow-400 to-amber-500",
  },
  {
    icon: MessageSquare,
    title: "Customer support",
    body: "Existing customers — bug reports, feature requests, onboarding help.",
    email: "support@advance-solar.in",
    response: "First response within 1 hour (Pro+)",
    tint: "from-sky-400 to-blue-500",
  },
  {
    icon: Briefcase,
    title: "Partnerships",
    body: "Resellers, integration partners, channel partners.",
    email: "partners@advance-solar.in",
    response: "We reply within 2 working days",
    tint: "from-emerald-400 to-green-500",
  },
];

const offices = [
  {
    city: "Gurugram (HQ)",
    address: "Sector 18, Cyber City, Gurugram, Haryana 122015",
    phone: "+91 98XX XX XXXX",
    hours: "Mon–Sat · 9 AM – 7 PM IST",
  },
  {
    city: "Bengaluru (R&D)",
    address: "Koramangala 5th Block, Bengaluru, Karnataka 560095",
    phone: "+91 98XX XX XXXY",
    hours: "Mon–Fri · 10 AM – 7 PM IST",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", company: "", subject: "sales", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill name, email, and message.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    // Currently a stub — would POST to /api/contact/ when wired
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <PageHero
        eyebrow="Talk to us"
        title="We'd love to"
        accent="hear from you."
        subtitle="Sales, support, partnerships, or just feedback — pick a channel below or use the form. Real humans reply, usually within hours."
      />

      {/* ── Three contact channels ── */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {channels.map((c, i) => (
            <motion.a
              key={c.title}
              href={`mailto:${c.email}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 transition-colors block"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.tint} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <c.icon size={22} className="text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{c.body}</p>
              <div className="space-y-1.5">
                <p className="text-sm text-yellow-300 font-semibold inline-flex items-center gap-2">
                  <Mail size={14} /> {c.email}
                </p>
                <p className="text-xs text-gray-500 inline-flex items-center gap-2">
                  <Clock size={12} /> {c.response}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Contact form + sidebar ── */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Form (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl bg-white/[0.04] border border-white/10 p-8 md:p-10"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400/20 flex items-center justify-center mb-5">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Got it — thanks!</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Your message is in our inbox. We'll get back to you at <strong className="text-white">{form.email}</strong> within a few working hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", subject: "sales", message: "" }); }}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10"
                >
                  Send another <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Send us a message</h2>
                <p className="text-gray-400 mb-6">Fill the form — we reply by email within working hours.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">
                        Company (optional)
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Your company"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">
                        I'm reaching out about
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                      >
                        <option value="sales">Sales / evaluation</option>
                        <option value="support">Support / bug report</option>
                        <option value="partnership">Partnership</option>
                        <option value="press">Press / media</option>
                        <option value="other">Something else</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1.5 block">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you need — industry, team size, current pain points..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-lg hover:shadow-yellow-500/50 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send message"}
                    {!submitting && <Send size={16} />}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-2">
                    By submitting, you agree to our terms + privacy policy. We never share your details.
                  </p>
                </form>
              </>
            )}
          </motion.div>

          {/* Sidebar — offices + WhatsApp + emergency */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {/* Offices */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-yellow-400" />
                <h3 className="font-bold">Our offices</h3>
              </div>
              <div className="space-y-5">
                {offices.map((o) => (
                  <div key={o.city} className="text-sm">
                    <p className="font-semibold text-yellow-300">{o.city}</p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">{o.address}</p>
                    <p className="text-gray-400 text-xs mt-1.5 inline-flex items-center gap-1.5">
                      <Phone size={11} /> {o.phone}
                    </p>
                    <p className="text-gray-500 text-[10px] mt-0.5 inline-flex items-center gap-1.5">
                      <Clock size={10} /> {o.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/919800000000"
              className="block rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-6 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-300">WhatsApp us</p>
                  <p className="text-xs text-gray-400">Often faster than email</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                +91 98000 00000 →{" "}
                <span className="text-emerald-300 font-semibold inline-flex items-center gap-1">
                  Open chat <ArrowRight size={12} />
                </span>
              </p>
            </a>

            {/* Emergency for Enterprise */}
            <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-400/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Phone size={16} className="text-yellow-400" />
                <h3 className="font-bold text-yellow-300">Enterprise hotline</h3>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                For customers on the <strong>Enterprise</strong> plan with critical issues:
              </p>
              <p className="text-lg font-bold font-mono text-yellow-300">
                +91 124-XXX-XXXX
              </p>
              <p className="text-[10px] text-gray-500 mt-1">24×7 · phone support · &lt;1h response SLA</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Map placeholder ── */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Find us"
            title="Headquartered in"
            accent="Gurugram."
            eyebrowColor="text-sky-400"
            accentColor="from-sky-300 to-blue-500"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden border border-white/10 relative aspect-[16/9] bg-gradient-to-br from-yellow-500/5 via-transparent to-sky-500/5"
          >
            {/* Static map illustration — replace with real iframe in production */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center mb-4 animate-pulse">
                <MapPin size={28} className="text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Cyber City, Sector 18</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Gurugram, Haryana 122015 · India
              </p>
              <a
                href="https://maps.google.com/?q=Cyber+City+Gurugram"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white hover:bg-white/20 backdrop-blur"
              >
                Open in Google Maps <ArrowRight size={14} />
              </a>
            </div>

            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
