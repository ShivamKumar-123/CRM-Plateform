import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Puzzle, Plus, Power, Trash2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  ENABLED: "bg-emerald-400 text-black",
  DISABLED: "bg-gray-500 text-white",
  ERROR: "bg-red-500 text-white",
};

export default function AdminPlugins() {
  const [items, setItems] = useState([]);
  const [hooks, setHooks] = useState({});
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    api.getPlugins().then(setItems).catch((e) => setErr(e.message));
    api.getPluginHooks().then(setHooks).catch(() => {});
  }
  useEffect(load, []);

  async function toggle(plugin) {
    const action = plugin.status === "ENABLED" ? "disable" : "enable";
    await api.togglePlugin(plugin.id, action);
    load();
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Puzzle className="text-yellow-400" /> Plugins
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Extensions registered against hooks. Drop modules in <code>backend/plugins/&lt;slug&gt;.py</code>.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">
          <Plus size={14} /> Install plugin
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Installed" accent="text-yellow-300">
            {items.length === 0 ? <Empty msg="No plugins installed." /> : (
              <div className="space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <Puzzle size={16} className="text-yellow-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{p.name} <span className="text-[10px] text-gray-500 ml-2">v{p.version}</span></div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">{p.description}</div>
                      <div className="text-[10px] text-gray-600 mt-1">Hooks: {(p.hooks || []).join(", ") || "—"}</div>
                    </div>
                    <StatusBadge status={p.status} palette={STATUS_PALETTE} />
                    <button onClick={() => toggle(p)} className={p.status === "ENABLED" ? "text-emerald-300" : "text-gray-500"}><Power size={14} /></button>
                    <button onClick={() => { if (confirm("Uninstall?")) api.uninstallPlugin(p.id).then(load); }} className="text-red-300"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div>
          <Panel title="Registered hooks" accent="text-sky-300">
            {Object.keys(hooks).length === 0 ? <Empty msg="No hooks registered." /> : (
              <ul className="space-y-2 text-xs">
                {Object.entries(hooks).map(([name, cbs]) => (
                  <li key={name}>
                    <div className="font-mono text-yellow-300">{name}</div>
                    <div className="text-gray-500 pl-3">{cbs.length} callback(s)</div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {creating && <InstallModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}

function InstallModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", slug: "", version: "1.0.0", description: "", hooks: "", config: "{}" });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    let config = {};
    try { config = form.config.trim() ? JSON.parse(form.config) : {}; }
    catch { setErr("Config must be valid JSON."); return; }
    try {
      await api.installPlugin({
        ...form,
        hooks: form.hooks.split(",").map((s) => s.trim()).filter(Boolean),
        config,
      });
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="Install plugin" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} /></Field>
          <Field label="Slug"><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={modalInput} /></Field>
          <Field label="Version"><input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className={modalInput} /></Field>
          <Field label="Hooks (comma-separated)"><input value={form.hooks} onChange={(e) => setForm({ ...form, hooks: e.target.value })} className={modalInput} placeholder="lead_created, deal_won" /></Field>
          <Field label="Description" wide><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={modalInput} /></Field>
          <Field label="Config (JSON)" wide><textarea rows={3} value={form.config} onChange={(e) => setForm({ ...form, config: e.target.value })} className={`${modalInput} font-mono text-xs`} /></Field>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Install</button>
        </div>
      </form>
    </ModalShell>
  );
}
