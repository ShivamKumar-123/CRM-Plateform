import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  History, Search, Filter, Download,
} from "lucide-react";
import { db } from "../../lib/db.js";
import { PageHeader, Panel, Badge, timeAgo } from "./_shared.jsx";

const ACTION_COLOR = {
  CREATED:  "emerald",
  UPDATED:  "sky",
  DELETED:  "red",
  INVITED:  "yellow",
  ENABLED:  "violet",
  DISABLED: "gray",
  RAN:      "amber",
  FAILED:   "red",
  EXPORTED: "pink",
};

const ENTITIES = ["all", "Lead", "Deal", "User", "Document", "Pipeline", "Automation", "Report", "2FA"];

export default function AdminAuditLogs() {
  const logs = useMemo(() => db.get("auditLogs") || [], []);
  const [entity, setEntity] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = logs.filter((l) => {
    if (entity !== "all" && l.entity !== entity) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      l.actor.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.changes || "").toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const header = "Time,Actor,Action,Entity,Target,Changes\n";
    const rows = filtered.map((l) =>
      [
        new Date(l.at).toISOString(),
        l.actor,
        l.action,
        l.entity,
        `"${l.target.replace(/"/g, '""')}"`,
        `"${(l.changes || "").replace(/"/g, '""')}"`,
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={History}
        title="Audit Logs"
        subtitle={`${logs.length} events captured · every change is logged for compliance and traceability.`}
        action={
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm inline-flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor, target, or change…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-yellow-400/50 outline-none"
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <Filter size={12} className="text-gray-500" />
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
          >
            {ENTITIES.map((e) => <option key={e} value={e}>{e === "all" ? "All entities" : e}</option>)}
          </select>
        </div>
      </div>

      <Panel title={`${filtered.length} events`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No events match this filter.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((l) => (
              <motion.li
                key={l.id}
                layout
                className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-yellow-400/20 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                    {l.actorAvatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm text-white font-semibold">{l.actor}</span>
                      <Badge color={ACTION_COLOR[l.action] || "gray"}>{l.action}</Badge>
                      <span className="text-xs text-gray-400">{l.entity}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-yellow-200 truncate">{l.target}</span>
                    </div>
                    {l.changes && (
                      <p className="text-xs text-gray-400 mt-1 font-mono">{l.changes}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0 text-right">
                    <p>{timeAgo(l.at)}</p>
                    <p className="text-gray-600 mt-0.5 hidden sm:block">{new Date(l.at).toLocaleString()}</p>
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
