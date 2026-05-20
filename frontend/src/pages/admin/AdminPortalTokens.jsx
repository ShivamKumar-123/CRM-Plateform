import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { KeyRound, Plus, Copy, Check, Trash2, ExternalLink } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge, SuccessNote } from "./_shared.jsx";

const STATUS_PALETTE = {
  ACTIVE: "bg-emerald-400 text-black",
  REVOKED: "bg-red-500 text-white",
};

export default function AdminPortalTokens() {
  const [tokens, setTokens] = useState([]);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showPlain, setShowPlain] = useState(null);

  function load() {
    api.getPortalTokens().then(setTokens).catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  function revoke(id) {
    if (!confirm("Revoke this portal token? The customer will be signed out.")) return;
    api.revokePortalToken(id).then(() => { setNote("Token revoked."); load(); }).catch((e) => setErr(e.message));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <KeyRound className="text-yellow-400" /> Customer portal tokens
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Mint a magic-link token to give a customer access to the self-service portal.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm"
        >
          <Plus size={14} /> Mint token
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <Panel title="Active tokens" accent="text-yellow-300">
        {tokens.length === 0 ? <Empty msg="No portal tokens yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">Customer</th>
                  <th className="text-left px-3 py-2">Linked lead</th>
                  <th className="text-left px-3 py-2">Token</th>
                  <th className="text-left px-3 py-2">Expires</th>
                  <th className="text-left px-3 py-2">Last used</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      <div className="text-gray-200">{t.name || "—"}</div>
                      <div className="text-[11px] text-gray-500">{t.email}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-300">{t.linked_lead_name || "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-yellow-300">{t.token_preview}</td>
                    <td className="px-3 py-2 text-xs text-gray-400">{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : "never"}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{t.last_used_at ? new Date(t.last_used_at).toLocaleString() : "never"}</td>
                    <td className="px-3 py-2"><StatusBadge status={t.is_active ? "ACTIVE" : "REVOKED"} palette={STATUS_PALETTE} /></td>
                    <td className="px-3 py-2 text-right">
                      {t.is_active && (
                        <div className="inline-flex gap-2">
                          <a
                            href={t.magic_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-yellow-300"
                            title="Open portal as customer"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button onClick={() => revoke(t.id)} className="text-red-300" title="Revoke">
                            <Trash2 size={14} />
                          </button>
                        </div>
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
          <MintModal
            onClose={() => setCreating(false)}
            onSaved={(plaintext) => { setCreating(false); setShowPlain(plaintext); load(); }}
          />
        )}
        {showPlain && <RevealModal value={showPlain} onClose={() => setShowPlain(null)} />}
      </AnimatePresence>
    </div>
  );
}

function MintModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ email: "", name: "", linked_lead: "", expires_days: 90 });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault(); setErr(null);
    try {
      const body = { ...form, expires_days: Number(form.expires_days) };
      if (!body.linked_lead) delete body.linked_lead;
      const created = await api.createPortalToken(body);
      onSaved({ token: created.token_plaintext || "", link: created.magic_link });
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="Mint portal token" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Customer email" wide>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Customer name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Linked lead ID (optional)">
          <input value={form.linked_lead} onChange={(e) => setForm({ ...form, linked_lead: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Expires in (days)" wide>
          <input type="number" value={form.expires_days} onChange={(e) => setForm({ ...form, expires_days: e.target.value })} className={modalInput} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Mint</button>
        </div>
      </form>
    </ModalShell>
  );
}

function RevealModal({ value, onClose }) {
  const [copied, setCopied] = useState(false);
  const linkBase = window.location.origin;
  const magicLink = `${linkBase}/portal/login?t=${value.token || value}`;

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <ModalShell title="Portal access details" onClose={onClose} size="sm">
      <p className="text-sm text-gray-300 mb-3">
        Share <b>either</b> the magic link or the raw token with the customer. This is the only time the full token is visible.
      </p>
      <div className="text-xs text-gray-400 mb-1">Magic link</div>
      <div className="font-mono text-xs bg-black/60 border border-yellow-400/30 rounded-lg p-3 break-all mb-3">{magicLink}</div>
      <div className="text-xs text-gray-400 mb-1">Raw token</div>
      <div className="font-mono text-xs bg-black/60 border border-yellow-400/30 rounded-lg p-3 break-all">{value.token || value}</div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => copy(magicLink)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy link</>}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Close</button>
      </div>
    </ModalShell>
  );
}
