import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, ExternalLink, X, Info } from "lucide-react";
import { db } from "../lib/db.js";

/**
 * Persistent demo banner shown on every app page.
 *  - Tag: "Live Demo" — makes it clear this isn't production
 *  - Reset Demo Data button → wipes localStorage + reseeds
 *  - Get Full Version CTA → opens your real site / contact
 *  - Dismissible (stored in localStorage so it stays dismissed)
 */
const DISMISS_KEY = "crm_demo_banner_dismissed";

// Where to send users who click "Get Full Version".
// Set VITE_FULL_VERSION_URL env var in Vercel project settings to override.
const FULL_VERSION_URL =
  import.meta.env.VITE_FULL_VERSION_URL || "mailto:sales@yourcrmdomain.com?subject=CRM%20Suite%20Enquiry";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1"
  );
  const [resetting, setResetting] = useState(false);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const resetData = () => {
    if (!confirm("Reset the demo to its starting state? All your changes in this browser will be wiped.")) return;
    setResetting(true);
    try {
      db.reset();
      // Hard-reload so all pages re-read the fresh seed.
      window.location.reload();
    } catch (e) {
      alert("Reset failed: " + (e?.message || "unknown error"));
      setResetting(false);
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="sticky top-0 z-40 w-full bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-sky-500/15 backdrop-blur-md border-b border-yellow-400/25"
        >
          <div className="px-3 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 text-xs sm:text-[13px]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 font-bold tracking-wider text-[10px] flex-shrink-0">
              <Sparkles size={10} /> LIVE DEMO
            </span>

            <span className="text-gray-300 hidden sm:inline truncate">
              You're exploring a demo. Data is saved only in this browser and resets when you clear cookies.
            </span>
            <span className="text-gray-300 sm:hidden truncate flex-1">
              Data stays in this browser only.
            </span>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={resetData}
                disabled={resetting}
                title="Reset all demo data to starting state"
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 disabled:opacity-50"
              >
                <RotateCcw size={11} className={resetting ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Reset demo</span>
              </button>

              <a
                href={FULL_VERSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
              >
                <ExternalLink size={11} />
                <span className="hidden xs:inline sm:inline">Get full version</span>
                <span className="xs:hidden sm:hidden">Buy</span>
              </a>

              <button
                onClick={dismiss}
                title="Hide this banner"
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {dismissed && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => { localStorage.removeItem(DISMISS_KEY); setDismissed(false); }}
          title="Show demo banner"
          className="fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full bg-yellow-400/90 hover:bg-yellow-400 text-black shadow-lg flex items-center justify-center"
        >
          <Info size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
