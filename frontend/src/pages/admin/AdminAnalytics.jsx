import { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, Target, Activity, DollarSign } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ComposedChart, Line,
} from "recharts";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty, KpiCard } from "./_shared.jsx";

const tooltipStyle = {
  background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", color: "#fff", fontSize: "12px",
};

export default function AdminAnalytics() {
  const [forecast, setForecast] = useState(null);
  const [cohort, setCohort] = useState([]);
  const [churn, setChurn] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [exec, setExec] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsForecast(12).then(setForecast),
      api.getAnalyticsCohort(8).then(setCohort),
      api.getAnalyticsChurn().then(setChurn),
      api.getAnalyticsFunnel().then(setFunnel),
      api.getAnalyticsExecutive().then(setExec),
    ]).catch((e) => setErr(e.message));
  }, []);

  const forecastSeries = forecast
    ? [
        ...forecast.history.map((h) => ({ name: h.month, actual: h.revenue, predicted: null })),
        ...forecast.forecast.map((f) => ({ name: `+${f.month_offset}m`, actual: null, predicted: f.predicted_revenue })),
      ]
    : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Activity className="text-yellow-400" /> Advanced analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">Forecasting, cohort, churn, funnel intelligence.</p>
      </header>
      {err && <ErrorBanner msg={err} />}

      {exec && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={TrendingUp} label="New leads (30d)" value={exec.new_leads}
            sub={exec.new_leads_delta_pct != null ? `${exec.new_leads_delta_pct > 0 ? "+" : ""}${exec.new_leads_delta_pct}% vs prev` : "—"}
            tint="from-yellow-400 to-amber-500" />
          <KpiCard icon={DollarSign} label="Revenue won (30d)" value={`₹${Math.round((exec.won_revenue || 0) / 100000)}L`}
            sub={exec.won_revenue_delta_pct != null ? `${exec.won_revenue_delta_pct > 0 ? "+" : ""}${exec.won_revenue_delta_pct}%` : "—"}
            tint="from-emerald-400 to-green-500" />
          <KpiCard icon={Target} label="Payments collected" value={`₹${Math.round((exec.payments_collected || 0) / 100000)}L`}
            sub="last 30 days" tint="from-sky-400 to-blue-500" />
          <KpiCard icon={AlertTriangle} label="Churn rate" value={`${exec.churn?.churn_rate_pct ?? 0}%`}
            sub={`${exec.churn?.stale ?? 0} stale leads`} tint="from-rose-400 to-red-500" />
        </div>
      )}

      <Panel title="Revenue forecast" accent="text-yellow-300">
        {forecastSeries.length === 0 ? <Empty msg="Not enough deal history to forecast." /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastSeries}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="actual" stroke="#facc15" fill="#facc15" fillOpacity={0.3} />
                <Line type="monotone" dataKey="predicted" stroke="#38bdf8" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Cohort analysis (last 8 weeks)" accent="text-sky-300">
          {cohort.length === 0 ? <Empty msg="No cohorts yet." /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohort}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="cohort" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="size" fill="#38bdf8" name="Cohort size" />
                  <Bar dataKey="won_within_window" fill="#34d399" name="Won within window" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Funnel intelligence" accent="text-emerald-300">
          {funnel.length === 0 ? <Empty msg="No leads to analyse." /> : (
            <div className="space-y-2">
              {funnel.map((row) => (
                <div key={row.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{row.stage}</span>
                    <span className="text-gray-400">{row.count} ({row.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" style={{ width: `${row.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
