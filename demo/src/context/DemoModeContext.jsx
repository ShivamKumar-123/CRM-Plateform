import { createContext, useContext, useEffect, useState, useCallback } from "react";

const DemoModeContext = createContext(null);

/**
 * Two demo modes:
 *  - "presentation" → hides chrome (sidebar, topbar search), enables keyboard nav
 *  - "salesDemo"    → boosts data velocity (frequent notifications, auto-rotate tips)
 *
 * Both are off by default. Presentation mode also captures Esc to exit and
 * Arrow keys to step through the demo route list.
 */
const DEMO_ROUTES = ["/app", "/app/leads", "/app/deals", "/app/customers", "/app/reports", "/app/automation"];

export function DemoModeProvider({ children }) {
  const [presentation, setPresentation] = useState(false);
  const [salesDemo, setSalesDemo] = useState(false);
  const [routeIndex, setRouteIndex] = useState(0);

  const togglePresentation = useCallback(() => setPresentation((p) => !p), []);
  const toggleSalesDemo = useCallback(() => setSalesDemo((s) => !s), []);
  const exitPresentation = useCallback(() => setPresentation(false), []);

  const stepNext = useCallback(() => setRouteIndex((i) => (i + 1) % DEMO_ROUTES.length), []);
  const stepPrev = useCallback(() => setRouteIndex((i) => (i - 1 + DEMO_ROUTES.length) % DEMO_ROUTES.length), []);

  // Global keyboard listener while presentation mode is active.
  useEffect(() => {
    if (!presentation) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { exitPresentation(); }
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); stepNext(); }
      else if (e.key === "ArrowLeft") { stepPrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presentation, exitPresentation, stepNext, stepPrev]);

  return (
    <DemoModeContext.Provider value={{
      presentation, salesDemo, routeIndex, routes: DEMO_ROUTES,
      togglePresentation, toggleSalesDemo, exitPresentation,
      stepNext, stepPrev,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used inside <DemoModeProvider>");
  return ctx;
}
