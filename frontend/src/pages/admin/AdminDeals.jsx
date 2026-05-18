import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Handshake, Search, Plus, Pencil, Trash2, Check } from "lucide-react";
import { api } from "../../lib/api.js";
import {
  modalInput, Field, ModalShell, ErrorBanner, StatusBadge, formatINR,
  FALLBACK_DEAL_STATUS_CHOICES, DEAL_STATUS_PALETTE,
} from "./_shared.jsx";

const DEAL_STATUS_CHOICES = FALLBACK_DEAL_STATUS_CHOICES;
import { Header } from "./AdminUsers.jsx";

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([api.getDeals(), api.getLeads(), api.getAdminUsers()])
      .then(([dealData, leadData, userData]) => {
        setDeals(dealData?.deals || []);
        setStats(dealData?.stats || null);
        setLeads(leadData?.leads || []);
        setUsers(userData || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return deals.filter((d) => {
      if (statusFilter && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(d.id) === search ||
        d.phone?.includes(search) ||
        d.name?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, deals]);

  const handleDelete = async (d) => {
    if (!confirm(`Delete deal #${d.id} (${d.name})? Payments will block this if any exist.`)) return;
    try {
      await api.deleteDeal(d.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="All Deals"
        subtitle={
          stats
            ? `${stats.total_deals} total · ${stats.open_deals} open · ${stats.won_deals} won · ${stats.cancelled_deals} cancelled`
            : null
        }
        onRefresh={load}
        refreshing={loading}
        actionLabel="New deal"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Handshake}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        >
          <option value="">All statuses</option>
          {DEAL_STATUS_CHOICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider bg-white/5 text-yellow-300">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">City</th>
              <th className="px-5 py-4">Brand</th>
              <th className="px-5 py-4 text-right">Deal value</th>
              <th className="px-5 py-4 text-right">Cost</th>
              <th className="px-5 py-4">Close date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">#{d.id}</td>
                <td className="px-5 py-4 font-semibold text-white">{d.name}</td>
                <td className="px-5 py-4 text-gray-300">{d.phone}</td>
                <td className="px-5 py-4 text-gray-300">{d.city}</td>
                <td className="px-5 py-4 text-gray-300">{d.brand_name}</td>
                <td className="px-5 py-4 text-right text-yellow-300 font-semibold">{formatINR(d.deal_value)}</td>
                <td className="px-5 py-4 text-right text-gray-300">{d.cost_price ? formatINR(d.cost_price) : "—"}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{d.expected_close_date || "—"}</td>
                <td className="px-5 py-4"><StatusBadge status={d.status} palette={DEAL_STATUS_PALETTE} /></td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => setEditing(d)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300 border border-white/10"
                      title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(d)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300 border border-white/10"
                      title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="10" className="text-center py-10 text-gray-500">
                {deals.length === 0 ? "No deals yet — click 'New deal' to add one." : "No matches."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <DealModal
            deal={editing}
            leads={leads}
            users={users}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DealModal({ deal, leads, users, onClose, onSaved }) {
  const isEdit = !!deal;
  const [form, setForm] = useState({
    lead: deal?.lead ?? "",
    deal_value: deal?.deal_value ?? "",
    cost_price: deal?.cost_price ?? "",
    status: deal?.status || "OPEN",
    expected_close_date: deal?.expected_close_date || "",
    assigned_to: deal?.assigned_to ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.lead) {
      setError("Pick a lead to attach this deal to.");
      return;
    }
    if (!form.deal_value) {
      setError("Deal value is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      payload.deal_value = Number(payload.deal_value);
      payload.cost_price = payload.cost_price === "" ? null : Number(payload.cost_price);
      payload.expected_close_date = payload.expected_close_date || null;
      if (payload.assigned_to === "") payload.assigned_to = null;
      if (isEdit) {
        await api.updateDeal(deal.id, payload);
      } else {
        await api.createDeal(payload);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={isEdit ? `Edit deal #${deal.id}` : "Create new deal"} onClose={onClose}>
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Lead *" wide>
          <select value={form.lead ?? ""}
            onChange={(e) => setForm({ ...form, lead: e.target.value })}
            className={modalInput} disabled={isEdit}>
            <option value="">— Select a lead —</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                #{l.id} · {l.name} · {l.city || "—"} · {l.brand_name}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="text-[10px] text-gray-500 mt-1">
              Lead cannot be changed after creation.
            </p>
          )}
        </Field>

        <Field label="Deal value (₹) *">
          <input type="number" value={form.deal_value}
            onChange={(e) => setForm({ ...form, deal_value: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Cost price (₹)">
          <input type="number" value={form.cost_price}
            onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Status">
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={modalInput}>
            {DEAL_STATUS_CHOICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Expected close date">
          <input type="date" value={form.expected_close_date}
            onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Assigned to" wide>
          <select value={form.assigned_to ?? ""}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
            className={modalInput}>
            <option value="">— Unassigned —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} ({u.role})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save" : "Create deal"}
        </button>
      </div>
    </ModalShell>
  );
}
