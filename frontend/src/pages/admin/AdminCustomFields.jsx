import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Sliders, Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Panel, Toggle } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";
import { StubNotice } from "./AdminAutomation.jsx";

const FIELD_TYPES = [
  "text", "textarea", "number", "date", "datetime",
  "select", "multiselect", "checkbox", "email", "phone", "url",
];

const MODULES = ["lead", "deal", "task", "customer"];

export default function AdminCustomFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleFilter, setModuleFilter] = useState("lead");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api.getCustomFields(moduleFilter)
      .then(setFields)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [moduleFilter]);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Custom Fields"
        subtitle={`${fields.length} field(s) for ${moduleFilter}`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New field"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Sliders}
      />

      <StubNotice
        feature="Custom Fields engine"
        detail="Field definitions persist. Dynamic form rendering on Lead/Deal forms is NOT wired yet — values won't show up in the create/edit dialogs."
      />

      <div className="flex gap-2">
        {MODULES.map((m) => (
          <button key={m}
            onClick={() => setModuleFilter(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              moduleFilter === m
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >{m.toUpperCase()}</button>
        ))}
      </div>

      {error && <ErrorBanner msg={error} />}

      {fields.length === 0 ? (
        <Panel full>
          <div className="text-center py-12">
            <Sliders size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300">No custom fields for {moduleFilter}.</p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{f.name} <span className="text-xs text-gray-500 font-mono">({f.slug})</span></p>
                <p className="text-xs text-gray-500">type: {f.field_type} · {f.required ? "required" : "optional"} · pos {f.position}</p>
              </div>
              <button onClick={() => setEditing(f)} className="p-2 rounded-lg bg-white/5 text-yellow-300"><Pencil size={14} /></button>
              <button onClick={async () => {
                if (confirm(`Delete "${f.name}"?`)) {
                  await api.deleteCustomField(f.id);
                  load();
                }
              }} className="p-2 rounded-lg bg-white/5 text-red-300"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <FieldModal
            field={editing}
            defaultModule={moduleFilter}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldModal({ field, defaultModule, onClose, onSaved }) {
  const isEdit = !!field;
  const [form, setForm] = useState({
    module: field?.module || defaultModule,
    name: field?.name || "",
    slug: field?.slug || "",
    field_type: field?.field_type || "text",
    required: !!field?.required,
    choices: (field?.choices || []).join(", "),
    placeholder: field?.placeholder || "",
    help_text: field?.help_text || "",
    position: field?.position ?? 0,
    is_active: field?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.slug) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        choices: form.choices.split(",").map((c) => c.trim()).filter(Boolean),
        position: Number(form.position),
      };
      if (isEdit) await api.updateCustomField(field.id, payload);
      else await api.createCustomField(payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={isEdit ? `Edit field — ${field.name}` : "New custom field"} onClose={onClose}>
      {error && <ErrorBanner msg={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Module"><select className={modalInput} value={form.module}
          onChange={(e) => setForm({ ...form, module: e.target.value })}
          disabled={isEdit}>
          {MODULES.map((m) => <option key={m}>{m}</option>)}
        </select></Field>
        <Field label="Type"><select className={modalInput} value={form.field_type}
          onChange={(e) => setForm({ ...form, field_type: e.target.value })}>
          {FIELD_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select></Field>
        <Field label="Display name *"><input className={modalInput} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Slug * (storage key)"><input className={modalInput} value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="property_size" /></Field>
        <Field label="Placeholder"><input className={modalInput} value={form.placeholder}
          onChange={(e) => setForm({ ...form, placeholder: e.target.value })} /></Field>
        <Field label="Position"><input type="number" className={modalInput} value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
        {(form.field_type === "select" || form.field_type === "multiselect") && (
          <Field label="Choices (comma-separated)" wide>
            <input className={modalInput} value={form.choices}
              onChange={(e) => setForm({ ...form, choices: e.target.value })}
              placeholder="Option A, Option B, Option C" />
          </Field>
        )}
        <Field label="Help text" wide><input className={modalInput} value={form.help_text}
          onChange={(e) => setForm({ ...form, help_text: e.target.value })} /></Field>
      </div>
      <div className="mt-4 space-y-2">
        <Toggle label="Required" checked={form.required} onChange={(v) => setForm({ ...form, required: v })} />
        <Toggle label="Active" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving…" : (isEdit ? "Save" : "Create")}
        </button>
      </div>
    </ModalShell>
  );
}
