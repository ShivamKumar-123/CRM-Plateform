import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, BarChart3, Activity, Crown, RefreshCw,
  UserPlus, Handshake, UserCheck, ArrowRight, Building2,
} from "lucide-react";
import { api } from "../../lib/api.js";
import {
  KpiCard, Panel, BarList, Empty, ErrorBanner, formatINR,
} from "./_shared.jsx";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 relative">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-500/15 blur-3xl" />
      </div>

      <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-3">
            <Crown size={12} className="text-yellow-400" />
            <span className="text-[10px] tracking-widest uppercase text-yellow-300 font-bold">
              Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Overview
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            System-wide metrics across every user, lead, deal, and payment.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs sm:text-sm flex-shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {loading && !stats ? (
        <div className="py-20 text-center text-gray-400">Loading stats…</div>
      ) : stats ? (
        <>
          {/* KPI cards — 4-col only at xl (1280px+) so values like ₹16,53,645.7 don't wrap mid-digit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              icon={Users}
              label="Users"
              value={stats.users.total}
              sub={`${stats.users.active} active · ${stats.users.superusers} super`}
              tint="from-yellow-400 to-amber-500"
            />
            <KpiCard
              icon={UserPlus}
              label="Leads"
              value={stats.leads.total}
              sub={`${stats.deals.total} deals`}
              tint="from-sky-400 to-blue-500"
            />
            <KpiCard
              icon={Activity}
              label="Revenue"
              value={formatINR(stats.payments.revenue)}
              sub={`${stats.payments.total} payments`}
              tint="from-emerald-400 to-green-500"
            />
            <KpiCard
              icon={Crown}
              label="Profit"
              value={formatINR(stats.deals.profit)}
              sub={`Won value: ${formatINR(stats.deals.won_value)}`}
              tint="from-pink-400 to-rose-500"
            />
          </div>

          {/* Quick links — 5-col only at xl so labels like "Organizations" don't truncate */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
            <QuickLink to="/admin/organizations" icon={Building2} label="Organizations" tint="amber" />
            <QuickLink to="/admin/users" icon={Users} label="Manage Users" tint="yellow" />
            <QuickLink to="/admin/leads" icon={UserPlus} label="All Leads" tint="sky" />
            <QuickLink to="/admin/deals" icon={Handshake} label="All Deals" tint="emerald" />
            <QuickLink to="/admin/customers" icon={UserCheck} label="Customers" tint="pink" />
          </div>

          {/* Distribution panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Panel title="Users by Role" accent="text-yellow-300">
              {stats.users.by_role.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.users.by_role.map((r) => ({
                    label: r.role || "—",
                    value: r.count,
                  }))}
                  max={stats.users.total}
                  color="yellow"
                />
              )}
            </Panel>

            <Panel title="Leads by Status" accent="text-sky-300">
              {stats.leads.by_status.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_status.map((r) => ({
                    label: r.status,
                    value: r.count,
                  }))}
                  max={stats.leads.total}
                  color="sky"
                />
              )}
            </Panel>

            <Panel title="Leads by Source" accent="text-emerald-300">
              {stats.leads.by_source.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_source.map((r) => ({
                    label: r.leads_source,
                    value: r.count,
                  }))}
                  max={stats.leads.total}
                  color="emerald"
                />
              )}
            </Panel>

            <Panel title="Leads by Brand" accent="text-pink-300">
              {stats.leads.by_brand.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_brand.map((r) => ({
                    label: r.brand_name,
                    value: r.count,
                  }))}
                  max={stats.leads.total}
                  color="pink"
                />
              )}
            </Panel>

            <Panel title="Top Performers (Won)" accent="text-yellow-300" full>
              {stats.top_performers.length === 0 ? (
                <Empty msg="No won deals yet." />
              ) : (
                <div className="space-y-2">
                  {stats.top_performers.map((p, i) => (
                    <div
                      key={p.assigned_to__username}
                      className="flex items-center gap-2 sm:gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                          i === 0
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate">
                          {p.assigned_to__username}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {p.won_count} won deal{p.won_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-emerald-400 flex-shrink-0 text-right">
                        {formatINR(p.won_value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}

const QUICK_LINK_TINT = {
  yellow: "from-yellow-400 to-amber-500",
  amber: "from-amber-400 to-orange-500",
  sky: "from-sky-400 to-blue-500",
  emerald: "from-emerald-400 to-green-500",
  pink: "from-pink-400 to-rose-500",
};

function QuickLink({ to, icon: Icon, label, tint }) {
  return (
    <Link
      to={to}
      title={label}
      className="group flex items-center justify-between gap-2 px-3 py-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 hover:bg-white/[0.07] transition-colors min-w-0"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${QUICK_LINK_TINT[tint]} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={16} className="text-black" />
        </span>
        <span className="text-xs sm:text-sm font-semibold truncate">{label}</span>
      </div>
      <ArrowRight
        size={14}
        className="text-gray-500 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all flex-shrink-0 hidden md:block"
      />
    </Link>
  );
}
