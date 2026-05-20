import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, LayoutDashboard, MessageSquare, FileText, IndianRupee, LogOut } from "lucide-react";
import { api } from "../../lib/api.js";

const PORTAL_TOKEN_KEY = "crm_portal_token";

export const portalAuth = {
  get: () => localStorage.getItem(PORTAL_TOKEN_KEY),
  set: (v) => localStorage.setItem(PORTAL_TOKEN_KEY, v),
  clear: () => localStorage.removeItem(PORTAL_TOKEN_KEY),
};

const navItems = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/portal/tickets", label: "Support tickets", icon: MessageSquare },
  { to: "/portal/invoices", label: "Invoices", icon: IndianRupee },
  { to: "/portal/documents", label: "Documents", icon: FileText },
];

export default function PortalLayout() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const t = portalAuth.get();
    if (!t) { navigate("/portal/login", { replace: true }); return; }
    api.portal.me(t)
      .then(setMe)
      .catch((e) => {
        setErr(e.message);
        if (e.status === 401) { portalAuth.clear(); navigate("/portal/login", { replace: true }); }
      });
  }, [navigate]);

  function logout() {
    portalAuth.clear();
    navigate("/portal/login", { replace: true });
  }

  if (!me) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-sm text-gray-400">Loading portal…</div>;

  const org = me.organization || {};
  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 border-r border-white/5 hidden md:flex md:flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: org.primary_color || "#facc15" }}>
              <Building2 size={16} className="text-black" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{org.name || "Customer Portal"}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">customer view</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 text-yellow-300 border border-yellow-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="text-xs text-gray-400 mb-2">Signed in as</div>
          <div className="text-sm font-medium truncate">{me.email}</div>
          <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-300">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden border-b border-white/5 p-4 flex items-center justify-between">
          <span className="font-bold">{org.name}</span>
          <button onClick={logout} className="text-xs text-gray-400"><LogOut size={14} /></button>
        </div>
        <Outlet context={{ me }} />
      </main>
    </div>
  );
}
