import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, UserCircle, TrendingUp, Wallet, Trophy, Hand } from "lucide-react";
import { api } from "../lib/api.js";
import { inr } from "../lib/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useIndustry } from "../context/IndustryContext.jsx";
import AnimatedCounter, { formatINR } from "../components/AnimatedCounter.jsx";
import ActivityTimeline from "../components/ActivityTimeline.jsx";
import SalesLeaderboard from "../components/SalesLeaderboard.jsx";

const STAGE_COLORS = {
  Qualification: "from-gray-400 to-gray-600",
  Proposal: "from-fuchsia-400 to-pink-500",
  Negotiation: "from-sky-400 to-blue-500",
  Won: "from-emerald-400 to-green-500",
  Lost: "from-red-400 to-rose-500",
  "Site Visit": "from-sky-400 to-blue-500",
  Shortlist: "from-yellow-400 to-amber-500",
  Offer: "from-fuchsia-400 to-pink-500",
  Consultation: "from-rose-400 to-pink-500",
  Diagnostics: "from-sky-400 to-blue-500",
  "Plan Proposed": "from-yellow-400 to-amber-500",
  "Quote Sent": "from-sky-400 to-blue-500",
  Contract: "from-emerald-400 to-green-500",
  Lead: "from-gray-400 to-gray-600",
  Quote: "from-yellow-400 to-amber-500",
  Documents: "from-violet-400 to-purple-500",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { industry, dataVersion } = useIndustry();
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reps, setReps] = useState([]);

  useEffect(() => {
    setStats(api.dashboard());
    setDeals(api.listDeals());
    setActivities(api.listActivities());
    setReps(api.listReps());
  }, [dataVersion]);

  if (!stats) return null;

  const dealsByStage = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + (d.value || 0);
    return acc;
  }, {});
  const maxStage = Math.max(...Object.values(dealsByStage), 1);

  const cards = [
    { label: "Total leads", value: stats.leads, icon: Users, color: "from-yellow-400 to-amber-500" },
    { label: "Active customers", value: stats.customers, icon: UserCircle, color: "from-emerald-400 to-green-500" },
    { label: "Open deals", value: stats.openDeals, icon: Briefcase, color: "from-fuchsia-400 to-pink-500" },
    { label: "Pipeline value", value: stats.pipelineValue, format: formatINR, icon: Wallet, color: "from-sky-400 to-blue-500" },
    { label: "Revenue won", value: stats.wonValue, format: formatINR, icon: Trophy, color: "from-violet-400 to-purple-500" },
    { label: "Win rate", value: stats.winRate, suffix: "%", icon: TrendingUp, color: "from-rose-400 to-red-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Welcome back, {user?.name?.split(" ")[0]} <Hand size={24} className="text-yellow-400" />
          </h1>
          <p className="text-gray-400 mt-1">
            Live <span className="text-yellow-300">{industry.label}</span> pipeline — all data lives in your browser.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 font-semibold tracking-wider">
          ● LIVE DEMO
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="glass rounded-2xl p-4 hover:border-white/20 transition relative overflow-hidden group"
          >
            <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-20 blur-2xl transition`} />
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-3 shadow-lg`}>
              <c.icon size={16} className="text-black" />
            </div>
            <div className="text-xl font-bold">
              <AnimatedCounter value={c.value} format={c.format} suffix={c.suffix || ""} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Pipeline by stage</h2>
              <p className="text-xs text-gray-500 mt-0.5">Total {industry.vocabulary.dealNoun.toLowerCase()} value at each stage</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(dealsByStage).map(([stage, value], i) => (
              <div key={stage}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-300">{stage}</span>
                  <span className="text-gray-500">{inr(value)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / maxStage) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.7 }}
                    className={`h-full rounded-full bg-gradient-to-r ${STAGE_COLORS[stage] || industry.accent}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SalesLeaderboard reps={reps} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold mb-1">Activity timeline</h2>
        <p className="text-xs text-gray-500 mb-5">Latest events across leads, deals, and tasks</p>
        <ActivityTimeline items={activities} limit={8} />
      </motion.div>
    </div>
  );
}
