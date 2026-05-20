import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

const TIPS = [
  { path: "/app", text: "Try moving a deal to WON — pipeline values update live." },
  { path: "/app", text: "Switch industries from the topbar to repopulate every module." },
  { path: "/app/leads", text: "Create a new lead — the dashboard KPIs animate with new totals." },
  { path: "/app/deals", text: "Drag deals through the kanban — probability auto-locks for Won/Lost." },
  { path: "/app/customers", text: "Customer lifetime value shows realistic spread per industry." },
  { path: "/app/reports", text: "Open Reports — funnel + revenue trends + sales-rep breakdown." },
  { path: "/app/automation", text: "Automation flow shows trigger → action chains, fully visual." },
  { path: "/app/command-center", text: "Command Center: reset data, generate leads, toggle Presentation Mode." },
  { path: "/app/settings", text: "Settings → Danger zone wipes everything in one click." },
  { path: "*", text: "The bell in the top-right shows fake real-time notifications." },
  { path: "*", text: "Press Esc inside Presentation Mode to exit." },
];

export default function DemoAssistant() {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(0);

  // Filter tips relevant to current route + global.
  const relevant = TIPS.filter((t) => t.path === location.pathname || t.path === "*");
  const tip = relevant[idx % relevant.length] || TIPS[0];

  // Auto-rotate every 8s while open.
  useEffect(() => {
    if (!open) return undefined;
    const timer = setInterval(() => setIdx((i) => i + 1), 8000);
    return () => clearInterval(timer);
  }, [open]);

  // Reset index on route change.
  useEffect(() => { setIdx(0); }, [location.pathname]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            className="glass-strong rounded-2xl p-4 max-w-xs shadow-2xl shadow-yellow-500/10 relative"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black border border-white/10 text-gray-400 hover:text-white flex items-center justify-center"
            >
              <X size={12} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-fuchsia-400 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
                <Sparkles size={16} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-yellow-300 font-semibold mb-1">Demo assistant</div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tip.text}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-gray-200 leading-snug"
                  >
                    {tip.text}
                  </motion.p>
                </AnimatePresence>
                <button
                  onClick={() => setIdx((i) => i + 1)}
                  className="mt-2 text-[11px] text-gray-400 hover:text-yellow-300 flex items-center gap-1"
                >
                  Next tip <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-fuchsia-400 flex items-center justify-center shadow-2xl shadow-yellow-500/40 hover:scale-110 transition"
            aria-label="Open demo assistant"
          >
            <Sparkles size={18} className="text-black" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
