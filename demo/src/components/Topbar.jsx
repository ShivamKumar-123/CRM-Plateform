import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, ChevronDown, LogOut, User, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import IndustrySwitcher from "./IndustrySwitcher.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Topbar({ onMenu }) {
  const { user, logout, resetDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleReset() {
    if (confirm("Reset all demo data? This wipes leads, deals, customers and your account.")) {
      resetDemo();
      navigate("/");
    }
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/60 border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>

          <div className="relative max-w-md flex-1 hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search leads, deals, customers…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IndustrySwitcher />
          <ThemeToggle />
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-xs font-bold">
                {user?.avatar || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium leading-tight">{user?.name}</div>
                <div className="text-xs text-gray-500 leading-tight">{user?.role}</div>
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-950 border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-white/5">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  {user?.company && (
                    <div className="text-xs text-gray-500 mt-0.5">{user.company}</div>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setOpen(false); navigate("/app/settings"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    <User size={14} /> Settings
                  </button>
                  <button
                    onClick={() => { setOpen(false); handleReset(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-300 hover:bg-yellow-400/10"
                  >
                    <RotateCcw size={14} /> Reset demo data
                  </button>
                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
