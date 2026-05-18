import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, RefreshCw, TrendingUp, IndianRupee, Crown, Activity,
} from "lucide-react";
import { api } from "../../lib/api.js";
import {
  KpiCard, Panel, BarList, Empty, ErrorBanner, formatINR,
} from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export default function AdminReports() {
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
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Reports"
        subtitle="Trends, distributions, and bottom-line metrics."
        onRefresh={load}
        refreshing={loading}
        accent={BarChart3}
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {loading && !stats ? (
        <div className="py-20 text-center text-gray-400">Loading reports…</div>
      ) : stats ? (
        <>
          {/* Headline KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              icon={IndianRupee}
              label="Total revenue"
              value={formatINR(stats.payments.revenue)}
              sub={`${stats.payments.total} payments`}
              tint="from-emerald-400 to-green-500"
            />
            <KpiCard
              icon={Crown}
              label="Total profit"
              value={formatINR(stats.deals.profit)}
              sub="From won deals"
              tint="from-yellow-400 to-amber-500"
            />
            <KpiCard
              icon={TrendingUp}
              label="Won deal value"
              value={formatINR(stats.deals.won_value)}
              sub={`Open: ${formatINR(stats.deals.open_value)}`}
              tint="from-sky-400 to-blue-500"
            />
            <KpiCard
              icon={Activity}
              label="Conversion"
              value={
                stats.deals.total
                  ? `${(
                      ((stats.deals.by_status.find((s) => s.status === "WON")?.count || 0) /
                        stats.deals.total) *
                      100
                    ).toFixed(1)}%`
                  : "0%"
              }
              sub={`${stats.deals.total} deals`}
              tint="from-pink-400 to-rose-500"
            />
          </div>

          {/* Deals by month chart */}
          <Panel title="Deals by month (last 6)" accent="text-yellow-300" full>
            {stats.deals.by_month.length === 0 ? (
              <Empty />
            ) : (
              <MonthlyChart data={[...stats.deals.by_month].reverse()} />
            )}
          </Panel>

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Deal status distribution" accent="text-sky-300">
              {stats.deals.by_status.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.deals.by_status.map((r) => ({ label: r.status, value: r.count }))}
                  max={stats.deals.total}
                  color="sky"
                />
              )}
            </Panel>

            <Panel title="Lead status distribution" accent="text-emerald-300">
              {stats.leads.by_status.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_status.map((r) => ({ label: r.status, value: r.count }))}
                  max={stats.leads.total}
                  color="emerald"
                />
              )}
            </Panel>

            <Panel title="Leads by source" accent="text-pink-300">
              {stats.leads.by_source.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_source.map((r) => ({ label: r.leads_source, value: r.count }))}
                  max={stats.leads.total}
                  color="pink"
                />
              )}
            </Panel>

            <Panel title="Leads by brand" accent="text-violet-300">
              {stats.leads.by_brand.length === 0 ? (
                <Empty />
              ) : (
                <BarList
                  data={stats.leads.by_brand.map((r) => ({ label: r.brand_name, value: r.count }))}
                  max={stats.leads.total}
                  color="violet"
                />
              )}
            </Panel>

            <Panel title="Top performers" accent="text-yellow-300" full>
              {stats.top_performers.length === 0 ? (
                <Empty msg="No won deals yet." />
              ) : (
                <div className="space-y-2">
                  {stats.top_performers.map((p, i) => (
                    <div key={p.assigned_to__username}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black" : "bg-white/10 text-gray-300"
                      }`}>#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.assigned_to__username}</p>
                        <p className="text-xs text-gray-500">{p.won_count} won deal{p.won_count !== 1 ? "s" : ""}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-400">{formatINR(p.won_value)}</p>
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

function MonthlyChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <div className="h-40 flex items-end justify-around gap-3">
        {data.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-xs text-white font-semibold">{d.count}</p>
              <div className="w-full bg-white/5 rounded-t-md overflow-hidden flex items-end" style={{ height: 140 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-yellow-500 to-amber-300"
                />
              </div>
              <p className="text-[10px] text-gray-500">{monthLabel(d.month)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
