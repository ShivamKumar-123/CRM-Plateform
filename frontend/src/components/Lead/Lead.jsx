import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, RefreshCw, Search, Plus, Pencil, Trash2, Eye, X, Check,
  Phone, Mail, MapPin, Filter, MessageCircle, FileText, Clock, Sparkles,
  Upload, Download, Loader2,
} from "lucide-react";
import { api } from "../../lib/api.js";

const STATUS_PALETTE = {
  NEW: "bg-sky-400 text-black",
  CONTACTED: "bg-blue-400 text-black",
  QUALIFIED: "bg-violet-400 text-black",
  PROPOSAL_SENT: "bg-yellow-400 text-black",
  NEGOTIATION: "bg-amber-500 text-black",
  SITE_VISIT: "bg-yellow-400 text-black",
  QUOTATION_SENT: "bg-amber-500 text-black",
  WON: "bg-emerald-400 text-black",
  DEALED: "bg-emerald-400 text-black",
  LOST: "bg-red-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

const FALLBACK_STATUSES = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST",
];

const SOURCES = [
  "WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "DEALER", "PHONE", "EMAIL", "EVENT", "OTHER",
];

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function Lead() {
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.getLeads(),
      api.getLeadPipeline().catch(() => []),
    ])
      .then(([leadData, pipelines]) => {
        setLeads(leadData?.leads || []);
        const def = (pipelines || []).find((p) => p.is_default) || pipelines?.[0];
        setStages(def?.stages || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const statusChoices = stages.length
    ? stages.map((s) => s.slug)
    : FALLBACK_STATUSES;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(l.id) === search ||
        l.phone?.includes(search) ||
        l.name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  const handleDelete = async (l) => {
    if (!confirm(`Delete lead "${l.name}"? This will also remove related deals & documents.`)) return;
    try {
      await api.deleteLead(l.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const stats = useMemo(() => {
    return {
      total: leads.length,
      open: leads.filter((l) => !["WON", "DEALED", "LOST", "CANCELLED"].includes(l.status)).length,
      won: leads.filter((l) => l.status === "WON" || l.status === "DEALED").length,
      value: leads.reduce((sum, l) => sum + Number(l.base_price || 0), 0),
    };
  }, [leads]);

  return (
    <div className="relative min-h-screen p-6 md:p-8 space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <UserPlus size={20} className="text-black" />
              </span>
              Leads
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Manage prospects, track conversion, and add new leads.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg shadow-yellow-500/30 hover:scale-[1.02] transition"
            >
              <Plus size={16} /> New lead
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stat row */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Stat label="Total leads" value={stats.total} accent="text-yellow-300" />
        <Stat label="Open" value={stats.open} accent="text-sky-300" />
        <Stat label="Won" value={stats.won} accent="text-emerald-300" />
        <Stat label="Pipeline value" value={formatINR(stats.value)} accent="text-amber-200" />
      </motion.div>

      {/* Filter row */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 appearance-none"
          >
            <option value="">All statuses</option>
            {statusChoices.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => navigate("/app/deals")}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition text-sm font-medium"
        >
          Go to Deals →
        </button>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15 }}
        className="overflow-x-auto rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl"
      >
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider bg-white/5 text-yellow-300">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">City</th>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4 text-right">Value</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/5 hover:bg-white/[0.04] transition"
              >
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">#{lead.id}</td>
                <td className="px-5 py-4 text-white font-semibold">{lead.name}</td>
                <td className="px-5 py-4 text-gray-300">{lead.phone}</td>
                <td className="px-5 py-4 text-gray-300">{lead.city || "—"}</td>
                <td className="px-5 py-4 text-gray-300">{lead.product_name || lead.brand_name || "—"}</td>
                <td className="px-5 py-4 text-right text-gray-300">{formatINR(lead.base_price)}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${STATUS_PALETTE[lead.status] || "bg-gray-500 text-white"}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-1.5">
                    <ActionBtn icon={Eye} onClick={() => setViewing(lead)} title="View" color="sky" />
                    <ActionBtn icon={Pencil} onClick={() => setEditing(lead)} title="Edit" color="yellow" />
                    <ActionBtn icon={Trash2} onClick={() => handleDelete(lead)} title="Delete" color="red" />
                  </div>
                </td>
              </motion.tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-12 text-gray-500">
                  {leads.length === 0
                    ? "No leads yet — click 'New lead' to add your first."
                    : "No matches for current filters."}
                </td>
              </tr>
            )}
            {loading && (
              <tr><td colSpan="8" className="text-center py-12 text-gray-400">Loading…</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {(creating || editing) && (
          <LeadModal
            lead={editing}
            statusChoices={statusChoices}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
        {viewing && (
          <LeadDetail
            lead={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => { setEditing(viewing); setViewing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── UI primitives ──────────────────────────────────────── */

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
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg bg-white/5 border border-white/10 ${map[color]} transition`}
    >
      <Icon size={14} />
    </button>
  );
}

/* ─── Lead Add / Edit modal ──────────────────────────────── */

function LeadModal({ lead, statusChoices, onClose, onSaved }) {
  const isEdit = !!lead;
  const [form, setForm] = useState({
    name: lead?.name || "",
    phone: lead?.phone || "",
    email: lead?.email || "",
    city: lead?.city || "",
    state: lead?.state || "",
    pincode: lead?.pincode || "",
    leads_source: lead?.leads_source || "WEBSITE",
    product_name: lead?.product_name || lead?.brand_name || "",
    product_category: lead?.product_category || lead?.watt_capacity || "",
    brand_name: lead?.brand_name || "",
    base_price: lead?.base_price ?? "",
    notes: lead?.notes || "",
    status: lead?.status || (statusChoices?.[0] || "NEW"),
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
      payload.base_price = payload.base_price === "" ? 0 : Number(payload.base_price);
      if (isEdit) await api.updateLead(lead.id, payload);
      else await api.createLead(payload);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={isEdit ? `Edit lead — ${lead.name}` : "Add new lead"} onClose={onClose}>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-3 py-2.5 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <ModalField label="Name *">
          <Input value={form.name} autoFocus onChange={(v) => set("name", v)} />
        </ModalField>
        <ModalField label="Phone *">
          <Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 9..." />
        </ModalField>
        <ModalField label="Email">
          <Input type="email" value={form.email} onChange={(v) => set("email", v)} />
        </ModalField>
        <ModalField label="Source">
          <Select value={form.leads_source} onChange={(v) => set("leads_source", v)} options={SOURCES} />
        </ModalField>
        <ModalField label="City">
          <Input value={form.city} onChange={(v) => set("city", v)} />
        </ModalField>
        <ModalField label="State">
          <Input value={form.state} onChange={(v) => set("state", v)} />
        </ModalField>
        <ModalField label="Pincode">
          <Input value={form.pincode} onChange={(v) => set("pincode", v)} />
        </ModalField>
        <ModalField label="Estimated value (₹)">
          <Input type="number" value={form.base_price} onChange={(v) => set("base_price", v)} />
        </ModalField>
        <ModalField label="Product / service" wide>
          <Input value={form.product_name} onChange={(v) => set("product_name", v)}
                 placeholder="e.g. 5kW rooftop solar, 3BHK apartment" />
        </ModalField>
        <ModalField label="Category">
          <Input value={form.product_category} onChange={(v) => set("product_category", v)}
                 placeholder="e.g. Residential" />
        </ModalField>
        <ModalField label="Status">
          <Select value={form.status} onChange={(v) => set("status", v)} options={statusChoices} />
        </ModalField>
        <ModalField label="Notes" wide>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </ModalField>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2"
        >
          <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save changes" : "Create lead"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ─── Lead Detail (tabbed: Overview / Activity / Documents / AI) ─── */

const LEAD_TABS = [
  { key: "overview", label: "Overview", icon: Eye },
  { key: "activity", label: "Activity", icon: Clock },
  { key: "docs", label: "Documents", icon: FileText },
  { key: "ai", label: "AI", icon: Sparkles },
];

function LeadDetail({ lead, onClose, onEdit }) {
  const [tab, setTab] = useState("overview");
  return (
    <ModalShell title={`Lead #${lead.id} — ${lead.name}`} onClose={onClose}>
      <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/5 border border-white/10">
        {LEAD_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
              tab === t.key
                ? "bg-gradient-to-r from-yellow-400/20 to-amber-500/10 text-yellow-300 border border-yellow-400/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <LeadOverview lead={lead} />}
      {tab === "activity" && <LeadActivity leadId={lead.id} />}
      {tab === "docs" && <LeadDocuments leadId={lead.id} />}
      {tab === "ai" && <LeadAI leadId={lead.id} />}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Close
        </button>
        <button onClick={onEdit} className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2">
          <Pencil size={14} /> Edit
        </button>
      </div>
    </ModalShell>
  );
}

function LeadOverview({ lead }) {
  const phone = lead.phone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return (
    <>
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {phone && (
          <a href={`tel:${phone}`} className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold inline-flex items-center gap-2 hover:bg-sky-500/20">
            <Phone size={12} /> Call
          </a>
        )}
        {cleanPhone && (
          <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold inline-flex items-center gap-2 hover:bg-emerald-500/20">
            <MessageCircle size={12} /> WhatsApp
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold inline-flex items-center gap-2 hover:bg-violet-500/20">
            <Mail size={12} /> Email
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailRow icon={Phone} label="Phone" value={lead.phone} />
        <DetailRow icon={Mail} label="Email" value={lead.email || "—"} />
        <DetailRow icon={MapPin} label="Location"
                   value={[lead.city, lead.state, lead.pincode].filter(Boolean).join(", ") || "—"} />
        <DetailRow label="Source" value={lead.leads_source} />
        <DetailRow label="Product" value={lead.product_name || lead.brand_name || "—"} />
        <DetailRow label="Category" value={lead.product_category || lead.watt_capacity || "—"} />
        <DetailRow label="Estimated value" value={formatINR(lead.base_price)} />
        <DetailRow label="Assigned to" value={lead.assigned_to_username || "—"} />
        <DetailRow label="Status" value={
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_PALETTE[lead.status] || "bg-gray-500 text-white"}`}>
            {lead.status}
          </span>
        } />
        <DetailRow label="Score" value={`${lead.score ?? 0} / 100`} />
        {lead.notes && (
          <div className="col-span-2 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}

function LeadActivity({ leadId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ notes: "", outcome: "CONNECTED", duration_seconds: 0 });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setErr("");
    api.getCallLogs(leadId)
      .then((data) => setLogs(Array.isArray(data) ? data : (data?.results || [])))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const addLog = async (e) => {
    e.preventDefault();
    if (!form.notes.trim()) return;
    setBusy(true);
    try {
      await api.createCallLog({ lead: leadId, ...form });
      setForm({ notes: "", outcome: "CONNECTED", duration_seconds: 0 });
      load();
    } catch (ex) { alert(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={addLog} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">Log a call</p>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="What happened on the call?"
          rows={2}
          className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-yellow-400/50 outline-none"
        />
        <div className="flex gap-2">
          <select
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value })}
            className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
          >
            <option value="CONNECTED">Connected</option>
            <option value="NO_ANSWER">No answer</option>
            <option value="BUSY">Busy</option>
            <option value="VOICEMAIL">Voicemail</option>
            <option value="WRONG_NUMBER">Wrong number</option>
          </select>
          <input
            type="number"
            min="0"
            value={form.duration_seconds}
            onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })}
            placeholder="sec"
            className="w-24 p-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
          />
          <button
            type="submit"
            disabled={busy || !form.notes.trim()}
            className="px-4 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-xs disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
          </button>
        </div>
      </form>

      {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 text-xs">{err}</div>}
      {loading && <p className="text-center text-xs text-gray-500 py-4">Loading…</p>}
      {!loading && logs.length === 0 && (
        <p className="text-center text-xs text-gray-500 py-6">No activity logged for this lead yet.</p>
      )}

      <ul className="space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest text-yellow-300 font-bold">
                {l.outcome || "Note"}
              </span>
              <span className="text-[10px] text-gray-500">
                {l.created_at ? new Date(l.created_at).toLocaleString() : ""}
              </span>
            </div>
            {l.notes && <p className="text-sm text-gray-200 whitespace-pre-wrap">{l.notes}</p>}
            {l.duration_seconds > 0 && (
              <p className="text-[11px] text-gray-500 mt-1">Duration: {l.duration_seconds}s</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadDocuments({ leadId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("AADHAAR");

  const load = useCallback(() => {
    setLoading(true); setErr("");
    api.getDocuments()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        setDocs(list.filter((d) => d.lead === leadId));
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("lead", String(leadId));
      fd.append("document_type", docType);
      fd.append("document_file", file);
      await api.uploadDocument(fd);
      load();
    } catch (ex) { alert(ex.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const remove = async (id) => {
    if (!confirm("Delete this document?")) return;
    try { await api.deleteDocument(id); load(); }
    catch (ex) { alert(ex.message); }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mr-2">Upload</p>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="p-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
        >
          <option value="AADHAAR">Aadhaar</option>
          <option value="PAN">PAN</option>
          <option value="ADDRESS_PROOF">Address Proof</option>
          <option value="INCOME_PROOF">Income Proof</option>
          <option value="PASSBOOK">Passbook</option>
          <option value="CONTRACT">Contract</option>
          <option value="INVOICE">Invoice</option>
          <option value="OTHER">Other</option>
        </select>
        <label className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer">
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? "Uploading…" : "Choose file"}
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={upload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 text-xs">{err}</div>}
      {loading && <p className="text-center text-xs text-gray-500 py-4">Loading…</p>}
      {!loading && docs.length === 0 && (
        <p className="text-center text-xs text-gray-500 py-6">No documents uploaded for this lead.</p>
      )}

      <ul className="space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <FileText size={16} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{d.document_type}</p>
              <p className="text-[10px] text-gray-500">
                {d.created_at ? new Date(d.created_at).toLocaleDateString() : ""}
              </p>
            </div>
            {d.document_file && (
              <a
                href={d.document_file}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 hover:bg-sky-500/20"
                title="Open"
              >
                <Download size={12} />
              </a>
            )}
            <button
              onClick={() => remove(d.id)}
              className="p-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadAI({ leadId }) {
  const [summary, setSummary] = useState(null);
  const [followup, setFollowup] = useState(null);
  const [loadingKind, setLoadingKind] = useState(null);
  const [err, setErr] = useState("");

  const run = async (kind) => {
    setLoadingKind(kind); setErr("");
    try {
      if (kind === "summary") {
        const r = await api.aiSummarizeLead(leadId);
        setSummary(r?.summary || r?.result || JSON.stringify(r));
      } else {
        const r = await api.aiSuggestFollowup(leadId);
        setFollowup(r?.suggestion || r?.result || JSON.stringify(r));
      }
    } catch (ex) { setErr(ex.message); }
    finally { setLoadingKind(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => run("summary")}
          disabled={loadingKind !== null}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 border border-violet-400/30 text-violet-200 text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loadingKind === "summary" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Summarize lead
        </button>
        <button
          onClick={() => run("followup")}
          disabled={loadingKind !== null}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500/20 to-cyan-500/10 border border-sky-400/30 text-sky-200 text-xs font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loadingKind === "followup" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Suggest follow-up
        </button>
      </div>

      {err && <div className="p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 text-xs">{err}</div>}

      {summary && (
        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-400/20">
          <p className="text-[10px] uppercase tracking-widest text-violet-300 font-bold mb-2">Summary</p>
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {followup && (
        <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-400/20">
          <p className="text-[10px] uppercase tracking-widest text-sky-300 font-bold mb-2">Suggested follow-up</p>
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{followup}</p>
        </div>
      )}

      {!summary && !followup && !loadingKind && !err && (
        <p className="text-center text-xs text-gray-500 py-4">Click a button to get AI insights.</p>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 flex items-center gap-1.5">
        {Icon && <Icon size={11} />} {label}
      </p>
      <div className="text-sm text-gray-100">{value}</div>
    </div>
  );
}

/* ─── Reusable inputs ──────────────────────────────────── */

function ModalShell({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl bg-gray-950 border border-yellow-400/20 shadow-[0_20px_80px_rgba(250,204,21,0.15)] p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
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
    <input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
    />
  );
}

function Select({ value, onChange, options = [] }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default Lead;
