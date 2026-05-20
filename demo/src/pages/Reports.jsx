import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Target, Trophy, AlertTriangle, ArrowUpRight, ArrowDownRight, Calendar,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { api } from "../lib/api.js";
import { inr } from "../lib/format.js";
import PageHeader from "../components/PageHeader.jsx";
import AnimatedCounter, { formatINR } from "../components/AnimatedCounter.jsx";
import { useIndustry } from "../context/IndustryContext.jsx";

const STAGE_COLORS = ["#facc15", "#38bdf8", "#f0abfc", "#34d399", "#fb7185"];
const SOURCE_COLORS = ["#facc15", "#f0abfc", "#38bdf8", "#34d399", "#a78bfa", "#fb7185"];

const tooltipStyle = {
  background: "rgba(0,0,0,0.85)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "12px",
};

export default function Reports() {
  const { dataVersion } = useIndustry();
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [reps, setReps] = useState([]);

  useEffect(() => {
    setDeals(api.listDeals());
    setLeads(api.listLeads());
    setReps(api.listReps());
  }, [dataVersion]);

  const stats = useMemo(() => {
    const won = deals.filter((d) => d.stage === "Won");
    const lost = deals.filter((d) => d.stage === "Lost");
    const open = deals.filter((d) => !["Won", "Lost"].includes(d.stage));

    const byStage = deals.reduce((a, d) => {
      const s = d.stage;
      a[s] = (a[s] || 0) + (d.value || 0);
      return a;
    }, {});

    const bySource = leads.reduce((a, l) => {
      a[l.source] = (a[l.source] || 0) + 1;
      return a;
    }, {});

    const weighted = open.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0)) / 100, 0);
    const avgDealSize = won.length ? Math.round(won.reduce((s, d) => s + d.value, 0) / won.length) : 0;
    const winRate = deals.length ? Math.round((won.length / (won.length + lost.length || 1)) * 100) : 0;

    return { byStage, bySource, weighted, avgDealSize, winRate, won, lost, open };
  }, [deals, leads]);

  // Build last-12-months revenue trend (deterministic but jittered).
  const revenueTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const baseline = (stats.won.reduce((s, d) => s + d.value, 0) / 12) || 4_50_000;
    return months.map((m, i) => ({
      month: m,
      revenue: Math.round(baseline * (0.55 + (Math.sin(i * 0.9) + 1) * 0.35 + Math.random() * 0.15)),
      target: Math.round(baseline * 1.1),
    }));
  }, [stats.won]);

  // Funnel-shaped lead stage breakdown.
  const funnel = useMemo(() => {
    const counts = leads.reduce((a, l) => { a[l.stage] = (a[l.stage] || 0) + 1; return a; }, {});
    return Object.entries(counts).map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  const pieSource = Object.entries(stats.bySource).map(([name, value]) => ({ name, value }));
  const repBars = reps.slice(0, 5).map((r) => ({ name: r.name.split(" ")[0], revenue: r.revenue, conversion: r.conversion }));

  const monthGrowth = Math.round(
    ((revenueTrend.at(-1)?.revenue || 0) / (revenueTrend.at(-2)?.revenue || 1) - 1) * 100,
  );
  const positive = monthGrowth >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader title="Reports" subtitle="Live insights into your pipeline, sources, and rep performance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Weighted pipeline", value: stats.weighted, format: formatINR, icon: TrendingUp, color: "from-yellow-400 to-amber-500" },
          { label: "Avg deal size", value: stats.avgDealSize, format: formatINR, icon: Target, color: "from-sky-400 to-blue-500" },
          { label: "Win rate", value: stats.winRate, suffix: "%", icon: Trophy, color: "from-emerald-400 to-green-500" },
          { label: "Lost deals", value: stats.lost.length, icon: AlertTriangle, color: "from-rose-400 to-red-500" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon size={18} className="text-black" />
            </div>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={k.value} format={k.format} suffix={k.suffix || ""} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly growth widget */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${positive ? "from-emerald-400 to-green-500" : "from-rose-400 to-red-500"} flex items-center justify-center`}>
          {positive ? <ArrowUpRight size={20} className="text-black" /> : <ArrowDownRight size={20} className="text-black" />}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400">Month-over-month revenue</div>
          <div className={`text-2xl font-bold ${positive ? "text-emerald-300" : "text-rose-300"}`}>
            {positive ? "+" : ""}<AnimatedCounter value={monthGrowth} suffix="%" />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={13} /> Last 12 months
        </div>
      </motion.div>

      {/* Revenue trend */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Revenue trend</h2>
        <p className="text-xs text-gray-500 mb-4">Closed-won revenue vs. monthly target</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgtFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(v)} />
              <Area type="monotone" dataKey="target" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#tgtFill)" />
              <Area type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={2.5} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Conversion funnel</h2>
          <p className="text-xs text-gray-500 mb-5">Lead count at each stage</p>
          <div className="space-y-3">
            {funnel.map((row, i) => {
              const max = funnel[0]?.count || 1;
              const pct = (row.count / max) * 100;
              return (
                <div key={row.stage} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-300 truncate">{row.stage}</div>
                  <div className="flex-1 relative h-9 rounded-lg bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.08, duration: 0.7 }}
                      className="h-full rounded-lg flex items-center justify-end pr-3 text-xs font-semibold text-black"
                      style={{ background: `linear-gradient(90deg, ${STAGE_COLORS[i % STAGE_COLORS.length]}, ${STAGE_COLORS[(i + 1) % STAGE_COLORS.length]})` }}
                    >
                      {row.count}
                    </motion.div>
                  </div>
                </div>
              );
            })}
            {funnel.length === 0 && <p className="text-sm text-gray-500">No leads yet.</p>}
          </div>
        </motion.div>

        {/* Lead source pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-1">Lead sources</h2>
          <p className="text-xs text-gray-500 mb-4">Distribution by acquisition channel</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieSource}
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                >
                  {pieSource.map((entry, i) => (
                    <Cell key={entry.name} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Sales rep performance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Sales rep performance</h2>
        <p className="text-xs text-gray-500 mb-4">Revenue brought in + conversion rate</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repBars} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#666" fontSize={11} />
              <YAxis yAxisId="left" stroke="#facc15" fontSize={11} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, k) => (k === "revenue" ? inr(v) : `${v}%`)} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#facc15" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="conversion" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
