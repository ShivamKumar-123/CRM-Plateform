import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, User, Zap } from "lucide-react";

/* ── Variants ── */
const navbarVariant = {
  hidden: { y: -80, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};

const linkStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const linkVariant = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 14 },
  },
};

const rightStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};

const rightItemVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 14 },
  },
};

const mobileMenuVariant = {
  hidden: { opacity: 0, height: 0 },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const mobileItemStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const mobileItemVariant = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 150, damping: 14 },
  },
};

/* ── Navbar ── */
function Navbar({ setSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Leads", path: "/leads" },
    { name: "Customers", path: "/customers" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <motion.nav
      className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-950 to-black border-b border-yellow-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
      variants={navbarVariant}
      initial="hidden"
      animate="show"
    >
      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 via-sky-400 to-yellow-400" />
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
          >
            {setSidebarOpen && (
              <motion.button
                className="md:hidden w-9 h-9 rounded-xl bg-white/4 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mr-1"
                onClick={() => setSidebarOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu size={18} />
              </motion.button>
            )}

            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/30"
              style={{ boxShadow: "0 0 18px rgba(250,204,21,0.5)" }}
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap size={17} className="text-black fill-black" />
            </motion.div>

            <span className="hidden sm:block font-bold text-sm tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
              CRM DASHBOARD
            </span>
          </motion.div>

          {/* Desktop Links */}
          <motion.div
            className="hidden md:flex items-center gap-8"
            variants={linkStagger}
            initial="hidden"
            animate="show"
          >
            {navItems.map((item) => (
              <motion.div key={item.name} variants={linkVariant}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `relative text-sm font-medium tracking-wide transition-colors duration-200 pb-1 ${
                      isActive
                        ? "text-yellow-300"
                        : "text-gray-400 hover:text-sky-300"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            className="absolute bottom-0 left-0 right-0 h-px rounded-full bg-gradient-to-r from-yellow-400 to-sky-400"
                            layoutId="activeUnderline"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Section (unchanged) */}
          <motion.div
            className="hidden md:flex items-center gap-3"
            variants={rightStagger}
            initial="hidden"
            animate="show"
          >
            <motion.button
              variants={rightItemVariant}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 rounded-xl bg-white/4 border border-sky-500/20 flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 hover:border-sky-400/40 transition-colors duration-200"
            >
              <Bell size={18} />
              <motion.span
                className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-black text-[10px] font-bold flex items-center justify-center border-2 border-black"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                style={{ boxShadow: "0 0 8px rgba(250,204,21,0.7)" }}
              >
                3
              </motion.span>
            </motion.button>

            <motion.button
              variants={rightItemVariant}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-sky-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-sky-500/20 hover:border-yellow-400/40 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                <User size={13} className="text-black" />
              </div>
              <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-yellow-300 to-sky-300 bg-clip-text text-transparent">
                My Account
              </span>
            </motion.button>
          </motion.div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-gradient-to-b from-gray-950 to-black border-t border-yellow-500/10 px-5 pb-5 pt-3 overflow-hidden"
            variants={mobileMenuVariant}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.div
              className="space-y-1"
              variants={mobileItemStagger}
              initial="hidden"
              animate="show"
            >
              {navItems.map((item) => (
                <motion.div key={item.name} variants={mobileItemVariant}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide border transition-colors duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-yellow-500/10 to-sky-500/10 border-yellow-500/25 text-yellow-300"
                          : "border-transparent text-gray-400 hover:bg-white/4 hover:text-sky-300"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;

























// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X, Bell, User, Zap } from "lucide-react";

// /* ── Variants ── */
// const navbarVariant = {
//   hidden: { y: -80, opacity: 0 },
//   show:   { y: 0,   opacity: 1,
//     transition: { type: "spring", stiffness: 90, damping: 16 },
//   },
// };

// const linkStagger = {
//   hidden: {},
//   show:   { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
// };

// const linkVariant = {
//   hidden: { opacity: 0, y: -10 },
//   show:   { opacity: 1, y: 0,
//     transition: { type: "spring", stiffness: 150, damping: 14 },
//   },
// };

// const rightStagger = {
//   hidden: {},
//   show:   { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
// };

// const rightItemVariant = {
//   hidden: { opacity: 0, scale: 0.8 },
//   show:   { opacity: 1, scale: 1,
//     transition: { type: "spring", stiffness: 200, damping: 14 },
//   },
// };

// const mobileMenuVariant = {
//   hidden: { opacity: 0, height: 0 },
//   show:   { opacity: 1, height: "auto",
//     transition: { duration: 0.3, ease: "easeOut" },
//   },
//   exit:   { opacity: 0, height: 0,
//     transition: { duration: 0.2, ease: "easeIn" },
//   },
// };

// const mobileItemStagger = {
//   hidden: {},
//   show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
// };

// const mobileItemVariant = {
//   hidden: { opacity: 0, x: -16 },
//   show:   { opacity: 1, x: 0,
//     transition: { type: "spring", stiffness: 150, damping: 14 },
//   },
// };

// /* ── Navbar ── */
// function Navbar({ setSidebarOpen }) {
//   const [isOpen, setIsOpen]     = useState(false);
//   const [activeItem, setActive] = useState("Dashboard");
//   const navItems = ["Dashboard", "Leads", "Customers", "Reports"];

//   return (
//     <motion.nav
//       className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-950 to-black border-b border-yellow-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
//       variants={navbarVariant}
//       initial="hidden"
//       animate="show"
//     >
//       {/* Bottom shimmer */}
//       <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-yellow-400 via-sky-400 to-yellow-400" />
//       {/* Top glow */}
//       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

//       <div className="max-w-7xl mx-auto px-6">
//         <div className="flex items-center justify-between h-16">

//           {/* ── Logo ── */}
//           <motion.div
//             className="flex items-center gap-3"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
//           >
//             {/* Hamburger for mobile sidebar toggle */}
//             {setSidebarOpen && (
//               <motion.button
//                 className="md:hidden w-9 h-9 rounded-xl bg-white/4 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mr-1"
//                 onClick={() => setSidebarOpen(true)}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Menu size={18} />
//               </motion.button>
//             )}

//             <motion.div
//               className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center border border-yellow-300/30"
//               style={{ boxShadow: "0 0 18px rgba(250,204,21,0.5)" }}
//               whileHover={{ rotate: 15, scale: 1.1 }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               <Zap size={17} className="text-black fill-black" />
//             </motion.div>

//             <span className="hidden sm:block font-bold text-sm tracking-widest bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
//               CRM DASHBOARD
//             </span>
//           </motion.div>

//           {/* ── Desktop Nav Links ── */}
//           <motion.div
//             className="hidden md:flex items-center gap-8"
//             variants={linkStagger}
//             initial="hidden"
//             animate="show"
//           >
//             {navItems.map((item) => (
//               <motion.a
//                 key={item}
//                 href="#"
//                 onClick={(e) => { e.preventDefault(); setActive(item); }}
//                 variants={linkVariant}
//                 whileHover={{ y: -2 }}
//                 className={`relative text-sm font-medium tracking-wide transition-colors duration-200 pb-1
//                   ${activeItem === item ? "text-yellow-300" : "text-gray-400 hover:text-sky-300"}`}
//               >
//                 {item}
//                 <AnimatePresence>
//                   {activeItem === item && (
//                     <motion.span
//                       className="absolute bottom-0 left-0 right-0 h-px rounded-full bg-gradient-to-r from-yellow-400 to-sky-400"
//                       layoutId="activeUnderline"
//                       initial={{ scaleX: 0 }}
//                       animate={{ scaleX: 1 }}
//                       exit={{ scaleX: 0 }}
//                       transition={{ type: "spring", stiffness: 200, damping: 20 }}
//                     />
//                   )}
//                 </AnimatePresence>
//               </motion.a>
//             ))}
//           </motion.div>

//           {/* ── Desktop Right Actions ── */}
//           <motion.div
//             className="hidden md:flex items-center gap-3"
//             variants={rightStagger}
//             initial="hidden"
//             animate="show"
//           >
//             {/* Bell */}
//             <motion.button
//               variants={rightItemVariant}
//               whileHover={{ scale: 1.08, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               className="relative w-10 h-10 rounded-xl bg-white/4 border border-sky-500/20 flex items-center justify-center text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 hover:border-sky-400/40 transition-colors duration-200"
//               style={{ filter: "drop-shadow(0 0 0px transparent)" }}
//             >
//               <Bell size={18} />
//               <motion.span
//                 className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-black text-[10px] font-bold flex items-center justify-center border-2 border-black"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
//                 style={{ boxShadow: "0 0 8px rgba(250,204,21,0.7)" }}
//               >
//                 3
//               </motion.span>
//             </motion.button>

//             {/* User pill */}
//             <motion.button
//               variants={rightItemVariant}
//               whileHover={{ scale: 1.04, y: -2 }}
//               whileTap={{ scale: 0.97 }}
//               className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-sky-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-sky-500/20 hover:border-yellow-400/40 transition-all duration-200"
//             >
//               <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center"
//                 style={{ boxShadow: "0 0 8px rgba(250,204,21,0.4)" }}>
//                 <User size={13} className="text-black" />
//               </div>
//               <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-yellow-300 to-sky-300 bg-clip-text text-transparent">
//                 My Account
//               </span>
//             </motion.button>
//           </motion.div>

//           {/* ── Mobile Controls ── */}
//           <div className="md:hidden flex items-center gap-2">
//             <motion.button
//               className="relative w-9 h-9 rounded-xl bg-white/4 border border-sky-500/20 flex items-center justify-center text-sky-400"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.4 }}
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Bell size={16} />
//               <span className="absolute -top-1.5 -right-1.5 w-[17px] h-[17px] rounded-full bg-yellow-400 text-black text-[10px] font-bold flex items-center justify-center border-2 border-black">
//                 3
//               </span>
//             </motion.button>

//             <motion.button
//               onClick={() => setIsOpen(!isOpen)}
//               className="w-9 h-9 rounded-xl bg-white/4 border border-yellow-500/25 flex items-center justify-center text-yellow-400"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.45 }}
//               whileHover={{ scale: 1.08 }}
//               whileTap={{ scale: 0.9 }}
//             >
//               <AnimatePresence mode="wait">
//                 {isOpen
//                   ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
//                   : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={20} /></motion.span>
//                 }
//               </AnimatePresence>
//             </motion.button>
//           </div>

//         </div>
//       </div>

//       {/* ── Mobile Menu ── */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="md:hidden bg-gradient-to-b from-gray-950 to-black border-t border-yellow-500/10 px-5 pb-5 pt-3 overflow-hidden"
//             variants={mobileMenuVariant}
//             initial="hidden"
//             animate="show"
//             exit="exit"
//           >
//             <motion.div
//               className="space-y-1"
//               variants={mobileItemStagger}
//               initial="hidden"
//               animate="show"
//             >
//               {navItems.map((item) => (
//                 <motion.a
//                   key={item}
//                   href="#"
//                   onClick={(e) => { e.preventDefault(); setActive(item); setIsOpen(false); }}
//                   variants={mobileItemVariant}
//                   whileHover={{ x: 4 }}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide border transition-colors duration-200
//                     ${activeItem === item
//                       ? "bg-gradient-to-r from-yellow-500/10 to-sky-500/10 border-yellow-500/25 text-yellow-300"
//                       : "border-transparent text-gray-400 hover:bg-white/4 hover:text-sky-300"}`}
//                 >
//                   <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
//                     ${activeItem === item ? "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]" : "bg-gray-600"}`}
//                   />
//                   {item}
//                 </motion.a>
//               ))}
//             </motion.div>

//             <motion.div
//               className="my-3 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"
//               initial={{ scaleX: 0 }}
//               animate={{ scaleX: 1 }}
//               transition={{ delay: 0.3 }}
//             />

//             <motion.button
//               className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-sky-500/10 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-sky-500/20 transition-all duration-200"
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.35 }}
//               whileTap={{ scale: 0.97 }}
//             >
//               <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
//                 <User size={13} className="text-black" />
//               </div>
//               <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-yellow-300 to-sky-300 bg-clip-text text-transparent">
//                 My Account
//               </span>
//             </motion.button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.nav>
//   );
// }

// export default Navbar;