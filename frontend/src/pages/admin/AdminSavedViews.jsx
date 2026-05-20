import { useEffect, useState } from "react";
import { Bookmark, Plus, Trash2, Share2, Pencil, Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Panel, Toggle } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

const MODULES = ["lead", "deal", "task", "customer"];

export default function AdminSavedViews() {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [moduleFilter, setModuleFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.getSavedViews(moduleFilter || null)
      .then(setViews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [moduleFilter]);

  const remove = async (v) => {
    if (!confirm(`Delete view "${v.name}"?`)) return;
    await api.deleteSavedView(v.id);
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Saved Views"
        subtitle={`${views.length} saved · share with team or keep private`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New view"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Bookmark}
      />

      <div className="flex gap-2">
        <button onClick={() => setModuleFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !moduleFilter ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" : "bg-white/5 text-gray-400"
          }`}>All modules</button>
        {MODULES.map((m) => (
          <button key={m} onClick={() => setModuleFilter(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              moduleFilter === m ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" : "bg-white/5 text-gray-400"
            }`}>{m.toUpperCase()}</button>
        ))}
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {views.length === 0 ? (
        <Panel full>
          <div className="text-center py-12">
            <Bookmark size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300">No saved views yet.</p>
            <p className="text-xs text-gray-500 mt-1">Save your current filters + sort as a view to recall later.</p>
          </div>
        </Panel>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {views.map((v) => (
            <div key={v.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-yellow-400/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Bookmark size={16} className="text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.module.toUpperCase()} · by {v.user_username || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {v.is_shared && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-300 inline-flex items-center gap-1">
                    <Share2 size={10} /> SHARED
                  </span>
                )}
                {v.is_default && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300">DEFAULT</span>
                )}
              </div>
              <pre className="text-[10px] text-gray-400 bg-black/40 rounded p-2 overflow-x-auto mb-3">
                {JSON.stringify(v.filters, null, 2).slice(0, 200) || "{}"}
              </pre>
              <p className="text-[10px] text-gray-500 mb-3">Sort: {v.sort || "default"}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(v)} className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300"><Pencil size={12} /></button>
                <button onClick={() => remove(v)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <ViewModal
            view={editing}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewModal({ view, onClose, onSaved }) {
  const isEdit = !!view;
  const [form, setForm] = useState({
    name: view?.name || "",
    module: view?.module || "lead",
    filters: view ? JSON.stringify(view.filters, null, 2) : '{\n  "status": "WON"\n}',
    sort: view?.sort || "-created_at",
    is_shared: view?.is_shared ?? false,
    is_default: view?.is_default ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name) { setError("Name required"); return; }
    let filters;
    try { filters = JSON.parse(form.filters || "{}"); }
    catch (_) { setError("Filters must be valid JSON"); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, filters };
      if (isEdit) await api.updateSavedView(view.id, payload);
      else await api.createSavedView(payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={isEdit ? `Edit view — ${view.name}` : "New saved view"} onClose={onClose}>
      {error && <ErrorBanner msg={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="View name *">
          <input value={form.name} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="My Won Deals" className={modalInput} />
        </Field>
        <Field label="Module">
          <select value={form.module}
            onChange={(e) => setForm({ ...form, module: e.target.value })} className={modalInput}>
            {MODULES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Filters (JSON)" wide>
          <textarea rows={6} value={form.filters}
            onChange={(e) => setForm({ ...form, filters: e.target.value })}
            className={`${modalInput} font-mono text-xs`}
            placeholder='{"status": "WON", "city": "Mumbai"}' />
          <p className="text-[10px] text-gray-500 mt-1">
            Example: <code className="text-yellow-300">{"{\"status\": \"WON\", \"base_price__gt\": 50000}"}</code>
          </p>
        </Field>
        <Field label="Sort (Django ordering)" wide>
          <input value={form.sort}
            onChange={(e) => setForm({ ...form, sort: e.target.value })}
            placeholder="-created_at" className={modalInput} />
        </Field>
      </div>
      <div className="mt-4 space-y-2">
        <Toggle label="Share with team (other users in same org can use this view)"
          checked={form.is_shared} onChange={(v) => setForm({ ...form, is_shared: v })} />
        <Toggle label="My default view for this module"
          checked={form.is_default} onChange={(v) => setForm({ ...form, is_default: v })} />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving…" : isEdit ? "Save" : "Create"}
        </button>
      </div>
    </ModalShell>
  );
}
