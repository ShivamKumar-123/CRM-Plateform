import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  UserPlus, Search, Plus, Pencil, Trash2, Check,
} from "lucide-react";
import { api } from "../../lib/api.js";
import {
  modalInput, Field, ModalShell, ErrorBanner, StatusBadge, formatINR,
  LEAD_SOURCE_CHOICES, FALLBACK_LEAD_STATUS_CHOICES, LEAD_STATUS_PALETTE,
  PRIORITY_PALETTE,
} from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.getLeads(),
      api.getAdminUsers(),
      api.getLeadPipeline().catch(() => []),
      api.getCustomFields("lead").catch(() => []),
    ])
      .then(([leadData, userData, pipelines, fields]) => {
        setLeads(leadData?.leads || []);
        setUsers(userData || []);
        const def = (pipelines || []).find((p) => p.is_default) || pipelines?.[0];
        setPipelineStages(def?.stages || []);
        setCustomFields((fields || []).filter((f) => f.is_active).sort((a, b) => a.position - b.position));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const statusChoices = pipelineStages.length
    ? pipelineStages.map((s) => s.slug)
    : FALLBACK_LEAD_STATUS_CHOICES;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(l.id) === search ||
        l.phone?.includes(search) ||
        l.name?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        (l.assigned_to_username || "").toLowerCase().includes(q)
      );
    });
  }, [search, statusFilter, leads]);

  const handleDelete = async (l) => {
    if (!confirm(`Delete lead "${l.name}"? This will cascade-delete its deals & documents.`)) return;
    try {
      await api.deleteLead(l.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="All Leads"
        subtitle={`${leads.length} total · across every user`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New lead"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={UserPlus}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city, assignee, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        >
          <option value="">All statuses</option>
          {statusChoices.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider bg-white/5 text-yellow-300">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">City</th>
              <th className="px-5 py-4">Product/Brand</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4 text-right">Value ₹</th>
              <th className="px-5 py-4">Assigned</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">#{l.id}</td>
                <td className="px-5 py-4 font-semibold text-white">{l.name}</td>
                <td className="px-5 py-4 text-gray-300">{l.phone}</td>
                <td className="px-5 py-4 text-gray-300">{l.city}</td>
                <td className="px-5 py-4 text-gray-300">{l.product_name || l.brand_name || "—"}</td>
                <td className="px-5 py-4 text-gray-300">{l.product_category || l.watt_capacity || "—"}</td>
                <td className="px-5 py-4 text-right text-gray-300">{formatINR(l.base_price)}</td>
                <td className="px-5 py-4 text-gray-300">{l.assigned_to_username || "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={l.priority} palette={PRIORITY_PALETTE} />
                    <span className="text-xs text-gray-500 font-mono">{l.score ?? 0}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><StatusBadge status={l.status} palette={LEAD_STATUS_PALETTE} /></td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => setEditing(l)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300 border border-white/10"
                      title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(l)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300 border border-white/10"
                      title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="10" className="text-center py-10 text-gray-500">
                {leads.length === 0 ? "No leads yet — click 'New lead' to add one." : "No matches."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <LeadModal
            lead={editing}
            users={users}
            statusChoices={statusChoices}
            customFields={customFields}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadModal({ lead, users, statusChoices, customFields = [], onClose, onSaved }) {
  const isEdit = !!lead;
  const [duplicates, setDuplicates] = useState([]);

  // Fetch duplicates when editing
  useEffect(() => {
    if (!lead?.id) return;
    api.getLeadDuplicates(lead.id)
      .then((d) => setDuplicates(d?.duplicates || []))
      .catch(() => {});
  }, [lead?.id]);

  const mergeAndClose = async (sourceId) => {
    if (!confirm(`Merge lead #${sourceId} INTO this lead (#${lead.id})? The other lead will be deleted.`)) return;
    try {
      await api.mergeLeads(lead.id, sourceId);
      onSaved();
    } catch (e) { alert(e.message); }
  };
  const [form, setForm] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    city: lead?.city || "",
    state: lead?.state || "",
    pincode: lead?.pincode || "",
    leads_source: lead?.leads_source || "WEBSITE",
    product_name: lead?.product_name || lead?.brand_name || "",
    product_category: lead?.product_category || lead?.watt_capacity || "",
    brand_name: lead?.brand_name || "",
    model_name: lead?.model_name || "",
    watt_capacity: lead?.watt_capacity || "",
    base_price: lead?.base_price ?? "",
    tags: lead?.tags || "",
    notes: lead?.notes || "",
    status: lead?.status || (statusChoices?.[0] || "NEW"),
    assigned_to: lead?.assigned_to ?? "",
  });
  // Custom field values keyed by slug
  const [cfValues, setCfValues] = useState(() => {
    const init = {};
    customFields.forEach((f) => {
      const existing = lead?.custom_fields?.[f.slug];
      if (existing !== undefined) init[f.slug] = existing;
      else if (f.default_value) init[f.slug] = f.default_value;
      else if (f.field_type === "checkbox") init[f.slug] = false;
      else if (f.field_type === "multiselect") init[f.slug] = [];
      else init[f.slug] = "";
    });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      payload.base_price = payload.base_price === "" ? 0 : Number(payload.base_price);
      if (payload.assigned_to === "") payload.assigned_to = null;
      // Include custom field values
      if (customFields.length > 0) payload.custom_fields = cfValues;
      if (isEdit) {
        await api.updateLead(lead.id, payload);
      } else {
        await api.createLead(payload);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={isEdit ? `Edit lead — ${lead.name}` : "Create new lead"} onClose={onClose} size="lg">
      {error && <ErrorBanner msg={error} />}

      {isEdit && duplicates.length > 0 && (
        <div className="rounded-xl bg-orange-400/10 border border-orange-400/30 p-3 mb-4">
          <p className="text-sm font-bold text-orange-300 mb-2 flex items-center gap-2">
            ⚠ {duplicates.length} possible duplicate{duplicates.length !== 1 ? "s" : ""} found (same phone or email)
          </p>
          <div className="space-y-1">
            {duplicates.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2 text-xs bg-white/5 rounded-lg px-3 py-2">
                <span className="text-gray-300 truncate">
                  #{d.id} <strong>{d.name}</strong> · {d.phone} · {d.city || "—"} · status: {d.status}
                </span>
                <button
                  onClick={() => mergeAndClose(d.id)}
                  className="px-3 py-1 rounded bg-orange-400/20 text-orange-300 text-[10px] font-bold hover:bg-orange-400/30"
                >
                  Merge into this
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEdit && lead && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              lead.priority === "HOT" ? "bg-red-500 text-white" :
              lead.priority === "WARM" ? "bg-yellow-400 text-black" :
              "bg-sky-400 text-black"
            }`}>{lead.priority || "COLD"}</span>
            <div>
              <p className="text-sm font-semibold text-white">Score: {lead.score ?? 0}/100</p>
              <p className="text-[10px] text-gray-500">Auto-updated by activity events</p>
            </div>
          </div>
          <div className="w-32 h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 via-yellow-400 to-red-500"
              style={{ width: `${Math.min(100, lead.score || 0)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *">
          <input value={form.name} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Phone *">
          <input value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Source">
          <select value={form.leads_source}
            onChange={(e) => setForm({ ...form, leads_source: e.target.value })}
            className={modalInput}>
            {LEAD_SOURCE_CHOICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="City">
          <input value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="State">
          <input value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Pincode">
          <input value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Estimated value (₹)">
          <input type="number" value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Product / service" wide>
          <input value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            placeholder="e.g. 5kW rooftop solar / 3BHK apartment / Health checkup"
            className={modalInput} />
        </Field>
        <Field label="Category">
          <input value={form.product_category}
            onChange={(e) => setForm({ ...form, product_category: e.target.value })}
            placeholder="e.g. Residential, Commercial"
            className={modalInput} />
        </Field>
        <Field label="Brand">
          <input value={form.brand_name}
            onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            placeholder="Optional"
            className={modalInput} />
        </Field>
        <Field label="Status">
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={modalInput}>
            {(statusChoices || FALLBACK_LEAD_STATUS_CHOICES).map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma-separated)">
          <input value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="vip, repeat-customer"
            className={modalInput} />
        </Field>

        <Field label="Notes" wide>
          <textarea value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
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

      {customFields.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-yellow-300 font-bold mb-3">
            Custom fields ({customFields.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {customFields.map((f) => (
              <CustomFieldInput
                key={f.id}
                field={f}
                value={cfValues[f.slug]}
                onChange={(v) => setCfValues({ ...cfValues, [f.slug]: v })}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save changes" : "Create lead"}
        </button>
      </div>
    </ModalShell>
  );
}

/* Renders one custom-field input based on field_type. */
function CustomFieldInput({ field, value, onChange }) {
  const label = field.name + (field.required ? " *" : "");
  const wide = ["textarea", "multiselect"].includes(field.field_type);

  const inputType =
    field.field_type === "email" ? "email" :
    field.field_type === "phone" ? "tel" :
    field.field_type === "url" ? "url" :
    field.field_type === "number" ? "number" :
    field.field_type === "date" ? "date" :
    field.field_type === "datetime" ? "datetime-local" :
    "text";

  return (
    <Field label={label} wide={wide}>
      {field.field_type === "textarea" ? (
        <textarea rows={3} className={modalInput}
          value={value || ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} />
      ) : field.field_type === "select" ? (
        <select className={modalInput} value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          {(field.choices || []).map((c) => <option key={c}>{c}</option>)}
        </select>
      ) : field.field_type === "multiselect" ? (
        <select multiple className={modalInput + " min-h-[80px]"}
          value={Array.isArray(value) ? value : []}
          onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((o) => o.value))}>
          {(field.choices || []).map((c) => <option key={c}>{c}</option>)}
        </select>
      ) : field.field_type === "checkbox" ? (
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
          <input type="checkbox" checked={!!value}
            onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-gray-300">{field.help_text || "Toggle"}</span>
        </label>
      ) : (
        <input type={inputType} className={modalInput}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}
      {field.help_text && field.field_type !== "checkbox" && (
        <p className="text-[10px] text-gray-500 mt-1">{field.help_text}</p>
      )}
    </Field>
  );
}
