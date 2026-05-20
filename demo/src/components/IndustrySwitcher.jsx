import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sun, Building2, HeartPulse, Truck, ShieldCheck, Check } from "lucide-react";
import { useIndustry } from "../context/IndustryContext.jsx";

const ICONS = { Sun, Building2, HeartPulse, Truck, ShieldCheck };

export default function IndustrySwitcher({ compact = false }) {
  const { industry, industries, switchTo } = useIndustry();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Icon = ICONS[industry.iconName] || Sun;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition ${compact ? "text-xs" : "text-sm"}`}
        title="Switch industry preset"
      >
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${industry.accent} flex items-center justify-center`}>
          <Icon size={12} className="text-black" />
        </div>
        <span className="hidden sm:inline font-medium">{industry.label}</span>
        <ChevronDown size={13} className="text-gray-500" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-72 rounded-2xl bg-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <div className="text-sm font-semibold">Industry preset</div>
              <div className="text-[11px] text-gray-500">Switch to repopulate demo data</div>
            </div>
            <div className="py-1">
              {industries.map((ind) => {
                const I = ICONS[ind.iconName] || Sun;
                const active = ind.id === industry.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => { switchTo(ind.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition ${active ? "bg-white/5" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ind.accent} flex items-center justify-center flex-shrink-0`}>
                      <I size={14} className="text-black" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium">{ind.label}</div>
                      <div className="text-[11px] text-gray-500 truncate">{ind.tagline}</div>
                    </div>
                    {active && <Check size={14} className="text-yellow-400" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
