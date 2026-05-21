import { NavLink, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  X,
  Handshake,
  Crown,
  ShieldCheck,
  ArrowRight,
  CheckSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
  { icon: UserPlus, label: "Leads", path: "/app/leads" },
  { icon: Handshake, label: "Deals", path: "/app/deals" },
  { icon: Users, label: "Customers", path: "/app/customers" },
  { icon: CheckSquare, label: "Tasks", path: "/app/tasks" },
  { icon: Bell, label: "Notifications", path: "/app/notifications" },
  { icon: BarChart3, label: "Reports", path: "/app/reports" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

/* ── Variants ── */
const sidebarVariant = {
  hidden: { x: -280, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 90, damping: 18 },
  },
  exit: {
    x: -280,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const navStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const overlayVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            variants={overlayVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 z-50 h-screen w-64 flex-col
                   bg-gradient-to-b from-black via-gray-950 to-black
                   border-r border-yellow-500/15
                   shadow-[4px_0_30px_rgba(0,0,0,0.9)]"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
      >
        <SidebarContent setSidebarOpen={setSidebarOpen} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className="md:hidden fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
                       bg-gradient-to-b from-black via-gray-950 to-black
                       border-r border-yellow-500/15
                       shadow-[4px_0_30px_rgba(0,0,0,0.9)]"
            variants={sidebarVariant}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <SidebarContent
              setSidebarOpen={setSidebarOpen}
              isMobile
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sidebar Inner Content ── */
function SidebarContent({ setSidebarOpen, isMobile }) {
  const navigate = useNavigate();
  const { username, logout, isSuperUser, organization } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = baseNavItems;

  return (
    <>
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/40 via-sky-400/40 to-yellow-400/40" />

      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-yellow-500/15">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/30"
            style={{ boxShadow: "0 0 20px rgba(250,204,21,0.55)" }}
          >
            <Zap size={17} className="text-black fill-black" />
          </div>
          <span className="font-bold text-sm tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
            CRM SUITE
          </span>
        </div>

        {isMobile && (
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 px-3 space-y-1 mt-6"
        variants={navStagger}
        initial="hidden"
        animate="show"
      >
        {navItems.map(({ icon: Icon, label, path }) => (
          <motion.div key={label} variants={navItemVariant}>
            <NavLink
              to={path}
              end={path === "/app"}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
                 text-sm font-medium tracking-wide transition-colors duration-200
                 ${
                   isActive
                     ? "bg-gradient-to-r from-yellow-500/12 to-sky-500/10 text-yellow-300 border border-yellow-500/25 shadow-[0_0_12px_rgba(250,204,21,0.1)]"
                     : "text-gray-500 border border-transparent hover:bg-white/4 hover:text-sky-300 hover:border-sky-500/15"
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active bar */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-yellow-400 to-sky-400"
                        layoutId="activeSidebarBar"
                        style={{ boxShadow: "0 0 8px rgba(250,204,21,0.8)" }}
                      />
                    )}
                  </AnimatePresence>

                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${
                      isActive
                        ? "bg-gradient-to-br from-yellow-500/20 to-sky-500/15 border border-yellow-500/25"
                        : "bg-white/4 border border-transparent"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-yellow-400" : "text-gray-500"}
                    />
                  </span>

                  {label}

                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-sky-400"
                        layoutId="activeSidebarDot"
                        style={{ boxShadow: "0 0 6px rgba(250,204,21,0.9)" }}
                      />
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 mt-auto space-y-2">
        {isSuperUser && (
          <Link
            to="/admin"
            onClick={() => isMobile && setSidebarOpen(false)}
            className="group relative block overflow-hidden rounded-xl p-3 border border-yellow-400/40
                       bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-orange-500/15
                       hover:from-yellow-500/25 hover:via-amber-500/20 hover:to-orange-500/25
                       transition-all duration-300"
            style={{ boxShadow: "0 0 20px rgba(250,204,21,0.15)" }}
          >
            {/* Animated shimmer overlay */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                         transition-transform duration-1000 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              }}
            />

            <div className="relative flex items-center gap-3">
              <motion.span
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                           bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500
                           border border-yellow-300/40"
                style={{ boxShadow: "0 0 14px rgba(250,204,21,0.5)" }}
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown size={16} className="text-black" />
              </motion.span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-yellow-300/90">
                    Super Admin
                  </p>
                  <ShieldCheck size={10} className="text-yellow-300/90" />
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  Open admin console
                </p>
              </div>

              <ArrowRight
                size={14}
                className="text-yellow-300 transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>
        )}

        {organization && (
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400/8 to-sky-400/8 border border-yellow-400/15">
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Organization</p>
            <p className="text-xs text-yellow-200 truncate font-semibold">{organization.name}</p>
            <p className="text-[10px] text-gray-500">{organization.industry} · {organization.plan}</p>
          </div>
        )}
        {username && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xs font-bold text-black">
              {username.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">{username}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
        >
          <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <LogOut size={16} />
          </span>
          Logout
        </button>
      </div>
    </>
  );
}

export default Sidebar;






// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LayoutDashboard,
//   Users,
//   UserPlus,
//   BarChart3,
//   Settings,
//   LogOut,
//   Zap,
//   X,
// } from "lucide-react";

// const navItems = [
//   { icon: LayoutDashboard, label: "Dashboard" },
//   { icon: UserPlus,        label: "Leads"     },
//   { icon: Users,           label: "Customers" },
//   { icon: BarChart3,       label: "Reports"   },
//   { icon: Settings,        label: "Settings"  },
// ];

// /* ── Variants ── */
// const sidebarVariant = {
//   hidden: { x: -280, opacity: 0 },
//   show:   { x: 0,    opacity: 1,
//     transition: { type: "spring", stiffness: 90, damping: 18 },
//   },
//   exit:   { x: -280, opacity: 0,
//     transition: { duration: 0.25, ease: "easeIn" },
//   },
// };

// const navStagger = {
//   hidden: {},
//   show:   { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
// };

// const navItemVariant = {
//   hidden: { opacity: 0, x: -20 },
//   show:   { opacity: 1, x: 0,
//     transition: { type: "spring", stiffness: 120, damping: 14 },
//   },
// };

// const overlayVariant = {
//   hidden: { opacity: 0 },
//   show:   { opacity: 1 },
//   exit:   { opacity: 0 },
// };

// /* ── Sidebar ── */
// function Sidebar({ sidebarOpen, setSidebarOpen }) {
//   const [active, setActive] = useState("Dashboard");

//   return (
//     <>
//       {/* ── Mobile Overlay ── */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.div
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
//             variants={overlayVariant}
//             initial="hidden"
//             animate="show"
//             exit="exit"
//             onClick={() => setSidebarOpen(false)}
//           />
//         )}
//       </AnimatePresence>

//       {/* ── Sidebar (Desktop: always visible, Mobile: animated) ── */}
//       {/* Desktop — always rendered, no AnimatePresence */}
//       <motion.aside
//         className="hidden md:flex fixed top-0 left-0 z-50 h-screen w-64 flex-col
//                    bg-gradient-to-b from-black via-gray-950 to-black
//                    border-r border-yellow-500/15
//                    shadow-[4px_0_30px_rgba(0,0,0,0.9)]"
//         initial={{ x: -60, opacity: 0 }}
//         animate={{ x: 0,   opacity: 1 }}
//         transition={{ type: "spring", stiffness: 80, damping: 16 }}
//       >
//         <SidebarContent active={active} setActive={setActive} setSidebarOpen={setSidebarOpen} />
//       </motion.aside>

//       {/* Mobile — AnimatePresence for mount/unmount */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <motion.aside
//             className="md:hidden fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
//                        bg-gradient-to-b from-black via-gray-950 to-black
//                        border-r border-yellow-500/15
//                        shadow-[4px_0_30px_rgba(0,0,0,0.9)]"
//             variants={sidebarVariant}
//             initial="hidden"
//             animate="show"
//             exit="exit"
//           >
//             <SidebarContent active={active} setActive={setActive} setSidebarOpen={setSidebarOpen} isMobile />
//           </motion.aside>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// /* ── Sidebar Inner Content ── */
// function SidebarContent({ active, setActive, setSidebarOpen, isMobile }) {
//   return (
//     <>
//       {/* Glow Edge */}
//       <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/40 via-sky-400/40 to-yellow-400/40" />

//       {/* ── Logo ── */}
//       <motion.div
//         className="h-16 flex items-center justify-between px-5 border-b border-yellow-500/15"
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1, duration: 0.4 }}
//       >
//         <div className="flex items-center gap-3">
//           <motion.div
//             className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/30"
//             style={{ boxShadow: "0 0 20px rgba(250,204,21,0.55)" }}
//             whileHover={{ rotate: 15, scale: 1.1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             <Zap size={17} className="text-black fill-black" />
//           </motion.div>
//           <span className="font-bold text-sm tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
//             CRM SUITE
//           </span>
//         </div>

//         {isMobile && (
//           <motion.button
//             className="text-gray-400 hover:text-white transition-colors"
//             onClick={() => setSidebarOpen(false)}
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <X size={20} />
//           </motion.button>
//         )}
//       </motion.div>

//       {/* ── Section Label ── */}
//       <motion.p
//         className="mt-6 mb-2 px-5 text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2 }}
//       >
//         Main Menu
//       </motion.p>

//       {/* ── Navigation ── */}
//       <motion.nav
//         className="flex-1 px-3 space-y-1"
//         variants={navStagger}
//         initial="hidden"
//         animate="show"
//       >
//         {navItems.map(({ icon: Icon, label }) => {
//           const isActive = active === label;
//           return (
//             <motion.button
//               key={label}
//               onClick={() => setActive(label)}
//               variants={navItemVariant}
//               whileHover={{ x: 4 }}
//               whileTap={{ scale: 0.97 }}
//               className={`relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl
//                           text-sm font-medium tracking-wide transition-colors duration-200
//                           ${isActive
//                             ? "bg-gradient-to-r from-yellow-500/12 to-sky-500/10 text-yellow-300 border border-yellow-500/25 shadow-[0_0_12px_rgba(250,204,21,0.1)]"
//                             : "text-gray-500 border border-transparent hover:bg-white/4 hover:text-sky-300 hover:border-sky-500/15"
//                           }`}
//             >
//               {/* Active left bar */}
//               <AnimatePresence>
//                 {isActive && (
//                   <motion.span
//                     className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-gradient-to-b from-yellow-400 to-sky-400"
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: 20, opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                     style={{ boxShadow: "0 0 8px rgba(250,204,21,0.8)" }}
//                   />
//                 )}
//               </AnimatePresence>

//               {/* Icon wrapper */}
//               <motion.span
//                 className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
//                             ${isActive
//                               ? "bg-gradient-to-br from-yellow-500/20 to-sky-500/15 border border-yellow-500/25"
//                               : "bg-white/4 border border-transparent"}`}
//                 whileHover={{ scale: 1.1 }}
//                 transition={{ type: "spring", stiffness: 400 }}
//               >
//                 <Icon size={17} className={isActive ? "text-yellow-400" : "text-gray-500"} />
//               </motion.span>

//               {label}

//               {/* Active dot */}
//               <AnimatePresence>
//                 {isActive && (
//                   <motion.span
//                     className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-br from-yellow-400 to-sky-400"
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     exit={{ scale: 0, opacity: 0 }}
//                     transition={{ type: "spring", stiffness: 400 }}
//                     style={{ boxShadow: "0 0 6px rgba(250,204,21,0.9)" }}
//                   />
//                 )}
//               </AnimatePresence>
//             </motion.button>
//           );
//         })}
//       </motion.nav>

//       {/* ── Divider ── */}
//       <motion.div
//         className="mx-4 h-px bg-gradient-to-r from-yellow-500/20 via-sky-500/20 to-yellow-500/20"
//         initial={{ scaleX: 0 }}
//         animate={{ scaleX: 1 }}
//         transition={{ delay: 0.6, duration: 0.5 }}
//       />

//       {/* ── User Card ── */}
//       <motion.div
//         className="mx-3 my-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/8 to-sky-500/8 border border-yellow-500/15"
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.65, duration: 0.4 }}
//         whileHover={{ scale: 1.02 }}
//       >
//         <div className="flex items-center gap-3">
//           <motion.div
//             className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center border border-yellow-300/30"
//             style={{ boxShadow: "0 0 12px rgba(250,204,21,0.4)" }}
//             whileHover={{ rotate: 5 }}
//           >
//             <span className="text-xs font-bold text-black">JD</span>
//           </motion.div>
//           <div className="min-w-0">
//             <p className="text-xs font-semibold text-gray-200 truncate">John Doe</p>
//             <p className="text-[10px] truncate bg-gradient-to-r from-yellow-400/70 to-sky-400/70 bg-clip-text text-transparent">
//               Admin
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       {/* ── Logout ── */}
//       <motion.div
//         className="px-3 pb-5"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.75 }}
//       >
//         <motion.button
//           className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-transparent hover:bg-red-500/8 hover:text-red-400 hover:border-red-500/15 transition-colors duration-200"
//           whileHover={{ x: 4 }}
//           whileTap={{ scale: 0.97 }}
//         >
//           <span className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center flex-shrink-0">
//             <LogOut size={16} />
//           </span>
//           Logout
//         </motion.button>
//       </motion.div>
//     </>
//   );
// }

// export default Sidebar;