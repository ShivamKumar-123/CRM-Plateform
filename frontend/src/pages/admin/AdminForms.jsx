import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FileInput, Plus, Trash2, Edit3, Copy, Check, ExternalLink, Eye } from "lucide-react";
import { api, API_URL } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const FIELD_TYPES = ["text", "textarea", "email", "phone", "number", "date", "select", "checkbox", "hidden"];
const LEAD_FIELDS = ["", "name", "email", "phone", "city", "state", "product_name", "product_category", "base_price", "notes"];

export default function AdminForms() {
  const [forms, setForms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [submissions, setSubmissions] = useState(null);
  const [err, setErr] = useState(null);
  const [copied, setCopied] = useState(null);

  function load() { api.getForms().then(setForms).catch((e) => setErr(e.message)); }
  useEffect(load, []);

  function publicUrl(slug) { return `${window.location.origin}/forms/${slug}`; }
  function copy(text, id) {
    navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 1500); });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileInput className="text-yellow-400" /> Form builder
          </h1>
          <p className="text-sm text-gray-400 mt-1">Public forms that capture leads automatically.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">
          <Plus size={14} /> New form
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}

      <Panel title="Forms" accent="text-yellow-300">
        {forms.length === 0 ? <Empty msg="No forms yet." /> : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Public URL</th>
                <th className="text-left px-3 py-2">Submissions</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => (
                <tr key={f.id} className="border-t border-white/5">
                  <td className="px-3 py-2 font-medium">{f.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <button onClick={() => copy(publicUrl(f.slug), f.id)} className="text-yellow-300 hover:underline flex items-center gap-1">
                      {copied === f.id ? <Check size={11} /> : <Copy size={11} />} /forms/{f.slug}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-xs">{f.submission_count}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={f.is_active ? "ACTIVE" : "PAUSED"} palette={{
                      ACTIVE: "bg-emerald-400 text-black",
                      PAUSED: "bg-gray-500 text-white",
                    }} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <a href={publicUrl(f.slug)} target="_blank" rel="noreferrer" className="text-sky-300"><ExternalLink size={14} /></a>
                      <button onClick={() => api.getFormSubmissions(f.id).then((d) => setSubmissions({ form: f, items: d }))} className="text-violet-300" title="Submissions"><Eye size={14} /></button>
                      <button onClick={() => setEditing(f)} className="text-yellow-300"><Edit3 size={14} /></button>
                      <button onClick={() => { if (confirm("Delete?")) api.deleteForm(f.id).then(load); }} className="text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <AnimatePresence>
        {(creating || editing) && (
          <FormModal form={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { setCreating(false); setEditing(null); load(); }} />
        )}
        {submissions && (
          <ModalShell title={`Submissions — ${submissions.form.name}`} onClose={() => setSubmissions(null)} size="lg">
            {submissions.items.length === 0 ? <Empty msg="No submissions yet." /> : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.items.map((s) => (
                  <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs">
                    <div className="text-gray-500 mb-1">{new Date(s.created_at).toLocaleString()} · IP {s.ip_address || "—"}</div>
                    <pre className="text-gray-200 whitespace-pre-wrap">{JSON.stringify(s.data, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormModal({ form, onClose, onSaved }) {
  const isEdit = !!form;
  const [meta, setMeta] = useState({
    name: form?.name || "",
    description: form?.description || "",
    success_message: form?.success_message || "Thank you! We'll be in touch shortly.",
    redirect_url: form?.redirect_url || "",
    create_lead: form?.create_lead ?? true,
    is_active: form?.is_active ?? true,
  });
  const [fields, setFields] = useState(() =>
    (form?.fields_detail || []).map((f) => ({ ...f }))
  );
  const [err, setErr] = useState(null);

  function addField() {
    setFields([...fields, {
      label: "Field " + (fields.length + 1),
      field_key: `field_${fields.length + 1}`,
      field_type: "text",
      is_required: false,
      order: fields.length,
      maps_to: "",
    }]);
  }
  function updateField(idx, patch) {
    const next = [...fields];
    next[idx] = { ...next[idx], ...patch };
    setFields(next);
  }
  function removeField(idx) {
    setFields(fields.filter((_, i) => i !== idx));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const body = { ...meta, fields };
      if (isEdit) await api.updateForm(form.id, body);
      else await api.createForm(body);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title={isEdit ? "Edit form" : "New form"} onClose={onClose} size="lg">
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input required value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} className={modalInput} /></Field>
          <Field label="Redirect URL (optional)"><input value={meta.redirect_url} onChange={(e) => setMeta({ ...meta, redirect_url: e.target.value })} className={modalInput} /></Field>
          <Field label="Description" wide><textarea rows={2} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} className={modalInput} /></Field>
          <Field label="Success message" wide><input value={meta.success_message} onChange={(e) => setMeta({ ...meta, success_message: e.target.value })} className={modalInput} /></Field>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={meta.create_lead} onChange={(e) => setMeta({ ...meta, create_lead: e.target.checked })} /> Create lead on submit
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={meta.is_active} onChange={(e) => setMeta({ ...meta, is_active: e.target.checked })} /> Active
          </label>
        </div>

        <div className="rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Fields</span>
            <button type="button" onClick={addField} className="px-2 py-1 text-xs rounded bg-white/5 text-yellow-300"><Plus size={11} className="inline" /> Add field</button>
          </div>
          {fields.length === 0 && <div className="text-xs text-gray-500 italic">Add at least one field.</div>}
          <div className="space-y-2">
            {fields.map((f, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-black/30 border border-white/5 rounded p-2 text-xs">
                <input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} placeholder="Label" className={`${modalInput} col-span-3`} />
                <input value={f.field_key} onChange={(e) => updateField(idx, { field_key: e.target.value })} placeholder="key" className={`${modalInput} col-span-2`} />
                <select value={f.field_type} onChange={(e) => updateField(idx, { field_type: e.target.value })} className={`${modalInput} col-span-2`}>
                  {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={f.maps_to || ""} onChange={(e) => updateField(idx, { maps_to: e.target.value })} className={`${modalInput} col-span-2`}>
                  {LEAD_FIELDS.map((l) => <option key={l} value={l}>→ {l || "(auto)"}</option>)}
                </select>
                <label className="col-span-2 flex items-center gap-1 text-[10px] text-gray-300">
                  <input type="checkbox" checked={f.is_required} onChange={(e) => updateField(idx, { is_required: e.target.checked })} /> Required
                </label>
                <button type="button" onClick={() => removeField(idx)} className="col-span-1 text-red-300"><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">{isEdit ? "Save" : "Create"}</button>
        </div>
      </form>
    </ModalShell>
  );
}
