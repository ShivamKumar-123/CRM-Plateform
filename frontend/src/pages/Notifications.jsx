import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellRing, RefreshCw, Check, CheckCheck, Inbox, Filter,
  Trash2, Circle,
} from "lucide-react";
import { api } from "../lib/api.js";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Notifications() {
  const [data, setData] = useState({ unread_count: 0, notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread | read

  const load = () => {
    setLoading(true);
    setError("");
    api.getNotifications()
      .then((d) => setData(d || { unread_count: 0, notifications: [] }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const markRead = async (n) => {
    if (n.read) return;
    setData((d) => ({
      ...d,
      unread_count: Math.max(0, d.unread_count - 1),
      notifications: d.notifications.map((x) => x.id === n.id ? { ...x, read: true } : x),
    }));
    try {
      await api.markNotificationRead(n.id);
    } catch (_) { load(); }
  };

  const markAllRead = async () => {
    setData((d) => ({
      ...d,
      unread_count: 0,
      notifications: d.notifications.map((x) => ({ ...x, read: true })),
    }));
    try {
      await api.markAllNotificationsRead();
    } catch (_) { load(); }
  };

  const filtered = useMemo(() => {
    if (filter === "unread") return data.notifications.filter((n) => !n.read);
    if (filter === "read") return data.notifications.filter((n) => n.read);
    return data.notifications;
  }, [data.notifications, filter]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((n) => {
      const key = dateLabel(n.created_at);
      (groups[key] = groups[key] || []).push(n);
    });
    return groups;
  }, [filtered]);

  const total = data.notifications.length;
  const readCount = data.notifications.filter((n) => n.read).length;

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 relative">
              <Bell size={20} className="text-black" />
              {data.unread_count > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-gray-950"
                />
              )}
            </span>
            Notifications
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {data.unread_count > 0
              ? <>You have <span className="text-yellow-300 font-bold">{data.unread_count}</span> unread {data.unread_count === 1 ? "notification" : "notifications"}.</>
              : "All caught up. ✨"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="p-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
            title="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {data.unread_count > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3">
        <Stat label="Total" value={total} />
        <Stat label="Unread" value={data.unread_count} accent="text-yellow-300" />
        <Stat label="Read" value={readCount} accent="text-emerald-300" />
      </motion.div>

      {/* Filter chips */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1">
          <Filter size={11} /> Show
        </span>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({total})
        </FilterChip>
        <FilterChip active={filter === "unread"} onClick={() => setFilter("unread")} highlight>
          Unread ({data.unread_count})
        </FilterChip>
        <FilterChip active={filter === "read"} onClick={() => setFilter("read")}>
          Read ({readCount})
        </FilterChip>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Notification groups */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
        className="space-y-6">
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 px-1">
              {label}
            </p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {items.map((n) => (
                  <NotificationRow key={n.id} n={n} onMarkRead={() => markRead(n)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 rounded-2xl bg-white/[0.03] border border-white/10">
            <Inbox size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {filter === "unread"
                ? "No unread notifications."
                : filter === "read"
                ? "No read notifications yet."
                : "Notifications inbox is empty."}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Naye leads, deals, ya tasks update hote hi yahan dikhega.
            </p>
          </div>
        )}
        {loading && data.notifications.length === 0 && (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        )}
      </motion.div>
    </div>
  );
}

function NotificationRow({ n, onMarkRead }) {
  const type = (n.type || "INFO").toUpperCase();
  const accent = typeAccent(type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onClick={onMarkRead}
      className={`group p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden
        ${n.read
          ? "bg-white/[0.025] border-white/10 hover:border-white/20"
          : "bg-gradient-to-r from-yellow-400/[0.07] to-transparent border-yellow-400/30 hover:border-yellow-400/50"
        }`}
    >
      {/* Unread dot */}
      {!n.read && (
        <motion.span
          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ boxShadow: "0 0 8px rgba(250,204,21,0.7)" }}
        />
      )}

      <div className="flex items-start gap-4 pl-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent.bg, color: accent.fg }}
        >
          <BellRing size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={`font-semibold text-sm truncate ${n.read ? "text-gray-300" : "text-white"}`}>
              {n.title || "Notification"}
            </p>
            <span className="text-[10px] text-gray-500 flex-shrink-0 font-mono">
              {timeAgo(n.created_at)}
            </span>
          </div>
          {n.body && (
            <p className={`text-sm mt-1 line-clamp-2 ${n.read ? "text-gray-500" : "text-gray-300"}`}>
              {n.body}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider"
              style={{ background: accent.bg, color: accent.fg }}>
              {type}
            </span>
            {!n.read && (
              <span className="text-[10px] text-yellow-300 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <Check size={10} /> Click to mark read
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
      <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, highlight, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
        active
          ? highlight
            ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/40"
            : "bg-white/10 text-white border-white/20"
          : "bg-white/[0.04] text-gray-400 border-white/10 hover:bg-white/10"
      }`}>
      {children}
    </button>
  );
}

/* ─── helpers ────────────────────────────── */

function typeAccent(type) {
  const map = {
    INFO:    { bg: "rgba(56,189,248,0.18)",  fg: "#7DD3FC" },
    SUCCESS: { bg: "rgba(52,211,153,0.18)",  fg: "#6EE7B7" },
    WARNING: { bg: "rgba(250,204,21,0.18)",  fg: "#FDE68A" },
    ERROR:   { bg: "rgba(248,113,113,0.18)", fg: "#FCA5A5" },
    LEAD:    { bg: "rgba(250,204,21,0.18)",  fg: "#FDE68A" },
    DEAL:    { bg: "rgba(56,189,248,0.18)",  fg: "#7DD3FC" },
    TASK:    { bg: "rgba(167,139,250,0.18)", fg: "#C4B5FD" },
    PAYMENT: { bg: "rgba(52,211,153,0.18)",  fg: "#6EE7B7" },
  };
  return map[type] || map.INFO;
}

function dateLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const days = Math.round((today - target) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d`;
  return d.toLocaleDateString();
}
