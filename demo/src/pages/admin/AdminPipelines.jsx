import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Plus, ChevronUp, ChevronDown, Trash2, Check, X,
  Palette,
} from "lucide-react";
import { db, uid } from "../../lib/db.js";
import { PageHeader, Panel } from "./_shared.jsx";

const PRESET_COLORS = [
  "#38bdf8", "#60a5fa", "#a78bfa", "#facc15", "#f59e0b",
  "#22c55e", "#ef4444", "#ec4899", "#f97316", "#14b8a6",
];

export default function AdminPipelines() {
  const [stages, setStages] = useState(() => db.raw().pipelineStages || { lead: [], deal: [] });
  const [tab, setTab] = useState("lead");
  const [adding, setAdding] = useState(false);

  const persist = (next) => {
    setStages(next);
    db.merge({ pipelineStages: next });
  };

  const currentList = stages[tab] || [];

  const move = (id, dir) => {
    const list = [...currentList];
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    persist({ ...stages, [tab]: list.map((s, i) => ({ ...s, order: i + 1 })) });
  };

  const remove = (id) => {
    if (!confirm("Delete this stage? Existing records in this stage will move to the first stage.")) return;
    const next = currentList.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    persist({ ...stages, [tab]: next });
  };

  const updateColor = (id, color) => {
    const next = currentList.map((s) => (s.id === id ? { ...s, color } : s));
    persist({ ...stages, [tab]: next });
  };

  const addStage = (data) => {
    const newStage = {
      id: uid("st"),
      slug: data.label.toUpperCase().replace(/\s+/g, "_"),
      label: data.label,
      color: data.color,
      order: currentList.length + 1,
    };
    persist({ ...stages, [tab]: [...currentList, newStage] });
    setAdding(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={GitBranch}
        title="Pipelines"
        subtitle="Configure the stages your team uses for Leads and Deals. Drag-reorder, recolor, or remove."
      />

      {/* Module tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 max-w-xs">
        {["lead", "deal"].map((m) => (
          <button
            key={m}
            onClick={() => setTab(m)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              tab === m
                ? "bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-300 border border-yellow-400/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "lead" ? "Lead stages" : "Deal stages"}
          </button>
        ))}
      </div>

      <Panel
        title={`${tab === "lead" ? "Lead" : "Deal"} pipeline · ${currentList.length} stages`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={12} /> Add stage
          </button>
        }
      >
        <ul className="space-y-2">
          {currentList.map((s, i) => (
            <motion.li
              key={s.id}
              layout
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10"
            >
              <span className="text-gray-500 font-mono text-xs w-6">#{i + 1}</span>

              {/* Color swatch dropdown */}
              <ColorPicker color={s.color} onChange={(c) => updateColor(s.id, c)} />

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{s.label}</p>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{s.slug}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => move(s.id, -1)}
                  disabled={i === 0}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => move(s.id, +1)}
                  disabled={i === currentList.length - 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() => remove(s.id)}
                  disabled={currentList.length <= 2}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  title={currentList.length <= 2 ? "Keep at least 2 stages" : "Delete"}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      </Panel>

      <AnimatePresence>
        {adding && <AddStageModal onSave={addStage} onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}

function ColorPicker({ color, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded-full border-2 border-white/20 hover:border-white/40 transition"
        style={{ background: color }}
        title="Change color"
      />
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-full left-0 mt-2 z-40 p-2 rounded-xl bg-gray-950 border border-white/10 shadow-xl"
            >
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { onChange(c); setOpen(false); }}
                    className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 ${
                      c === color ? "border-white" : "border-white/10"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddStageModal({ onSave, onClose }) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const submit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave({ label: label.trim(), color });
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
        className="w-full max-w-sm rounded-2xl bg-gray-950 border border-yellow-400/20 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white inline-flex items-center gap-2">
            <Palette size={16} className="text-yellow-400" />
            New stage
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Stage name</label>
            <input
              autoFocus
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Site Visit Scheduled"
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Color</label>
            <div className="grid grid-cols-10 gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${
                    c === color ? "border-white" : "border-white/10"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-1.5">
            <Check size={14} /> Add stage
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
