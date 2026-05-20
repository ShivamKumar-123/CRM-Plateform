import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

/**
 * AnimatedCounter — eases a number from 0 → `value` using Framer Motion's
 * `animate`. Triggers on enter-view. Supports an optional `format` function
 * (defaults to int with locale thousand-sep).
 */
export default function AnimatedCounter({
  value,
  duration = 1.4,
  format,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const lastValueRef = useRef(0);

  useEffect(() => {
    if (!inView || !ref.current) return undefined;
    const from = lastValueRef.current;
    const to = Number(value) || 0;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        if (!ref.current) return;
        ref.current.textContent =
          prefix +
          (format ? format(latest) : Math.round(latest).toLocaleString("en-IN")) +
          suffix;
      },
    });
    lastValueRef.current = to;
    return controls.stop;
  }, [value, duration, format, prefix, suffix, inView]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}0{suffix}</span>;
}

/** Smart INR formatter compatible with format.js but works with floats. */
export function formatINR(n) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
