import { useEffect, useState } from "react";
import { History, RefreshCw, Edit2, Plus as PlusIcon, Trash2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";
import { StubNotice } from "./AdminAutomation.jsx";

const ACTION_TINT = {
  CREATE: "bg-emerald-400/20 text-emerald-300",
  UPDATE: "bg-yellow-400/20 text-yellow-300",
  DELETE: "bg-red-400/20 text-red-300",
  LOGIN:  "bg-sky-400/20 text-sky-300",
  LOGOUT: "bg-gray-500/20 text-gray-400",
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.getAuditLogs()
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header title="Audit Logs" subtitle={`${logs.length} entries (latest 500)`}
        onRefresh={load} refreshing={loading} accent={History} />

      <StubNotice
        feature="Audit logging"
        detail="Table + endpoint exist. Hook Django signals (post_save / post_delete) on each model to actually write entries — currently the table is empty until your code calls log_action()."
      />

      {error && <ErrorBanner msg={error} />}

      {logs.length === 0 ? (
        <Panel full>
          <div className="text-center py-12">
            <History size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300">No audit entries yet.</p>
            <p className="text-xs text-gray-500 mt-2">Seed by wiring Django signals on Leads/Deal/User saves.</p>
          </div>
        </Panel>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-yellow-300">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Object</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white">{l.user_username || "—"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ACTION_TINT[l.action] || "bg-gray-500/20"}`}>{l.action}</span></td>
                  <td className="px-4 py-3 text-gray-300">{l.model_name}</td>
                  <td className="px-4 py-3 text-gray-400 truncate max-w-xs">{l.object_repr || `#${l.object_id}`}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{l.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
