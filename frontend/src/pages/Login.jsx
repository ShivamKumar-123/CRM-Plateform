import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Lock, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await login(username, password, needs2FA ? otp : undefined);
    if (res.ok) {
      navigate(from, { replace: true });
    } else if (res.requires2fa) {
      setNeeds2FA(true);
      setError("");  // not really an error — just a 2nd-factor challenge
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center mb-4"
            style={{ boxShadow: "0 0 30px rgba(250,204,21,0.5)" }}
          >
            <Zap size={26} className="text-black fill-black" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent tracking-wider">
            CRM SUITE
          </h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Username</label>
            <div className="relative mt-1">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                placeholder="your.username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                placeholder="••••••••"
              />
            </div>
          </div>

          {needs2FA && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Two-factor code
              </label>
              <div className="relative mt-1">
                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-yellow-400/5 border border-yellow-400/40 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-400/60"
                  placeholder="123 456"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Enter the 6-digit code from your authenticator app, or a backup code.
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
            className="w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
