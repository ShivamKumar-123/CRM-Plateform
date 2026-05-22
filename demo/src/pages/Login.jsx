import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Sparkles, Users, Crown, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const DEMO_EMAIL = "demo@demo.com";
const DEMO_PASSWORD = "demo123";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [quickRole, setQuickRole] = useState(null); // "user" | "admin" while auto-logging
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  if (isAuthenticated) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await login(email.trim(), password);
    if (res.ok) navigate(from, { replace: true });
    else setError(res.error);
  }

  async function quickLogin(role) {
    setError("");
    setQuickRole(role);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    const res = await login(DEMO_EMAIL, DEMO_PASSWORD);
    if (res.ok) {
      navigate(role === "admin" ? "/admin" : "/app", { replace: true });
    } else {
      setError(res.error || "Auto-login failed. Try the manual form below.");
      setQuickRole(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background aura */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-yellow-400/15 blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-[140px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Zap size={18} className="text-black fill-black" />
          </div>
          <span className="font-bold text-lg tracking-wider">CRM<span className="text-yellow-400">.</span>demo</span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in to continue to your demo workspace.</p>
          </div>

          {/* One-click demo entry — choose perspective */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={12} className="text-yellow-400" />
              <p className="text-[10px] uppercase tracking-widest text-yellow-300 font-bold">
                One-click demo
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickLogin("user")}
                disabled={loading}
                className="group relative overflow-hidden flex flex-col items-start gap-1.5 p-3 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-400/30 hover:border-sky-400/50 hover:bg-sky-500/15 transition text-left disabled:opacity-60"
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  {quickRole === "user" ? (
                    <Loader2 size={14} className="text-black animate-spin" />
                  ) : (
                    <Users size={14} className="text-black" />
                  )}
                </span>
                <span className="text-sm font-bold text-sky-200">Try as User</span>
                <span className="text-[10px] text-sky-300/70 leading-tight">
                  Sales rep view · leads + deals
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("admin")}
                disabled={loading}
                className="group relative overflow-hidden flex flex-col items-start gap-1.5 p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-400/30 hover:border-yellow-400/50 hover:bg-yellow-500/15 transition text-left disabled:opacity-60"
                style={{ boxShadow: quickRole === "admin" ? "0 0 20px rgba(250,204,21,0.25)" : undefined }}
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center">
                  {quickRole === "admin" ? (
                    <Loader2 size={14} className="text-black animate-spin" />
                  ) : (
                    <Crown size={14} className="text-black" />
                  )}
                </span>
                <span className="text-sm font-bold text-yellow-200">Try as Admin</span>
                <span className="text-[10px] text-yellow-300/70 leading-tight">
                  Full admin console
                </span>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 text-center">
              No sign-up required. Click either button — instant access.
            </p>
          </div>

          {/* Manual login divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[10px] uppercase tracking-widest text-gray-500 bg-gray-950">
                Or sign in manually
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  placeholder="••••••••"
                />
              </div>
            </div>

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
              {loading ? "Signing in..." : (<>Sign in <ArrowRight size={16} /></>)}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            New here?{" "}
            <Link to="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Create an account
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Your data lives in your browser. Clearing site data resets the demo.
        </p>
      </motion.div>
    </div>
  );
}
