import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  BarChart3,
  Workflow,
  Command,
  Settings as SettingsIcon,
  X,
} from "lucide-react";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/deals", label: "Deals", icon: Briefcase },
  { to: "/app/customers", label: "Customers", icon: UserCircle },
  { to: "/app/reports", label: "Reports", icon: BarChart3 },
  { to: "/app/automation", label: "Automation", icon: Workflow },
  { to: "/app/command-center", label: "Command center", icon: Command },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : undefined }}
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-black via-gray-950 to-black border-r border-white/5 flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Zap size={16} className="text-black fill-black" />
            </div>
            <span className="font-bold tracking-wider">CRM<span className="text-yellow-400">.</span>demo</span>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition relative group ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-400/15 to-transparent text-yellow-300 border border-yellow-400/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-yellow-400 to-amber-500"
                    />
                  )}
                  <l.icon size={17} />
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div className="rounded-xl p-4 bg-gradient-to-br from-yellow-400/10 via-amber-500/5 to-transparent border border-yellow-400/15">
            <div className="text-xs text-yellow-300 font-semibold mb-1">Demo mode</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Data lives in your browser. Use Settings → Reset to start over.
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
