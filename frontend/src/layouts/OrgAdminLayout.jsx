import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, LayoutDashboard, Users, LogOut, Menu, X,
  ExternalLink,
  GitBranch, Sliders, Zap, MessageSquare, IndianRupee,
  History, ShieldCheck,
  Target, Trophy, Phone, Bookmark,
  Filter, FileSpreadsheet, Users2, Monitor, Workflow, BookOpen,
  Headphones, KeyRound,
  Sparkles, Activity, Database, Cloud, Bell as BellIcon,
  FileInput, PenTool,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

/**
 * Org-admin nav — curated subset of super-admin nav.
 * Excluded (super-admin only): Organizations, Plugins, API Docs, System,
 * cross-org Reports. Kept: everything that's org-scoped via `scope_qs`.
 */
const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/manage", end: true },
  { icon: Users, label: "Team", path: "/manage/users" },

  { divider: true, label: "Sales" },
  { icon: Target, label: "Lead Scoring", path: "/manage/lead-scoring" },
  { icon: Trophy, label: "Sales Targets", path: "/manage/sales-targets" },
  { icon: Phone, label: "Call Logs", path: "/manage/call-logs" },
  { icon: Bookmark, label: "Saved Views", path: "/manage/saved-views" },

  { divider: true, label: "Configuration" },
  { icon: GitBranch, label: "Pipelines", path: "/manage/pipelines" },
  { icon: Sliders, label: "Custom Fields", path: "/manage/custom-fields" },
  { icon: Zap, label: "Automation", path: "/manage/automation" },
  { icon: MessageSquare, label: "WhatsApp", path: "/manage/whatsapp" },
  { icon: IndianRupee, label: "Billing", path: "/manage/billing" },
  { icon: History, label: "Audit Logs", path: "/manage/audit-logs" },
  { icon: ShieldCheck, label: "Two-Factor", path: "/manage/two-factor" },

  { divider: true, label: "Operations" },
  { icon: Filter, label: "Filter Builder", path: "/manage/filters" },
  { icon: FileSpreadsheet, label: "Import / Export", path: "/manage/import-export" },
  { icon: Users2, label: "Lead Distribution", path: "/manage/distribution" },
  { icon: Workflow, label: "Approvals", path: "/manage/approvals" },
  { icon: Monitor, label: "Sessions", path: "/manage/sessions" },

  { divider: true, label: "Service" },
  { icon: Headphones, label: "Helpdesk", path: "/manage/helpdesk" },
  { icon: KeyRound, label: "Portal Tokens", path: "/manage/portal-tokens" },
  { icon: BookOpen, label: "Knowledge Base", path: "/manage/knowledge-base" },
  { icon: FileInput, label: "Forms", path: "/manage/forms" },
  { icon: PenTool, label: "E-Signature", path: "/manage/esign" },

  { divider: true, label: "Intelligence" },
  { icon: Sparkles, label: "AI Assistant", path: "/manage/ai" },
  { icon: Activity, label: "Analytics", path: "/manage/analytics" },
  { icon: LayoutDashboard, label: "Dashboard Builder", path: "/manage/dashboard-builder" },

  { divider: true, label: "Storage" },
  { icon: Database, label: "Backups", path: "/manage/backups" },
  { icon: Cloud, label: "Cloud Storage", path: "/manage/cloud-storage" },
  { icon: BellIcon, label: "Push", path: "/manage/push" },
];

export default function OrgAdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { username, logout, organization, isSuperUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const orgName = organization?.name || "Your Organization";
  const orgInitial = orgName.charAt(0).toUpperCase();

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
          border-r border-sky-500/20 shadow-[8px_0_40px_rgba(56,189,248,0.05)]
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Glow edge */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-sky-400/50 via-blue-400/50 to-sky-400/50" />

        {/* Brand */}
        <div className="px-5 py-5 border-b border-sky-500/15 flex items-center justify-between">
          <Link to="/manage" className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center border border-sky-300/40 flex-shrink-0"
              style={{ boxShadow: "0 0 20px rgba(56,189,248,0.6)" }}
            >
              <Building2 size={18} className="text-black" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase text-sky-400 font-bold">
                Org Admin
              </p>
              <p className="font-bold text-sm tracking-wide bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent truncate">
                {orgName}
              </p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-400 hover:text-white flex-shrink-0"
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
                      ? "bg-gradient-to-r from-sky-500/15 to-blue-500/10 text-sky-300 border border-sky-500/30 shadow-[0_0_14px_rgba(56,189,248,0.15)]"
                      : "text-gray-500 border border-transparent hover:bg-white/5 hover:text-sky-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="orgAdminActiveBar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gradient-to-b from-sky-400 to-blue-400"
                        style={{ boxShadow: "0 0 8px rgba(56,189,248,0.8)" }}
                      />
                    )}
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-gradient-to-br from-sky-500/25 to-blue-500/20 border border-sky-500/30"
                          : "bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={isActive ? "text-sky-400" : "text-gray-400"}
                      />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="my-4 mx-1 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

          <Link
            to="/app"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-emerald-300 border border-transparent hover:border-emerald-500/15"
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
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sky-400/5 border border-sky-500/20">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-sm font-bold text-black">
                {orgInitial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{username}</p>
                <p className="text-[10px] text-sky-400 tracking-wider uppercase font-bold">
                  {isSuperUser ? "Super (Preview)" : "Organization Admin"}
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
        <header className="md:hidden sticky top-0 z-30 px-4 py-3 bg-black/80 backdrop-blur-xl border-b border-sky-500/15 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-sky-500/20 flex items-center justify-center text-sky-300"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={14} className="text-sky-400 flex-shrink-0" />
            <span className="text-xs tracking-widest uppercase text-sky-300 font-bold truncate">
              {orgName}
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
