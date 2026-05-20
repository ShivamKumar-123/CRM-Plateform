import { motion } from "framer-motion";
import { Phone, Mail, Calendar, CheckSquare, Trophy, UserPlus, FileText } from "lucide-react";
import { timeAgo } from "../lib/format.js";

const ICONS = {
  call: Phone, email: Mail, meeting: Calendar, task: CheckSquare,
  won: Trophy, lead: UserPlus, proposal: FileText,
};
const BADGES = {
  call: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  email: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
  meeting: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  task: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  won: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  lead: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  proposal: "bg-amber-400/15 text-amber-300 border-amber-400/30",
};

export default function ActivityTimeline({ items = [], limit = 8 }) {
  const list = items.slice(0, limit);

  return (
    <div className="relative pl-6">
      {/* Vertical timeline line */}
      <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-yellow-400/30 via-white/10 to-transparent" />

      <ul className="space-y-4">
        {list.map((a, i) => {
          const Icon = ICONS[a.type] || CheckSquare;
          const badge = BADGES[a.type] || "bg-white/5 text-gray-300 border-white/10";
          return (
            <motion.li
              key={a.id || i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full bg-black border-2 border-yellow-400/60 shadow-lg shadow-yellow-500/30" />
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl border ${badge} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-white truncate">{a.title}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${badge}`}>
                      {a.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>{timeAgo(a.at)}</span>
                    {a.owner && <span>· {a.owner}</span>}
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
        {list.length === 0 && (
          <li className="text-sm text-gray-500 py-4">No activities yet.</li>
        )}
      </ul>
    </div>
  );
}
