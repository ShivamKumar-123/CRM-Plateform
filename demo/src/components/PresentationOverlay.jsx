import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, X, MonitorPlay } from "lucide-react";
import { useDemoMode } from "../context/DemoModeContext.jsx";

/**
 * Floating control strip + spotlight ring rendered on top of the app while
 * Presentation Mode is active. Auto-rotates routes every 12 seconds unless
 * paused; keyboard arrows + Esc handled inside DemoModeContext.
 */
export default function PresentationOverlay() {
  const { presentation, routeIndex, routes, stepNext, stepPrev, exitPresentation } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync URL when step changes.
  useEffect(() => {
    if (!presentation) return;
    const target = routes[routeIndex];
    if (target && target !== location.pathname) navigate(target);
  }, [presentation, routeIndex, routes, navigate, location.pathname]);

  if (!presentation) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Spotlight vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Top banner */}
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 backdrop-blur-xl border border-yellow-400/30 shadow-2xl shadow-yellow-500/20">
            <MonitorPlay size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold tracking-wider text-yellow-300">PRESENTATION MODE</span>
            <span className="text-[10px] text-gray-400">{routeIndex + 1} / {routes.length}</span>
          </div>
        </motion.div>

        {/* Bottom controls */}
        <motion.div
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <button onClick={stepPrev} className="p-2 rounded-lg hover:bg-white/10 text-white">
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs text-gray-400 min-w-[120px] text-center truncate">
              {routes[routeIndex]?.replace("/app", "") || "Dashboard"}
            </div>
            <button onClick={stepNext} className="p-2 rounded-lg hover:bg-white/10 text-white">
              <ChevronRight size={16} />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={exitPresentation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 text-xs"
            >
              <X size={12} /> Exit
            </button>
          </div>
          <div className="text-[10px] text-center text-gray-500 mt-2">← → arrows to navigate · Esc to exit</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
