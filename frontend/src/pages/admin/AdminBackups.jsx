import { useEffect, useState } from "react";
import { Database, Plus, Download, RotateCcw, Trash2, Lock } from "lucide-react";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty, StatusBadge, SuccessNote } from "./_shared.jsx";

const STATUS_PALETTE = {
  PENDING: "bg-gray-500 text-white",
  RUNNING: "bg-yellow-400 text-black",
  COMPLETED: "bg-emerald-400 text-black",
  FAILED: "bg-red-500 text-white",
  RESTORED: "bg-violet-400 text-white",
};

export default function AdminBackups() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);

  function load() { api.getBackups().then(setItems).catch((e) => setErr(e.message)); }
  useEffect(load, []);

  async function create() {
    setBusy(true); setErr(null);
    try {
      await api.createBackup({ kind: "MANUAL", retention_days: 30 });
      setNote("Backup created.");
      load();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  async function restore(id) {
    if (!confirm("Restore this backup? This will OVERWRITE current data. Are you sure?")) return;
    try {
      const r = await api.restoreBackup(id);
      if (r.ok) { setNote("Backup restored."); load(); }
      else setErr(r.error || "Restore failed");
    } catch (ex) { setErr(ex.message); }
  }

  async function prune() {
    if (!confirm("Delete all expired backups?")) return;
    try {
      const r = await api.pruneBackups();
      setNote(`Pruned ${r.deleted} expired backup(s).`);
      load();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Database className="text-yellow-400" /> Backup &amp; restore
          </h1>
          <p className="text-sm text-gray-400 mt-1">Encrypted snapshots of your data. Set <code>BACKUP_ENCRYPTION_KEY</code> in .env for AES encryption.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prune} className="px-3 py-2 text-xs rounded bg-white/5 text-gray-300">Prune expired</button>
          <button onClick={create} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm disabled:opacity-50">
            <Plus size={14} /> {busy ? "Running…" : "Create backup"}
          </button>
        </div>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <Panel title="Recent backups" accent="text-yellow-300">
        {items.length === 0 ? <Empty msg="No backups yet." /> : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-3 py-2">When</th>
                <th className="text-left px-3 py-2">Kind</th>
                <th className="text-left px-3 py-2">Size</th>
                <th className="text-left px-3 py-2">Encryption</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((j) => (
                <tr key={j.id} className="border-t border-white/5">
                  <td className="px-3 py-2 text-xs text-gray-400">{new Date(j.started_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs">{j.kind}</td>
                  <td className="px-3 py-2 text-xs">{j.file_size_bytes ? `${(j.file_size_bytes / 1024).toFixed(1)} KB` : "—"}</td>
                  <td className="px-3 py-2 text-xs">
                    {j.encryption_enabled ? <span className="text-emerald-300 flex items-center gap-1"><Lock size={11} /> AES</span> : <span className="text-gray-500">plain</span>}
                  </td>
                  <td className="px-3 py-2"><StatusBadge status={j.status} palette={STATUS_PALETTE} /></td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      {j.file_url && <a href={j.file_url} target="_blank" rel="noreferrer" className="text-sky-300"><Download size={14} /></a>}
                      {j.status === "COMPLETED" && <button onClick={() => restore(j.id)} className="text-amber-300" title="Restore"><RotateCcw size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
