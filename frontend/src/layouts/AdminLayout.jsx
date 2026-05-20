import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, LayoutDashboard, Users, UserPlus, Handshake,
  UserCheck, BarChart3, Server, LogOut, Menu, X,
  ExternalLink, Building2,
  GitBranch, Sliders, Zap, MessageSquare, IndianRupee,
  History, ShieldCheck,
  Target, Trophy, Phone, Bookmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin", end: true },
  { icon: Building2, label: "Organizations", path: "/admin/organizations" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: UserPlus, label: "Leads", path: "/admin/leads" },
  { icon: Handshake, label: "Deals", path: "/admin/deals" },
  { icon: UserCheck, label: "Customers", path: "/admin/customers" },
  { divider: true, label: "Sales" },
  { icon: Target, label: "Lead Scoring", path: "/admin/lead-scoring" },
  { icon: Trophy, label: "Sales Targets", path: "/admin/sales-targets" },
  { icon: Phone, label: "Call Logs", path: "/admin/call-logs" },
  { icon: Bookmark, label: "Saved Views", path: "/admin/saved-views" },
  { divider: true, label: "Platform" },
  { icon: GitBranch, label: "Pipelines", path: "/admin/pipelines" },
  { icon: Sliders, label: "Custom Fields", path: "/admin/custom-fields" },
  { icon: Zap, label: "Automation", path: "/admin/automation" },
  { icon: MessageSquare, label: "WhatsApp", path: "/admin/whatsapp" },
  { icon: IndianRupee, label: "Billing", path: "/admin/billing" },
  { icon: History, label: "Audit Logs", path: "/admin/audit-logs" },
  { icon: ShieldCheck, label: "Two-Factor", path: "/admin/two-factor" },
  { divider: true, label: "Insights" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
  { icon: Server, label: "System", path: "/admin/system" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col
          bg-gradient-to-b from-black via-gray-950 to-black
          border-r border-yellow-500/20 shadow-[8px_0_40px_rgba(250,204,21,0.05)]
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Glow edge */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-yellow-400/50 via-amber-400/50 to-yellow-400/50" />

        {/* Brand */}
        <div className="px-5 py-5 border-b border-yellow-500/15 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 flex items-center justify-center border border-yellow-300/40"
              style={{ boxShadow: "0 0 20px rgba(250,204,21,0.6)" }}
            >
              <Crown size={18} className="text-black" />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-yellow-400 font-bold">
                Super Admin
              </p>
              <p className="font-bold text-sm tracking-wide bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                CRM Console
              </p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item, i) => {
            if (item.divider) {
              return (
                <div key={`div-${i}`} className="px-3 pt-4 pb-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">
                    {item.label}
                  </p>
                </div>
              );
            }
            const { icon: Icon, label, path, end } = item;
            return (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 text-yellow-300 border border-yellow-500/30 shadow-[0_0_14px_rgba(250,204,21,0.15)]"
                    : "text-gray-500 border border-transparent hover:bg-white/5 hover:text-yellow-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="adminActiveBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-yellow-400 to-amber-400"
                      style={{ boxShadow: "0 0 8px rgba(250,204,21,0.8)" }}
                    />
                  )}
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? "bg-gradient-to-br from-yellow-500/25 to-amber-500/20 border border-yellow-500/30"
                        : "bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-yellow-400" : "text-gray-400"}
                    />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
            );
          })}

          <div className="my-4 mx-1 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />

          <Link
            to="/app"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-sky-300 border border-transparent hover:border-sky-500/15"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <ExternalLink size={14} />
            </span>
            Exit to user app
          </Link>
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-5 space-y-2">
          {username && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-yellow-400/5 border border-yellow-500/20">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-sm font-bold text-black">
                {username.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{username}</p>
                <p className="text-[10px] text-yellow-400 tracking-wider uppercase font-bold">
                  Super User
                </p>
              </div>
              <ThemeToggle />
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <LogOut size={14} />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-yellow-500/15 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-yellow-500/20 flex items-center justify-center text-yellow-300"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs tracking-widest uppercase text-yellow-300 font-bold">
              Super Admin
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
