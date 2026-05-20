import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Edit3, Mail, Phone, MapPin } from "lucide-react";
import { api } from "../lib/api.js";
import { inr, dateShort } from "../lib/format.js";
import PageHeader, { Field, inputClass } from "../components/PageHeader.jsx";
import Modal from "../components/Modal.jsx";

const STATUSES = ["Active", "Churned"];
const EMPTY = { name: "", company: "", email: "", phone: "", city: "", status: "Active", lifetime: 0 };

export default function Customers() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { refresh(); }, []);
  function refresh() { setItems(api.listCustomers()); }

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q),
    );
  }, [items, query]);

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(c) { setEditing(c); setForm({ ...EMPTY, ...c }); setModalOpen(true); }
  function save() {
    if (!form.name.trim()) return;
    if (editing) api.updateCustomer(editing.id, form);
    else api.createCustomer(form);
    setModalOpen(false); refresh();
  }
  function remove(id) {
    if (confirm("Delete this customer?")) { api.deleteCustomer(id); refresh(); }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Customers"
        subtitle={`${items.length} total`}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm shadow-lg shadow-yellow-500/20 hover:scale-[1.03] transition"
          >
            <Plus size={16} /> New customer
          </button>
        }
      />

      <div className="mb-5 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers…"
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3) }}
            className="glass rounded-2xl p-5 hover:border-white/20 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-bold">
                  {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.company}</div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  c.status === "Active"
                    ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
                    : "bg-gray-400/15 text-gray-400 border-gray-400/30"
                }`}
              >
                {c.status}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2"><Mail size={11} /> {c.email}</div>
              <div className="flex items-center gap-2"><Phone size={11} /> {c.phone}</div>
              <div className="flex items-center gap-2"><MapPin size={11} /> {c.city}</div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Lifetime value</div>
                <div className="font-semibold">{inr(c.lifetime)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Customer since</div>
                <div className="text-xs">{dateShort(c.since)}</div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-1">
              <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-300">
                <Edit3 size={14} />
              </button>
              <button onClick={() => remove(c.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-gray-500 py-10">No customers found.</div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit customer" : "New customer"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Cancel</button>
            <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500">
              {editing ? "Save changes" : "Create customer"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></Field>
          <Field label="Company"><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputClass} /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></Field>
          <Field label="City"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Lifetime value (₹)">
              <input type="number" min={0} value={form.lifetime} onChange={(e) => setForm({ ...form, lifetime: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
