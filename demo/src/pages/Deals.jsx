import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit3, Calendar } from "lucide-react";
import { api } from "../lib/api.js";
import { inr, dateShort } from "../lib/format.js";
import PageHeader, { Field, inputClass } from "../components/PageHeader.jsx";
import Modal from "../components/Modal.jsx";

const STAGES = ["Qualification", "Proposal", "Negotiation", "Won", "Lost"];
const STAGE_HUE = {
  Qualification: "from-gray-400 to-gray-600",
  Proposal: "from-fuchsia-400 to-pink-500",
  Negotiation: "from-sky-400 to-blue-500",
  Won: "from-emerald-400 to-green-500",
  Lost: "from-red-400 to-rose-500",
};

const EMPTY = {
  title: "", customer: "", value: 0, stage: "Qualification",
  probability: 30, expectedClose: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
};

export default function Deals() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { refresh(); }, []);
  function refresh() { setItems(api.listDeals()); }

  const grouped = useMemo(() => {
    const g = Object.fromEntries(STAGES.map((s) => [s, []]));
    items.forEach((d) => { (g[d.stage] || (g[d.stage] = [])).push(d); });
    return g;
  }, [items]);

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(d) {
    setEditing(d);
    setForm({
      ...EMPTY,
      ...d,
      expectedClose: d.expectedClose ? new Date(d.expectedClose).toISOString().slice(0, 10) : EMPTY.expectedClose,
    });
    setModalOpen(true);
  }
  function save() {
    if (!form.title.trim()) return;
    const data = {
      ...form,
      value: Number(form.value),
      probability: Number(form.probability),
      expectedClose: new Date(form.expectedClose).getTime(),
    };
    if (editing) api.updateDeal(editing.id, data);
    else api.createDeal({ ...data, owner: "Demo User" });
    setModalOpen(false); refresh();
  }
  function remove(id) {
    if (confirm("Delete this deal?")) { api.deleteDeal(id); refresh(); }
  }
  function moveStage(deal, dir) {
    const idx = STAGES.indexOf(deal.stage);
    const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, idx + dir))];
    if (next !== deal.stage) {
      api.updateDeal(deal.id, { stage: next });
      refresh();
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Deals pipeline"
        subtitle={`${items.length} deals · use ◀ ▶ to move between stages`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm shadow-lg shadow-yellow-500/20 hover:scale-[1.03] transition"
          >
            <Plus size={16} /> New deal
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage, si) => {
          const list = grouped[stage] || [];
          const total = list.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}
              className="glass rounded-2xl p-3 flex flex-col min-h-[400px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${STAGE_HUE[stage]}`} />
                  <span className="text-sm font-semibold">{stage}</span>
                  <span className="text-xs text-gray-500">({list.length})</span>
                </div>
                <span className="text-[10px] text-gray-500">{inr(total)}</span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {list.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3 hover:border-yellow-400/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm leading-snug">{d.title}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition flex gap-1 shrink-0">
                        <button onClick={() => openEdit(d)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-300">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => remove(d.id)} className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-300">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{d.customer}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-yellow-300 text-sm">{inr(d.value)}</span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {dateShort(d.expectedClose)}
                      </span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${STAGE_HUE[d.stage]}`} style={{ width: `${d.probability}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                      <button onClick={() => moveStage(d, -1)} className="hover:text-white" disabled={si === 0}>◀ prev</button>
                      <span>{d.probability}%</span>
                      <button onClick={() => moveStage(d, 1)} className="hover:text-white" disabled={si === STAGES.length - 1}>next ▶</button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="text-center text-xs text-gray-600 py-6 border border-dashed border-white/5 rounded-xl">
                    No deals
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit deal" : "New deal"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500">
              {editing ? "Save changes" : "Create deal"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Acme — 50kW Rooftop" /></Field></div>
          <Field label="Customer"><input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className={inputClass} /></Field>
          <Field label="Value (₹)"><input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} /></Field>
          <Field label="Stage">
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Probability (%)"><input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} className={inputClass} /></Field>
          <div className="col-span-2"><Field label="Expected close"><input type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} className={inputClass} /></Field></div>
        </div>
      </Modal>
    </div>
  );
}
