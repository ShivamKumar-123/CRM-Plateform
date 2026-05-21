import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Plus, Eye, Pencil, Trash2, X, Check, Search,
  Handshake, LayoutGrid, List, GripVertical,
} from "lucide-react";
import { api } from "../../lib/api.js";

const STATUS_PALETTE = {
  OPEN: "bg-sky-400 text-black",
  WON: "bg-emerald-400 text-black",
  CANCELLED: "bg-red-500 text-white",
};

const FALLBACK_STAGES = ["OPEN", "WON", "CANCELLED"];

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Deal() {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("kanban");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);

  // Drag state
  const [dragId, setDragId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.getDeals(),
      api.getDealPipeline().catch(() => []),
    ])
      .then(([data, pipelines]) => {
        setDeals(data?.deals || []);
        setStats(data?.stats || null);
        const def = (pipelines || []).find((p) => p.is_default) || pipelines?.[0];
        setStages(def?.stages || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stageList = stages.length ? stages.map((s) => s.slug) : FALLBACK_STAGES;
  const stageColors = useMemo(() => {
    const map = {};
    stages.forEach((s) => { map[s.slug] = s.color || null; });
    return map;
  }, [stages]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        String(d.id) === search ||
        d.phone?.includes(search) ||
        d.name?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
    );
  }, [deals, search]);

  const grouped = useMemo(() => {
    const g = {};
    stageList.forEach((s) => { g[s] = []; });
    filtered.forEach((d) => {
      const key = stageList.includes(d.status) ? d.status : (stageList[0] || "OPEN");
      (g[key] = g[key] || []).push(d);
    });
    return g;
  }, [filtered, stageList]);

  const stageValue = (slug) =>
    (grouped[slug] || []).reduce((s, d) => s + Number(d.deal_value || 0), 0);

  const handleDelete = async (d) => {
    if (!confirm(`Delete deal "${d.name}"?`)) return;
    try {
      await api.deleteDeal(d.id);
      load();
    } catch (e) { alert(e.message); }
  };

  /* ─── drag-drop ─── */
  const onDragStart = (id) => setDragId(id);
  const onDragOver = (col, e) => { e.preventDefault(); setDragOverCol(col); };
  const onDragEnd = () => { setDragId(null); setDragOverCol(null); };

  const onDrop = async (col, e) => {
    e.preventDefault();
    const deal = deals.find((x) => x.id === dragId);
    onDragEnd();
    if (!deal || deal.status === col) return;
    // optimistic update
    setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, status: col } : d));
    try {
      await api.updateDeal(deal.id, { ...deal, status: col });
    } catch (e) {
      alert(`Failed to move deal: ${e.message}`);
      load();
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Handshake size={20} className="text-black" />
            </span>
            Deals
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Drag cards between stages to update status.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                view === "kanban" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}>
              <LayoutGrid size={13} /> Kanban
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                view === "list" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}>
              <List size={13} /> List
            </button>
          </div>
          <button onClick={load}
            className="p-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-black font-semibold shadow-lg shadow-sky-500/30 hover:scale-[1.02] transition">
            <Plus size={16} /> New deal
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total" value={stats.total_deals ?? 0} />
          <Stat label="Open" value={stats.open_deals ?? 0} accent="text-sky-300" />
          <Stat label="Won" value={stats.won_deals ?? 0} accent="text-emerald-300" />
          <Stat label="Cancelled" value={stats.cancelled_deals ?? 0} accent="text-red-300" />
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, city, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40" />
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Kanban / List */}
      {view === "kanban" ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
          className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {stageList.map((slug) => (
              <KanbanColumn
                key={slug}
                slug={slug}
                color={stageColors[slug]}
                deals={grouped[slug] || []}
                value={stageValue(slug)}
                dragOver={dragOverCol === slug}
                onDragOver={(e) => onDragOver(slug, e)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => onDrop(slug, e)}
                onCardDragStart={onDragStart}
                onCardDragEnd={onDragEnd}
                onView={setViewing}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
          className="overflow-x-auto rounded-2xl bg-white/[0.03] border border-white/10">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider bg-white/5 text-sky-300">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">City</th>
                <th className="px-5 py-4 text-right">Value</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.04]">
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs">#{d.id}</td>
                  <td className="px-5 py-4 text-white font-semibold">{d.name}</td>
                  <td className="px-5 py-4 text-gray-300">{d.phone}</td>
                  <td className="px-5 py-4 text-gray-300">{d.city || "—"}</td>
                  <td className="px-5 py-4 text-right text-gray-300">{formatINR(d.deal_value)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_PALETTE[d.status] || "bg-gray-500 text-white"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-1.5">
                      <ActionBtn icon={Eye} onClick={() => setViewing(d)} color="sky" title="View" />
                      <ActionBtn icon={Pencil} onClick={() => setEditing(d)} color="yellow" title="Edit" />
                      <ActionBtn icon={Trash2} onClick={() => handleDelete(d)} color="red" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">
                  {deals.length === 0 ? "No deals yet — click 'New deal' to add one." : "No matches."}
                </td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <DealModal
            deal={editing}
            stageList={stageList}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
        {viewing && (
          <DealDetail
            deal={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { setEditing(viewing); setViewing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Kanban column ───────────────────────────────────── */

function KanbanColumn({
  slug, color, deals, value, dragOver,
  onDragOver, onDragLeave, onDrop,
  onCardDragStart, onCardDragEnd,
  onView, onEdit, onDelete,
}) {
  const headerColor = color || palette(slug);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-72 flex-shrink-0 rounded-2xl border transition ${
        dragOver
          ? "bg-yellow-400/10 border-yellow-400/50"
          : "bg-white/[0.03] border-white/10"
      }`}
    >
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: headerColor }} />
          <span className="text-sm font-bold text-white tracking-wide">{slug}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">{deals.length}</span>
      </div>
      <div className="px-3 py-1 text-[10px] text-gray-500 tracking-wider uppercase">
        {formatINR(value)}
      </div>
      <div className="p-3 space-y-2 min-h-[120px] max-h-[calc(100vh-340px)] overflow-y-auto">
        {deals.map((d) => (
          <motion.div
            key={d.id}
            layout
            draggable
            onDragStart={() => onCardDragStart(d.id)}
            onDragEnd={onCardDragEnd}
            whileHover={{ y: -2 }}
            className="group p-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-yellow-400/40 cursor-grab active:cursor-grabbing transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{d.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">#{d.id} · {d.phone}</p>
              </div>
              <GripVertical size={12} className="text-gray-600 mt-0.5 flex-shrink-0" />
            </div>
            <p className="text-base font-black text-amber-200 mt-2">{formatINR(d.deal_value)}</p>
            {d.city && <p className="text-[10px] text-gray-400 mt-0.5">{d.city}</p>}
            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => onView(d)}
                className="flex-1 py-1 rounded text-[10px] bg-sky-400/10 text-sky-300 hover:bg-sky-400/20">View</button>
              <button onClick={() => onEdit(d)}
                className="flex-1 py-1 rounded text-[10px] bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20">Edit</button>
              <button onClick={() => onDelete(d)}
                className="py-1 px-2 rounded text-[10px] bg-red-500/10 text-red-300 hover:bg-red-500/20">×</button>
            </div>
          </motion.div>
        ))}
        {deals.length === 0 && (
          <div className="text-center text-[11px] text-gray-600 py-6 italic">Drop here</div>
        )}
      </div>
    </div>
  );
}

function palette(slug) {
  const map = {
    OPEN: "#38BDF8",
    WON: "#34D399",
    CANCELLED: "#F87171",
    NEW: "#38BDF8",
    QUALIFIED: "#A78BFA",
    NEGOTIATION: "#F59E0B",
    LOST: "#F87171",
  };
  return map[slug] || "#9CA3AF";
}

/* ─── Stat pill ───────────────────────────────────── */
function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
      <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function ActionBtn({ icon: Icon, onClick, title, color = "yellow" }) {
  const map = {
    yellow: "hover:bg-yellow-400/15 text-yellow-300",
    sky: "hover:bg-sky-400/15 text-sky-300",
    red: "hover:bg-red-500/15 text-red-300",
  };
  return (
    <button onClick={onClick} title={title}
      className={`p-2 rounded-lg bg-white/5 border border-white/10 ${map[color]} transition`}>
      <Icon size={14} />
    </button>
  );
}

/* ─── Deal Add/Edit modal ──────────────────────────────── */

function DealModal({ deal, stageList, onClose, onSaved }) {
  const isEdit = !!deal;
  const [form, setForm] = useState({
    name: deal?.name || "",
    phone: deal?.phone || "",
    email: deal?.email || "",
    city: deal?.city || "",
    state: deal?.state || "",
    brand_name: deal?.brand_name || "",
    deal_value: deal?.deal_value ?? "",
    notes: deal?.notes || "",
    status: deal?.status || (stageList?.[0] || "OPEN"),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name aur Phone required hain.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      payload.deal_value = payload.deal_value === "" ? 0 : Number(payload.deal_value);
      if (isEdit) await api.updateDeal(deal.id, payload);
      else await api.createDeal(payload);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={isEdit ? `Edit deal — ${deal.name}` : "Create new deal"} onClose={onClose}>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-3 py-2.5 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Client name *">
          <Input value={form.name} autoFocus onChange={(v) => set("name", v)} />
        </ModalField>
        <ModalField label="Phone *">
          <Input value={form.phone} onChange={(v) => set("phone", v)} />
        </ModalField>
        <ModalField label="Email">
          <Input type="email" value={form.email} onChange={(v) => set("email", v)} />
        </ModalField>
        <ModalField label="Status">
          <Select value={form.status} onChange={(v) => set("status", v)} options={stageList} />
        </ModalField>
        <ModalField label="City">
          <Input value={form.city} onChange={(v) => set("city", v)} />
        </ModalField>
        <ModalField label="State">
          <Input value={form.state} onChange={(v) => set("state", v)} />
        </ModalField>
        <ModalField label="Brand / Product">
          <Input value={form.brand_name} onChange={(v) => set("brand_name", v)} />
        </ModalField>
        <ModalField label="Deal value (₹)">
          <Input type="number" value={form.deal_value} onChange={(v) => set("deal_value", v)} />
        </ModalField>
        <ModalField label="Notes" wide>
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40" />
        </ModalField>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save" : "Create deal"}
        </button>
      </div>
    </ModalShell>
  );
}

function DealDetail({ deal, onClose, onEdit }) {
  return (
    <ModalShell title={`Deal #${deal.id} — ${deal.name}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <Row label="Phone" value={deal.phone} />
        <Row label="Email" value={deal.email || "—"} />
        <Row label="Location" value={[deal.city, deal.state].filter(Boolean).join(", ") || "—"} />
        <Row label="Brand" value={deal.brand_name || "—"} />
        <Row label="Deal value" value={formatINR(deal.deal_value)} />
        <Row label="Status" value={
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_PALETTE[deal.status] || "bg-gray-500 text-white"}`}>
            {deal.status}
          </span>
        } />
        {deal.notes && (
          <div className="col-span-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{deal.notes}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">Close</button>
        <button onClick={onEdit}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 text-black font-semibold inline-flex items-center gap-2">
          <Pencil size={14} /> Edit
        </button>
      </div>
    </ModalShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <div className="text-sm text-gray-100">{value}</div>
    </div>
  );
}

function ModalShell({ title, children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl bg-gray-950 border border-sky-400/20 shadow-[0_20px_80px_rgba(56,189,248,0.15)] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalField({ label, wide, children }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 block font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, autoFocus }) {
  return (
    <input type={type} value={value ?? ""} placeholder={placeholder} autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40" />
  );
}

function Select({ value, onChange, options = [] }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default Deal;
