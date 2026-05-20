import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { inr } from "../lib/format.js";

const RANK_BADGE = [
  { icon: Trophy, color: "from-yellow-400 to-amber-500", label: "1st" },
  { icon: Medal, color: "from-gray-300 to-gray-400", label: "2nd" },
  { icon: Award, color: "from-amber-600 to-orange-700", label: "3rd" },
];

export default function SalesLeaderboard({ reps = [] }) {
  const top = reps.slice(0, 5);
  const maxRev = Math.max(...top.map((r) => r.revenue), 1);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Sales leaderboard
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Top performers this quarter</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500 hidden sm:block">Live</div>
      </div>

      <ul className="space-y-3">
        {top.map((r, i) => {
          const badge = RANK_BADGE[i];
          const Icon = badge?.icon;
          return (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-xs font-bold">
                  {r.avatar}
                </div>
                {badge && (
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}>
                    <Icon size={9} className="text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs text-yellow-300 font-semibold tabular-nums">{inr(r.revenue)}</div>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.revenue / maxRev) * 100}%` }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.7 }}
                    className={`h-full rounded-full bg-gradient-to-r ${badge?.color || "from-sky-400 to-blue-500"}`}
                  />
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                  <span>{r.dealsWon} deals won</span>
                  <span className="flex items-center gap-1"><TrendingUp size={9} /> {r.conversion}% conv.</span>
                </div>
              </div>
            </motion.li>
          );
        })}
        {top.length === 0 && (
          <li className="text-sm text-gray-500 py-4 text-center">No reps yet.</li>
        )}
      </ul>
    </div>
  );
}
