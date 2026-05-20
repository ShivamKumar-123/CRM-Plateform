import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Edit3, Phone, Mail } from "lucide-react";
import { api } from "../lib/api.js";
import { inr, timeAgo } from "../lib/format.js";
import PageHeader, { Field, inputClass } from "../components/PageHeader.jsx";
import Modal from "../components/Modal.jsx";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Lost"];
const SOURCES = ["Website", "Referral", "Cold Call", "Event", "LinkedIn", "Other"];

const STAGE_BADGE = {
  New: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  Contacted: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  Qualified: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Proposal: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
  Lost: "bg-red-400/15 text-red-300 border-red-400/30",
};

const EMPTY = { name: "", company: "", email: "", phone: "", source: "Website", stage: "New", score: 50, value: 0, notes: "" };

export default function Leads() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { refresh(); }, []);
  function refresh() { setItems(api.listLeads()); }

  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (stageFilter !== "All" && l.stage !== stageFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.company.toLowerCase().includes(q) &&
          !l.email.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [items, query, stageFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }
  function openEdit(lead) {
    setEditing(lead);
    setForm({ ...EMPTY, ...lead });
    setModalOpen(true);
  }
  function save() {
    if (!form.name.trim()) return;
    if (editing) api.updateLead(editing.id, form);
    else api.createLead({ ...form, owner: "Demo User" });
    setModalOpen(false);
    refresh();
  }
  function remove(id) {
    if (confirm("Delete this lead?")) {
      api.deleteLead(id);
      refresh();
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Leads"
        subtitle={`${items.length} total · ${filtered.length} shown`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm shadow-lg shadow-yellow-500/20 hover:scale-[1.03] transition"
          >
            <Plus size={16} /> New lead
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company or email…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", ...STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                stageFilter === s
                  ? "bg-yellow-400/15 border-yellow-400/40 text-yellow-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Lead</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">Score</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Added</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <motion.tr
                  key={l.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-t border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.company}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={11} /> {l.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Phone size={11} /> {l.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border ${STAGE_BADGE[l.stage] || "bg-white/5 border-white/10"}`}>
                      {l.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{inr(l.value)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <ScoreBar score={l.score} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden xl:table-cell">{timeAgo(l.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-300">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => remove(l.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-gray-500 py-10">
                    No leads match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit lead" : "New lead"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">
              Cancel
            </button>
            <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500">
              {editing ? "Save changes" : "Create lead"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Full name" />
          </Field>
          <Field label="Company">
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} placeholder="Company" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="email@company.com" />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+91 ..." />
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Stage">
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className={inputClass}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Score (0-100)">
            <input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Estimated value (₹)">
            <input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={inputClass} />
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ScoreBar({ score }) {
  const color = score >= 80 ? "from-emerald-400 to-green-500" : score >= 60 ? "from-yellow-400 to-amber-500" : "from-gray-400 to-gray-600";
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-400 tabular-nums">{score}</span>
    </div>
  );
}
