import { useEffect, useMemo, useState } from "react";
import { UserCheck, Search, Mail, Phone, MapPin } from "lucide-react";
import { api } from "../../lib/api.js";
import {
  ErrorBanner, StatusBadge, formatINR, LEAD_STATUS_PALETTE,
} from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

/**
 * Customers = leads that have either reached DEALED status OR have a deal attached.
 * For now we approximate by status == DEALED (production-correct) plus an option
 * to show all leads as "potential customers".
 */
export default function AdminCustomers() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("customers"); // 'customers' | 'all'

  const load = () => {
    setLoading(true);
    setError("");
    api.getLeads()
      .then((d) => setLeads(d?.leads || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (filter === "customers" && l.status !== "DEALED") return false;
      if (!q) return true;
      return (
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(search) ||
        l.city?.toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q)
      );
    });
  }, [search, leads, filter]);

  const dealedCount = leads.filter((l) => l.status === "DEALED").length;

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Customers"
        subtitle={`${dealedCount} closed customers · ${leads.length} total leads`}
        onRefresh={load}
        refreshing={loading}
        accent={UserCheck}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          <FilterChip active={filter === "customers"} onClick={() => setFilter("customers")}>
            Closed customers
          </FilterChip>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All leads
          </FilterChip>
        </div>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {filtered.length === 0 && !loading ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 py-16 text-center text-gray-500">
          {leads.length === 0
            ? "No leads in the system yet."
            : filter === "customers"
              ? "No customers have closed yet — no leads have reached DEALED status."
              : "No matches."}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CustomerCard key={c.id} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function CustomerCard({ customer: c }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex flex-col gap-3 hover:border-yellow-400/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black font-bold flex-shrink-0">
            {(c.name || "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{c.name}</p>
            <p className="text-xs text-gray-500 font-mono">#{c.id}</p>
          </div>
        </div>
        <StatusBadge status={c.status} palette={LEAD_STATUS_PALETTE} />
      </div>

      <div className="space-y-1.5 text-xs">
        {c.phone && (
          <Row icon={Phone} text={c.phone} />
        )}
        {c.email && (
          <Row icon={Mail} text={c.email} />
        )}
        {(c.city || c.state) && (
          <Row icon={MapPin} text={[c.city, c.state].filter(Boolean).join(", ")} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
        <Metric label="Brand" value={c.brand_name} />
        <Metric label="Capacity" value={c.watt_capacity} />
        <Metric label="Base ₹" value={formatINR(c.base_price)} />
      </div>

      {c.assigned_to_username && (
        <p className="text-[11px] text-gray-500">
          Owner: <span className="text-gray-300">{c.assigned_to_username}</span>
        </p>
      )}
    </div>
  );
}

function Row({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={12} className="text-yellow-400 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-gray-200 font-semibold truncate">{value}</p>
    </div>
  );
}
