import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, IndianRupee, FileText, Briefcase, ArrowRight, Hand } from "lucide-react";
import { api } from "../../lib/api.js";
import { portalAuth } from "./PortalLayout.jsx";

const TILES = [
  { key: "open_tickets", label: "Open tickets", icon: MessageSquare, to: "/portal/tickets", color: "from-yellow-400 to-amber-500" },
  { key: "invoices", label: "Invoices", icon: IndianRupee, to: "/portal/invoices", color: "from-emerald-400 to-green-500" },
  { key: "deals", label: "Active deals", icon: Briefcase, to: "/portal/tickets", color: "from-sky-400 to-blue-500" },
  { key: "leads", label: "Your records", icon: FileText, to: "/portal/documents", color: "from-fuchsia-400 to-pink-500" },
];

export default function PortalDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const t = portalAuth.get();
    api.portal.dashboard(t).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        Welcome back <Hand size={24} className="text-yellow-400" />
      </h1>
      <p className="text-sm text-gray-400 mb-8">Here's a quick summary of your activity.</p>

      {err && <div className="text-sm text-red-300 mb-4">{err}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TILES.map((t) => (
          <Link
            key={t.key}
            to={t.to}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/30 transition group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
              <t.icon size={16} className="text-black" />
            </div>
            <div className="text-3xl font-bold tabular-nums">{data?.[t.key] ?? "—"}</div>
            <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
              <span>{t.label}</span>
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-yellow-400/10 via-amber-500/5 to-transparent border border-yellow-400/20">
        <h3 className="text-lg font-semibold mb-1">Need help?</h3>
        <p className="text-sm text-gray-400 mb-4">Open a support ticket and our team will respond per the agreed SLA.</p>
        <Link to="/portal/tickets" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black font-bold text-sm">
          <MessageSquare size={14} /> Open a ticket
        </Link>
      </div>
    </div>
  );
}
