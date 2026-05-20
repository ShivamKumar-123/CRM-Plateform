import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  function fillDemo() {
    setEmail("demo@demo.com");
    setPassword("demo123");
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

          <button
            type="button"
            onClick={fillDemo}
            className="w-full mb-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm hover:bg-yellow-400/15 transition"
          >
            <Sparkles size={14} />
            Auto-fill demo credentials
          </button>

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
