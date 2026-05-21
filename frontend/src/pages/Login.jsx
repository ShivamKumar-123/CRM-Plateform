import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/* ─────────────────────────────────────────────────────────────
 *  Direct color tokens — bypass global light-mode CSS overrides
 *  so this page always renders dark + readable.
 * ──────────────────────────────────────────────────────────── */
const C = {
  text: "#F8FAFC",
  textDim: "#CBD5E1",
  textMuted: "#94A3B8",
  textFaint: "#64748B",
  accent: "#FACC15",
  accentSoft: "#FDE68A",
  bg: "#05060A",
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
      setError("");
    } else {
      setError(res.error);
    }
  }

  const highlights = [
    { icon: TrendingUp, label: "Pipeline Intelligence", desc: "Forecast deals with AI-driven scoring" },
    { icon: Users, label: "Unified Customer 360°", desc: "Every conversation, contact and contract" },
    { icon: BarChart3, label: "Real-time Analytics", desc: "Dashboards that move as your business does" },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: C.bg, color: C.text }}
    >
      {/* ─── Local style overrides to neutralize global light-mode + autofill ─── */}
      <style>{`
        .login-page input:-webkit-autofill,
        .login-page input:-webkit-autofill:hover,
        .login-page input:-webkit-autofill:focus,
        .login-page input:-webkit-autofill:active {
          -webkit-text-fill-color: ${C.text} !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.04) inset !important;
          caret-color: ${C.text} !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .login-page input { color: ${C.text} !important; }
        .login-page input::placeholder { color: ${C.textFaint} !important; }
      `}</style>

      <div className="login-page">
        {/* ─── Animated Background ─────────────────────────────── */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            aria-hidden
            className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, #facc15 0%, transparent 70%)" }}
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute top-1/2 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 left-1/3 w-[420px] h-[420px] rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* ─── Left: Branding / Marketing ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="hidden lg:flex flex-col justify-center pr-4"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-3 mb-8 transition hover:opacity-90 w-fit"
              >
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg,#FACC15 0%,#F59E0B 100%)",
                    boxShadow: "0 0 18px rgba(250,204,21,0.4)",
                  }}
                >
                  <Zap size={16} className="text-black fill-black" />
                </span>
                <span
                  className="text-sm font-bold tracking-[0.25em] uppercase"
                  style={{ color: C.text }}
                >
                  CRM <span style={{ color: C.accent }}>Suite</span>
                </span>
              </Link>

              <h1
                className="text-5xl xl:text-6xl font-black leading-[1.05] mb-6"
                style={{ color: C.text }}
              >
                Welcome to the{" "}
                <span className="relative inline-block">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg,#FDE68A 0%,#FACC15 45%,#F59E0B 100%)",
                    }}
                  >
                    CRM that thinks
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg,#FACC15 0%,#F59E0B 100%)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                </span>{" "}
                ahead.
              </h1>

              <p
                className="text-lg leading-relaxed mb-10 max-w-md"
                style={{ color: C.textDim }}
              >
                Sign in to unify your leads, deals, and customers across every
                channel — beautifully orchestrated, ruthlessly fast.
              </p>

              <div className="space-y-5">
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    className="flex items-start gap-4 group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: C.accent,
                      }}
                    >
                      <h.icon size={18} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: C.text }}>
                        {h.label}
                      </div>
                      <div className="text-sm" style={{ color: C.textMuted }}>
                        {h.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-12 flex items-center gap-5 text-xs"
                style={{ color: C.textMuted }}
              >
                <div className="flex -space-x-2">
                  {[
                    "linear-gradient(135deg,#FACC15,#F59E0B)",
                    "linear-gradient(135deg,#38BDF8,#3B82F6)",
                    "linear-gradient(135deg,#F472B6,#E11D48)",
                    "linear-gradient(135deg,#34D399,#14B8A6)",
                  ].map((g, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full"
                      style={{
                        background: g,
                        border: `2px solid ${C.bg}`,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.text }}>
                    Trusted by 10,000+ teams
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i} style={{ color: C.accent }}>{s}</span>
                    ))}
                    <span className="ml-1" style={{ color: C.textFaint }}>
                      4.9 / 5 rating
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ─── Right: Login Card ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-md"
            >
              {/* Gradient glow ring */}
              <div
                className="absolute -inset-[1px] rounded-3xl blur-sm opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(250,204,21,0.45), rgba(245,158,11,0.20), rgba(56,189,248,0.30))",
                }}
              />

              <div
                className="relative rounded-3xl p-8 md:p-10"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
                }}
              >
                {/* Logo */}
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background:
                        "linear-gradient(135deg,#FACC15 0%,#F59E0B 60%,#EA580C 100%)",
                      boxShadow: "0 0 40px rgba(250,204,21,0.5)",
                    }}
                  >
                    <Zap size={28} className="text-black fill-black" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: "2px solid rgba(253,224,71,0.6)" }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    />
                  </motion.div>
                  <h2
                    className="text-2xl md:text-3xl font-extrabold tracking-tight"
                    style={{ color: C.text }}
                  >
                    {needs2FA ? "Verify it's you" : "Sign in to your account"}
                  </h2>
                  <p
                    className="text-sm mt-2 max-w-xs"
                    style={{ color: C.textMuted }}
                  >
                    {needs2FA
                      ? "Enter the 6-digit code from your authenticator app"
                      : "Enter your credentials to continue to the CRM Suite"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username + Password */}
                  <AnimatePresence>
                    {!needs2FA && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <FloatingInput
                          id="username"
                          label="Username or email"
                          icon={User}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoFocus
                          required
                        />

                        <FloatingInput
                          id="password"
                          label="Password"
                          icon={Lock}
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          trailing={
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="transition"
                              style={{ color: C.textFaint }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = C.accent)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = C.textFaint)
                              }
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                        />

                        <div className="flex items-center justify-between text-xs pt-1">
                          <label
                            className="flex items-center gap-2 cursor-pointer select-none"
                            style={{ color: C.textMuted }}
                          >
                            <span className="relative inline-flex items-center justify-center w-4 h-4">
                              <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="peer sr-only"
                              />
                              <span
                                className="block w-4 h-4 rounded transition"
                                style={{
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  background: remember
                                    ? C.accent
                                    : "rgba(255,255,255,0.05)",
                                  borderColor: remember
                                    ? C.accent
                                    : "rgba(255,255,255,0.25)",
                                }}
                              />
                              {remember && (
                                <CheckCircle2
                                  size={12}
                                  className="absolute"
                                  style={{ color: "#000" }}
                                />
                              )}
                            </span>
                            Remember me
                          </label>
                          <a
                            href="#"
                            className="font-medium transition"
                            style={{ color: C.accent }}
                          >
                            Forgot password?
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 2FA OTP */}
                  <AnimatePresence>
                    {needs2FA && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="space-y-3"
                      >
                        <div className="relative">
                          <ShieldCheck
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{ color: C.accent }}
                          />
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            required
                            autoFocus
                            inputMode="numeric"
                            maxLength={6}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none"
                            style={{
                              background: "rgba(250,204,21,0.06)",
                              border: "1px solid rgba(250,204,21,0.4)",
                              color: C.text,
                            }}
                            placeholder="••••••"
                          />
                        </div>
                        <p
                          className="text-xs text-center"
                          style={{ color: C.textMuted }}
                        >
                          Or use a backup recovery code.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNeeds2FA(false);
                            setOtp("");
                          }}
                          className="block mx-auto text-xs transition"
                          style={{ color: C.textMuted }}
                        >
                          ← Back to login
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-sm rounded-xl px-3 py-2.5 flex items-start gap-2"
                        style={{
                          color: "#FCA5A5",
                          background: "rgba(239,68,68,0.10)",
                          border: "1px solid rgba(239,68,68,0.3)",
                        }}
                      >
                        <span style={{ color: "#F87171" }}>⚠</span>
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="relative w-full py-3.5 rounded-2xl font-bold overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      color: "#000",
                      background:
                        "linear-gradient(90deg,#FDE68A 0%,#FACC15 45%,#F59E0B 100%)",
                      boxShadow: "0 10px 30px -8px rgba(250,204,21,0.6)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.span
                            className="w-4 h-4 rounded-full"
                            style={{
                              border: "2px solid rgba(0,0,0,0.3)",
                              borderTopColor: "#000",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Signing in...
                        </>
                      ) : (
                        <>
                          {needs2FA ? "Verify & Continue" : "Sign In"}
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </span>
                    <span
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      }}
                    />
                  </motion.button>

                  {/* Divider */}
                  {!needs2FA && (
                    <div className="relative my-2">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden
                      >
                        <div
                          className="w-full"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span
                          className="px-3 uppercase tracking-wider"
                          style={{ background: C.bg, color: C.textFaint }}
                        >
                          Secure access
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  {!needs2FA && (
                    <div className="text-center text-xs" style={{ color: C.textMuted }}>
                      Don't have an account?{" "}
                      <Link
                        to="/"
                        className="font-semibold"
                        style={{ color: C.accent }}
                      >
                        Request a demo →
                      </Link>
                    </div>
                  )}
                </form>
              </div>

              {/* Mobile trust signal */}
              <div
                className="lg:hidden mt-6 text-center text-xs"
                style={{ color: C.textMuted }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} style={{ color: C.accent }} />
                  Enterprise-grade encryption · SOC2 ready
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating-label input ─────────────────────────────────── */
function FloatingInput({ id, label, icon: Icon, trailing, value, ...rest }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;

  return (
    <div className="relative">
      <Icon
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition"
        style={{ color: focused ? C.accent : C.textFaint }}
      />
      <input
        id={id}
        value={value}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholder=" "
        className="w-full pl-11 pr-11 pt-5 pb-2 rounded-2xl focus:outline-none transition"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${focused ? "rgba(250,204,21,0.5)" : "rgba(255,255,255,0.12)"}`,
          color: C.text,
          boxShadow: focused
            ? "0 0 0 3px rgba(250,204,21,0.15)"
            : "none",
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-11 pointer-events-none transition-all duration-200"
        style={{
          top: lifted ? "6px" : "50%",
          transform: lifted ? "translateY(0)" : "translateY(-50%)",
          fontSize: lifted ? "10px" : "14px",
          letterSpacing: lifted ? "0.08em" : "normal",
          textTransform: lifted ? "uppercase" : "none",
          color: lifted ? C.accent : C.textFaint,
        }}
      >
        {label}
      </label>
      {trailing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {trailing}
        </div>
      )}
    </div>
  );
}

export default Login;
