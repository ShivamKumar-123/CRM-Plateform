import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, X } from "lucide-react";
import { randomLiveEvent } from "../lib/fakeData.js";
import { useIndustry } from "../context/IndustryContext.jsx";

/**
 * Floating bottom-left ticker. Spawns a new event card every ~6-12 seconds,
 * each card auto-dismisses after ~4 seconds. Stacks up to 3 visible.
 */
export default function LiveTicker() {
  const { industry, dataVersion } = useIndustry();
  const [items, setItems] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => { setItems([]); }, [dataVersion]);

  useEffect(() => {
    if (paused) return undefined;
    let timer;
    const schedule = () => {
      const delay = 6_000 + Math.random() * 6_000;
      timer = setTimeout(() => {
        const text = randomLiveEvent(industry);
        const id = `tk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setItems((prev) => [{ id, text }, ...prev].slice(0, 3));
        setTimeout(() => {
          setItems((prev) => prev.filter((it) => it.id !== id));
        }, 4500);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [paused, industry]);

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col-reverse gap-2 max-w-xs pointer-events-none">
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            className="pointer-events-auto glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg shadow-yellow-500/10 border-yellow-400/20 max-w-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Activity size={12} className="text-black" />
            </div>
            <div className="text-xs text-gray-200 leading-snug">{it.text}</div>
            <button
              onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
              className="text-gray-600 hover:text-white"
              aria-label="Dismiss"
            >
              <X size={11} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        onClick={() => setPaused((p) => !p)}
        className="pointer-events-auto text-[10px] text-gray-600 hover:text-yellow-400 self-start px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/5"
      >
        {paused ? "▶ Resume live ticker" : "⏸ Pause live ticker"}
      </button>
    </div>
  );
}
