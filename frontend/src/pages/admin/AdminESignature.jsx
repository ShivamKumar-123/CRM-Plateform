import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PenTool, Plus, Trash2, Copy, Check, FileText, Send } from "lucide-react";
import { api, API_URL } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  PENDING: "bg-yellow-400 text-black",
  PARTIALLY_SIGNED: "bg-sky-400 text-black",
  COMPLETED: "bg-emerald-400 text-black",
  DECLINED: "bg-red-500 text-white",
  EXPIRED: "bg-gray-500 text-white",
  CANCELLED: "bg-gray-500 text-white",
};

export default function AdminESignature() {
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);
  const [copied, setCopied] = useState(null);

  function load() { api.getSignatureRequests().then(setItems).catch((e) => setErr(e.message)); }
  useEffect(load, []);

  function copyLink(token) {
    const link = `${window.location.origin}/sign/${token}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(token); setTimeout(() => setCopied(null), 1500); });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <PenTool className="text-yellow-400" /> E-signature
          </h1>
          <p className="text-sm text-gray-400 mt-1">Send documents, collect OTP-verified signatures.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">
          <Plus size={14} /> New request
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}

      <Panel title="Signature requests" accent="text-yellow-300">
        {items.length === 0 ? <Empty msg="No e-sign requests yet." /> : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-yellow-400" />
                    <span className="text-sm font-semibold">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} palette={STATUS_PALETTE} />
                    {r.status === "COMPLETED" && r.signed_document && (
                      <a href={r.signed_document} target="_blank" rel="noreferrer" className="text-xs text-emerald-300 underline">Download signed</a>
                    )}
                    <button onClick={() => { if (confirm("Cancel?")) api.cancelSignatureRequest(r.id).then(load); }} className="text-red-300">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mb-2">
                  {new Date(r.created_at).toLocaleString()} · {r.signers?.length || 0} signer(s)
                </div>
                <div className="space-y-1">
                  {(r.signers || []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs bg-black/30 rounded px-2 py-1">
                      <span className="text-gray-200">{s.name} <span className="text-gray-500">{s.email}</span></span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} palette={{
                          PENDING: "bg-yellow-400/20 text-yellow-300",
                          VIEWED: "bg-sky-400/20 text-sky-300",
                          SIGNED: "bg-emerald-400/20 text-emerald-300",
                          DECLINED: "bg-red-500/20 text-red-300",
                        }} />
                        <button onClick={() => copyLink(s.token || "")} className="text-yellow-300 flex items-center gap-1">
                          {copied === s.token ? <Check size={11} /> : <Copy size={11} />}
                          <span className="text-[10px]">Sign link</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {creating && <NewRequestModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}

function NewRequestModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [signers, setSigners] = useState([{ name: "", email: "", phone: "" }]);
  const [err, setErr] = useState(null);

  function addSigner() { setSigners([...signers, { name: "", email: "", phone: "" }]); }
  function removeSigner(i) { setSigners(signers.filter((_, idx) => idx !== i)); }
  function updateSigner(i, patch) {
    const next = [...signers]; next[i] = { ...next[i], ...patch }; setSigners(next);
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (file) fd.append("document", file);
    fd.append("signers", JSON.stringify(signers.filter((s) => s.email)));
    try {
      await api.createSignatureRequest(fd);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="New signature request" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title"><input required value={title} onChange={(e) => setTitle(e.target.value)} className={modalInput} /></Field>
        <Field label="Description"><textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={modalInput} /></Field>
        <Field label="Document (PDF)"><input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className={modalInput} /></Field>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex justify-between">
            <span>Signers (in order)</span>
            <button type="button" onClick={addSigner} className="text-yellow-300"><Plus size={11} className="inline" /> Add</button>
          </div>
          {signers.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2">
              <input placeholder="Name" value={s.name} onChange={(e) => updateSigner(i, { name: e.target.value })} className={`${modalInput} col-span-4`} />
              <input placeholder="Email" type="email" value={s.email} onChange={(e) => updateSigner(i, { email: e.target.value })} className={`${modalInput} col-span-4`} />
              <input placeholder="Phone" value={s.phone} onChange={(e) => updateSigner(i, { phone: e.target.value })} className={`${modalInput} col-span-3`} />
              <button type="button" onClick={() => removeSigner(i)} className="col-span-1 text-red-300"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold"><Send size={12} className="inline" /> Create + send</button>
        </div>
      </form>
    </ModalShell>
  );
}
