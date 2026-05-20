import { useEffect, useState } from "react";
import { Monitor, ShieldOff, LogOut, Users, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Empty, Panel, SuccessNote, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  ACTIVE: "bg-emerald-400 text-black",
  REVOKED: "bg-red-500 text-white",
  CURRENT: "bg-yellow-400 text-black",
};

export default function AdminSessions() {
  const [mode, setMode] = useState("mine"); // mine | all
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);

  function load() {
    setErr(null);
    const fetcher = mode === "mine" ? api.getMySessions() : api.getAdminSessions("?active=true");
    fetcher.then(setSessions).catch((e) => setErr(e.message));
  }
  useEffect(load, [mode]);

  function revoke(id) {
    if (!confirm("Revoke this session? The device will be signed out.")) return;
    api.revokeSession(id).then(() => { setNote("Session revoked."); load(); }).catch((e) => setErr(e.message));
  }
  function revokeOthers() {
    if (!confirm("Sign out all OTHER devices? Your current device stays signed in.")) return;
    api.revokeAllOtherSessions().then((r) => {
      setNote(`Revoked ${r.revoked} session(s).`);
      load();
    }).catch((e) => setErr(e.message));
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Monitor className="text-yellow-400" /> Sessions &amp; devices
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            See where you're signed in. Revoke a device to block its access token immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setMode("mine")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "mine" ? "bg-yellow-400 text-black font-bold" : "text-gray-300"}`}
            >
              My sessions
            </button>
            <button
              onClick={() => setMode("all")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "all" ? "bg-yellow-400 text-black font-bold" : "text-gray-300"}`}
            >
              <Users size={11} className="inline mr-1" /> All (super-admin)
            </button>
          </div>
          {mode === "mine" && (
            <button
              onClick={revokeOthers}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm"
            >
              <LogOut size={14} /> Sign out others
            </button>
          )}
        </div>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <Panel title={mode === "mine" ? "Your active devices" : "All active sessions across users"}>
        {sessions.length === 0 ? <Empty msg="No sessions tracked yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  {mode === "all" && <th className="text-left px-3 py-2">User</th>}
                  <th className="text-left px-3 py-2">Device</th>
                  <th className="text-left px-3 py-2">IP</th>
                  <th className="text-left px-3 py-2">Last seen</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const status = s.is_current ? "CURRENT" : (s.is_active ? "ACTIVE" : "REVOKED");
                  return (
                    <tr key={s.id} className="border-t border-white/5">
                      {mode === "all" && <td className="px-3 py-2 font-medium">{s.user_username}</td>}
                      <td className="px-3 py-2">
                        <div className="text-gray-200">{s.device_label || "Unknown"}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[280px]" title={s.user_agent}>{s.user_agent}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{s.ip_address || "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{new Date(s.last_seen_at).toLocaleString()}</td>
                      <td className="px-3 py-2"><StatusBadge status={status} palette={STATUS_PALETTE} /></td>
                      <td className="px-3 py-2 text-right">
                        {s.is_active && !s.is_current && (
                          <button
                            onClick={() => revoke(s.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/15 text-red-300 hover:bg-red-500/25"
                          >
                            <ShieldOff size={12} /> Revoke
                          </button>
                        )}
                        {s.is_current && <span className="text-[10px] text-yellow-300 font-bold">THIS DEVICE</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 text-xs text-gray-500 flex items-start gap-2">
        <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        Revoking a session blacklists its refresh-token jti. The device stays signed in until the
        short-lived access token expires (default ≤ 60 minutes).
      </div>
    </div>
  );
}
