import { motion } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";

/* Form input class shared across modals */
export const modalInput =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40";

export function Field({ label, wide, children }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-emerald-500" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-gray-200">{label}</span>
    </label>
  );
}

export function ModalShell({ title, children, onClose, size = "md" }) {
  const sizeClass = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" }[size];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${sizeClass} rounded-2xl bg-gray-950 border border-yellow-400/20 shadow-[0_20px_80px_rgba(250,204,21,0.2)] p-6 max-h-[90vh] overflow-y-auto scrollbar-thin`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function KpiCard({ icon: Icon, label, value, sub, tint }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
        <div
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center`}
        >
          <Icon size={16} className="text-black" />
        </div>
      </div>
      <p className="text-2xl md:text-3xl font-black break-all">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
    </motion.div>
  );
}

export function Panel({ title, accent = "text-yellow-300", full, children }) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.04] border border-white/10 p-5 ${
        full ? "lg:col-span-2" : ""
      }`}
    >
      {title && (
        <p
          className={`text-xs uppercase tracking-widest font-bold mb-4 ${accent}`}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

const COLOR_MAP = {
  yellow: "from-yellow-400 to-amber-500",
  sky: "from-sky-400 to-blue-500",
  emerald: "from-emerald-400 to-green-500",
  pink: "from-pink-400 to-rose-500",
  violet: "from-violet-400 to-purple-500",
  orange: "from-orange-400 to-red-500",
};

export function BarList({ data, max, color = "yellow" }) {
  const gradient = COLOR_MAP[color] || COLOR_MAP.yellow;
  const localMax = Math.max(max || 1, ...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = (d.value / localMax) * 100;
        return (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">{d.label}</span>
              <span className="text-gray-400 font-mono">{d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Empty({ msg = "No data yet." }) {
  return (
    <p className="text-sm text-gray-500 text-center py-6">{msg}</p>
  );
}

export function ErrorBanner({ msg, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center justify-between mb-4">
      <span className="flex items-center gap-2">
        <AlertTriangle size={14} /> {msg}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-200 hover:text-white underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status, palette }) {
  const cls =
    palette?.[String(status || "").toUpperCase()] ||
    "bg-gray-500 text-white";
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${cls}`}
    >
      {status || "—"}
    </span>
  );
}

export function SuccessNote({ msg }) {
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-emerald-300 flex items-center gap-2 mb-4">
      <Check size={14} /> {msg}
    </div>
  );
}

export const ROLE_CHOICES = [
  "ADMIN",
  "SALES",
  "DEALER",
  "MANAGER",
  "CHANNEL PARTNER",
];

export const USER_STATUS_CHOICES = ["ACTIVE", "INACTIVE"];

// Default fallbacks. Actual valid statuses come from the org's pipeline (see useLeadPipeline / useDealPipeline).
export const LEAD_SOURCE_CHOICES = [
  "WEBSITE",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "DEALER",
  "PHONE",
  "EMAIL",
  "EVENT",
  "OTHER",
];

export const FALLBACK_LEAD_STATUS_CHOICES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const FALLBACK_DEAL_STATUS_CHOICES = ["OPEN", "WON", "CANCELLED"];

// Industry presets (admin-side suggestions only — not enforced)
export const INDUSTRY_CHOICES = [
  "GENERAL", "SOLAR", "REAL_ESTATE", "HEALTHCARE", "EDUCATION",
  "LOGISTICS", "ECOMMERCE", "MANUFACTURING", "AGENCY", "FINANCE",
  "INSURANCE", "B2B_SALES", "SERVICES", "OTHER",
];

export const PLAN_CHOICES = ["FREE", "PRO", "ENTERPRISE"];
export const ORG_STATUS_CHOICES = ["ACTIVE", "TRIAL", "SUSPENDED", "CANCELLED"];

// Lead priority colors — derived from score (HOT >=70, WARM >=40, COLD <40)
export const PRIORITY_PALETTE = {
  HOT:  "bg-red-500 text-white",
  WARM: "bg-yellow-400 text-black",
  COLD: "bg-sky-400 text-black",
};

// Default status colors. Pipelines also include per-stage colors that supersede.
export const LEAD_STATUS_PALETTE = {
  NEW: "bg-sky-400 text-black",
  CONTACTED: "bg-blue-400 text-black",
  QUALIFIED: "bg-violet-400 text-black",
  PROPOSAL_SENT: "bg-yellow-400 text-black",
  NEGOTIATION: "bg-amber-500 text-black",
  SITE_VISIT: "bg-yellow-400 text-black",
  QUOTATION_SENT: "bg-amber-500 text-black",
  WON: "bg-emerald-400 text-black",
  DEALED: "bg-emerald-400 text-black",
  LOST: "bg-red-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

export const DEAL_STATUS_PALETTE = {
  OPEN: "bg-sky-400 text-black",
  WON: "bg-emerald-400 text-black",
  CANCELLED: "bg-red-500 text-white",
};

export const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;
