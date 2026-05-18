import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api.js";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unread_count: 0, notifications: [] });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.getNotifications();
      setData(d);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // poll every 60s
    return () => clearInterval(id);
  }, []);

  // close on outside click
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      load();
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      load();
    } catch (_) {}
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl bg-white/4 border border-sky-500/20 flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
      >
        <Bell size={18} />
        {data.unread_count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-black text-[10px] font-bold flex items-center justify-center border-2 border-black"
            style={{ boxShadow: "0 0 8px rgba(250,204,21,0.7)" }}
          >
            {data.unread_count > 9 ? "9+" : data.unread_count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-h-[420px] rounded-2xl bg-gray-950 border border-yellow-400/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="text-sm font-bold text-white">Notifications</p>
              {data.unread_count > 0 && (
                <button onClick={markAllRead} className="text-xs text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1">
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto scrollbar-thin flex-1">
              {loading && <p className="text-center text-xs text-gray-500 py-6">Loading…</p>}
              {!loading && data.notifications.length === 0 && (
                <div className="text-center py-10 px-4">
                  <Bell size={28} className="mx-auto text-gray-500/50 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                  <p className="text-[10px] text-gray-500 mt-1">You'll be pinged here when leads, deals, or tasks change.</p>
                </div>
              )}
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 ${
                    !n.read ? "bg-yellow-400/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.read ? "bg-yellow-400" : "bg-transparent"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
