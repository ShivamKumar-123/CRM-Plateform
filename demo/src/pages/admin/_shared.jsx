/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";

export function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
          {Icon && (
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
              <Icon size={20} className="text-black" />
            </span>
          )}
          {title}
        </h1>
        {subtitle && <p className="text-gray-400 text-xs sm:text-sm mt-2 ml-13 sm:ml-14">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpiCard({ icon: Icon, label, value, sub, tint = "from-yellow-400 to-amber-500" }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 min-w-0"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 truncate">{label}</p>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-black" />
        </div>
      </div>
      <p
        className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight"
        style={{ wordBreak: "normal", overflowWrap: "anywhere" }}
        title={String(value)}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{sub}</p>}
    </motion.div>
  );
}

export function Panel({ title, accent = "text-yellow-300", children, action }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 sm:p-5">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 gap-2">
          {title && <p className={`text-xs uppercase tracking-widest font-bold ${accent}`}>{title}</p>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Empty({ msg = "No data yet." }) {
  return <p className="text-sm text-gray-500 text-center py-6">{msg}</p>;
}

export function Badge({ children, color = "yellow" }) {
  const map = {
    yellow:  "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    sky:     "bg-sky-400/20 text-sky-300 border-sky-400/30",
    emerald: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
    violet:  "bg-violet-400/20 text-violet-300 border-violet-400/30",
    red:     "bg-red-400/20 text-red-300 border-red-400/30",
    gray:    "bg-gray-500/20 text-gray-300 border-gray-500/30",
    amber:   "bg-amber-400/20 text-amber-300 border-amber-400/30",
    pink:    "bg-pink-400/20 text-pink-300 border-pink-400/30",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider ${map[color] || map.yellow}`}>{children}</span>;
}

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 60_000) return "just now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const ROLE_COLORS = {
  OWNER:   "yellow",
  ADMIN:   "amber",
  MANAGER: "violet",
  SALES:   "sky",
  SUPPORT: "emerald",
};
