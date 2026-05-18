import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext.jsx";

/**
 * Theme toggle button (sun/moon).
 *
 * Props:
 *   variant: "default" | "pill"
 *   className: optional extra classes
 */
export default function ThemeToggle({ variant = "default", className = "" }) {
  const { isDark, toggle } = useTheme();

  const base =
    variant === "pill"
      ? "px-3 h-9 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
      : "w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center justify-center gap-2 transition-colors ${base} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <Moon size={16} className="text-yellow-300" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <Sun size={16} className="text-amber-500" />
          </motion.span>
        )}
      </AnimatePresence>
      {variant === "pill" && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
