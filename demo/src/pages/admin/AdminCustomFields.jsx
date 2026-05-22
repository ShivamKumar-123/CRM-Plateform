import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders, Plus, Trash2, Check, X, Type, Hash, ToggleLeft, ListChecks,
} from "lucide-react";
import { db, uid } from "../../lib/db.js";
import { PageHeader, Panel, Badge } from "./_shared.jsx";

const FIELD_TYPES = [
  { value: "text",    label: "Text",    icon: Type },
  { value: "number",  label: "Number",  icon: Hash },
  { value: "boolean", label: "Toggle",  icon: ToggleLeft },
  { value: "select",  label: "Dropdown", icon: ListChecks },
];

const TYPE_COLOR = {
  text: "sky",
  number: "emerald",
  boolean: "violet",
  select: "amber",
};

export default function AdminCustomFields() {
  const [fields, setFields] = useState(() => db.get("customFields") || []);
  const [module, setModule] = useState("lead");
  const [adding, setAdding] = useState(false);

  const persist = (next) => {
    setFields(next);
    db.set("customFields", next);
  };

  const filtered = fields.filter((f) => f.module === module);

  const remove = (id) => {
    if (!confirm("Delete this field? Data in this field will be lost on real systems.")) return;
    persist(fields.filter((f) => f.id !== id));
  };

  const toggleRequired = (id) => {
    persist(fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f)));
  };

  const addField = (data) => {
    const newField = {
      id: uid("cf"),
      module,
      slug: data.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      createdAt: Date.now(),
      ...data,
    };
    persist([newField, ...fields]);
    setAdding(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={Sliders}
        title="Custom Fields"
        subtitle="Extend Leads, Deals, and Customers with your own fields. Text, number, toggle, or dropdown — no code needed."
      />

      {/* Module tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 max-w-md">
        {["lead", "deal", "customer"].map((m) => (
          <button
            key={m}
            onClick={() => setModule(m)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              module === m
                ? "bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-300 border border-yellow-400/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "lead" ? "Leads" : m === "deal" ? "Deals" : "Customers"}
            <span className="ml-1.5 text-[9px] text-gray-500">
              ({fields.filter((f) => f.module === m).length})
            </span>
          </button>
        ))}
      </div>

      <Panel
        title={`Fields on ${module}`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={12} /> New field
          </button>
        }
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            No custom fields yet for {module}s. Click "New field" to add your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((f) => {
              const TypeIcon = FIELD_TYPES.find((t) => t.value === f.type)?.icon || Type;
              return (
                <motion.div
                  key={f.id}
                  layout
                  className="p-4 rounded-xl bg-white/[0.04] border border-white/10 group hover:border-yellow-400/30 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        bg-gradient-to-br ${
                          f.type === "text" ? "from-sky-400 to-blue-500" :
                          f.type === "number" ? "from-emerald-400 to-green-500" :
                          f.type === "boolean" ? "from-violet-400 to-purple-500" :
                          "from-amber-400 to-orange-500"
                        }`}>
                        <TypeIcon size={14} className="text-black" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{f.label}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{f.slug}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(f.id)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge color={TYPE_COLOR[f.type] || "gray"}>
                      {FIELD_TYPES.find((t) => t.value === f.type)?.label || f.type}
                    </Badge>
                    <button
                      onClick={() => toggleRequired(f.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider transition ${
                        f.required
                          ? "bg-red-400/20 text-red-300 border-red-400/30 hover:bg-red-400/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
                      }`}
                    >
                      {f.required ? "REQUIRED" : "OPTIONAL"}
                    </button>
                  </div>

                  {f.type === "select" && f.options?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Options</p>
                      <div className="flex flex-wrap gap-1">
                        {f.options.map((opt) => (
                          <span key={opt} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {adding && <NewFieldModal onSave={addField} onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}

function NewFieldModal({ onSave, onClose }) {
  const [form, setForm] = useState({ label: "", type: "text", required: false, options: "" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    const data = { label: form.label.trim(), type: form.type, required: form.required };
    if (form.type === "select") {
      data.options = form.options.split(",").map((s) => s.trim()).filter(Boolean);
      if (data.options.length === 0) { alert("Dropdown needs at least one option."); return; }
    }
    onSave(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-yellow-400/20 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">New custom field</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Field name</label>
            <input
              autoFocus
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Roof Type"
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition ${
                    form.type === t.value
                      ? "bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-300 border-yellow-400/40"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {form.type === "select" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                Options (comma-separated)
              </label>
              <input
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                placeholder="Concrete, Metal Sheet, Tile"
                className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              />
            </div>
          )}

          <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="w-4 h-4 accent-yellow-400"
            />
            <span className="text-sm text-gray-200">Mark as required</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-1.5">
            <Check size={14} /> Create field
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
