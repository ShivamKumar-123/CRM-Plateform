import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Key, Plus, ExternalLink, Copy, Trash2, BookOpen, Check } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, Toggle, ModalShell, ErrorBanner, SuccessNote, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  ACTIVE: "bg-emerald-400 text-black",
  REVOKED: "bg-red-500 text-white",
};

const MODULES = ["leads", "deals", "customers", "tasks"];

export default function AdminApiDocs() {
  const [keys, setKeys] = useState([]);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showPlain, setShowPlain] = useState(null); // plaintext key shown once

  function load() {
    api.getApiKeys().then(setKeys).catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  function revoke(id) {
    if (!confirm("Revoke this API key? Future requests using it will be rejected.")) return;
    api.revokeApiKey(id).then(() => { setNote("Key revoked."); load(); }).catch((e) => setErr(e.message));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-yellow-400" /> API docs &amp; keys
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Public OpenAPI documentation (Swagger / ReDoc) + per-org API keys for external integrations.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm"
        >
          <Plus size={14} /> Generate API key
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <DocCard href={api.docsUrl()} title="Swagger UI" subtitle="Interactive API explorer with try-it-out." />
        <DocCard href={`${api.docsUrl().replace('/docs/', '/redoc/')}`} title="ReDoc" subtitle="Static-style three-panel reference." />
        <DocCard href={api.schemaUrl()} title="OpenAPI schema" subtitle="Download the raw schema.yml — generate SDKs." />
      </div>

      <Panel title="API keys" accent="text-yellow-300">
        {keys.length === 0 ? <Empty msg="No API keys yet — generate one for your first integration." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Key</th>
                  <th className="text-left px-3 py-2">Scopes</th>
                  <th className="text-left px-3 py-2">Modules</th>
                  <th className="text-left px-3 py-2">Last used</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-white/5">
                    <td className="px-3 py-2 font-medium">{k.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-yellow-300">{k.key_preview}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">
                      {k.can_read && "R"} {k.can_write && "W"}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">{(k.allowed_modules || []).join(", ") || "all"}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={k.is_active ? "ACTIVE" : "REVOKED"} palette={STATUS_PALETTE} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {k.is_active && (
                        <button onClick={() => revoke(k.id)} className="text-red-300 hover:text-red-200" title="Revoke">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {creating && (
          <KeyModal
            onClose={() => setCreating(false)}
            onSaved={(plaintext) => { setCreating(false); setShowPlain(plaintext); load(); }}
          />
        )}
        {showPlain && <PlaintextRevealModal value={showPlain} onClose={() => setShowPlain(null)} />}
      </AnimatePresence>
    </div>
  );
}

function DocCard({ href, title, subtitle }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-400/30 transition group"
    >
      <div className="flex items-center justify-between mb-2">
        <BookOpen size={16} className="text-yellow-400" />
        <ExternalLink size={12} className="text-gray-500 group-hover:text-yellow-300" />
      </div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </a>
  );
}

function KeyModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    can_read: true,
    can_write: false,
    allowed_modules: [],
  });
  const [err, setErr] = useState(null);

  function toggleMod(m) {
    setForm((f) => ({
      ...f,
      allowed_modules: f.allowed_modules.includes(m)
        ? f.allowed_modules.filter((x) => x !== m)
        : [...f.allowed_modules, m],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const created = await api.createApiKey(form);
      onSaved(created.key_plaintext || created.key);
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="Generate API key" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Name" wide>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} required placeholder="e.g. Zapier integration" />
        </Field>
        <Field label="Read access">
          <Toggle label="Allow reading data" checked={form.can_read} onChange={(v) => setForm({ ...form, can_read: v })} />
        </Field>
        <Field label="Write access">
          <Toggle label="Allow creating / updating" checked={form.can_write} onChange={(v) => setForm({ ...form, can_write: v })} />
        </Field>
        <Field label="Allowed modules (empty = all)" wide>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {MODULES.map((m) => (
              <label key={m} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                <input type="checkbox" checked={form.allowed_modules.includes(m)} onChange={() => toggleMod(m)} />
                {m}
              </label>
            ))}
          </div>
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Generate</button>
        </div>
      </form>
    </ModalShell>
  );
}

function PlaintextRevealModal({ value, onClose }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <ModalShell title="Your new API key" onClose={onClose} size="sm">
      <p className="text-sm text-gray-300 mb-3">
        Copy it now — this is the only time we'll show the full key.
      </p>
      <div className="font-mono text-xs bg-black/60 border border-yellow-400/30 rounded-lg p-3 break-all">
        {value}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Close</button>
      </div>
    </ModalShell>
  );
}
