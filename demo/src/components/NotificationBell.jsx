import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Check, CheckCheck, Trash2, Volume2, VolumeX,
  UserPlus, Trophy, CalendarCheck, Wallet, Sparkles, ListChecks,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext.jsx";
import { timeAgo } from "../lib/format.js";

const ICONS = {
  lead: UserPlus,
  deal: Trophy,
  meeting: CalendarCheck,
  payment: Wallet,
  customer: Sparkles,
  task: ListChecks,
};
const COLORS = {
  lead: "from-sky-400 to-blue-500",
  deal: "from-emerald-400 to-green-500",
  meeting: "from-fuchsia-400 to-pink-500",
  payment: "from-yellow-400 to-amber-500",
  customer: "from-violet-400 to-purple-500",
  task: "from-rose-400 to-red-500",
};

export default function NotificationBell() {
  const { items, unread, markRead, markAllRead, clearAll, soundEnabled, toggleSound } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-black text-[10px] font-bold flex items-center justify-center shadow-lg shadow-yellow-500/40"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-[360px] max-h-[480px] rounded-2xl bg-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-yellow-500/5 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-[11px] text-gray-500">{unread} unread · {items.length} total</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleSound} title={soundEnabled ? "Mute" : "Unmute"}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button onClick={markAllRead} title="Mark all read"
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-emerald-300">
                  <CheckCheck size={14} />
                </button>
                <button onClick={clearAll} title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-300">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {items.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-gray-500">
                  <Bell size={20} className="mx-auto mb-2 opacity-40" />
                  All caught up. New events appear automatically.
                </div>
              )}
              <AnimatePresence initial={false}>
                {items.map((n) => {
                  const Icon = ICONS[n.type] || Bell;
                  const color = COLORS[n.type] || "from-gray-400 to-gray-600";
                  return (
                    <motion.button
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 border-b border-white/5 hover:bg-white/[0.03] transition ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className="text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {n.title}
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{n.body}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{timeAgo(n.at)}</div>
                      </div>
                      {!n.read && <Check size={14} className="text-gray-600" />}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
