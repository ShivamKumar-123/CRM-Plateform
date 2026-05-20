import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, User, Mail, Lock, Building2, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");
  const { signup, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    const res = await signup({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      company: form.company.trim(),
    });
    if (res.ok) navigate("/app", { replace: true });
    else setError(res.error);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-yellow-400/15 blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <span className="font-bold text-lg tracking-wider">CRM<span className="text-yellow-400">.</span>demo</span>
          </Link>

          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-400 mt-2 mb-8">
            Takes 5 seconds. No email verification. Everything saved on your device.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name" icon={User}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                autoFocus
                placeholder="Jane Doe"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                placeholder="jane@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </Field>

            <Field label="Company (optional)" icon={Building2}>
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Acme Inc"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                placeholder="Pick anything (4+ characters)"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : (<>Create account <ArrowRight size={16} /></>)}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right: marketing rail */}
      <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-md"
        >
          <div className="inline-flex px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-300 mb-4">
            What you get
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            A full CRM, instantly. <br />
            <span className="gradient-text">No backend needed.</span>
          </h2>
          <ul className="space-y-3">
            {[
              "6 pre-seeded leads ready to qualify",
              "4 active customers and a full pipeline",
              "Realistic deal stages and conversion data",
              "Every CRUD action persists in your browser",
              "Reset to fresh demo with one click",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative mt-1">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        {children}
      </div>
    </div>
  );
}
