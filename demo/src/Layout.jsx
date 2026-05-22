import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import LiveTicker from "./components/LiveTicker.jsx";
import DemoAssistant from "./components/DemoAssistant.jsx";
import DemoBanner from "./components/DemoBanner.jsx";
import PresentationOverlay from "./components/PresentationOverlay.jsx";
import { useDemoMode } from "./context/DemoModeContext.jsx";

const pageVariant = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { presentation } = useDemoMode();

  return (
    <div className="flex min-h-screen bg-black text-white">
      {!presentation && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        {!presentation && <DemoBanner />}
        {!presentation && <Topbar onMenu={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto bg-gray-950/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariant}
              initial="hidden"
              animate="show"
              exit="exit"
              className={presentation ? "p-6 md:p-12" : "p-4 md:p-8"}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <LiveTicker />
      <DemoAssistant />
      <PresentationOverlay />
    </div>
  );
}
