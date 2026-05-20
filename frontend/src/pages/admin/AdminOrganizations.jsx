import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Building2, Search, Plus, Pencil, Trash2, Check, Crown,
  Users, BarChart3, Briefcase, Layers,
} from "lucide-react";
import { api } from "../../lib/api.js";
import {
  modalInput, Field, ModalShell, ErrorBanner,
  INDUSTRY_CHOICES, PLAN_CHOICES, ORG_STATUS_CHOICES,
} from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

const PLAN_TINT = {
  FREE: "bg-gray-400/20 text-gray-300",
  PRO: "bg-sky-400/20 text-sky-300",
  ENTERPRISE: "bg-yellow-400/20 text-yellow-300",
};

const STATUS_TINT = {
  ACTIVE: "bg-emerald-400/20 text-emerald-300",
  TRIAL: "bg-sky-400/20 text-sky-300",
  SUSPENDED: "bg-red-500/20 text-red-300",
  CANCELLED: "bg-gray-500/20 text-gray-300",
};

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    api.getOrganizations()
      .then(setOrgs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter((o) => {
      if (planFilter && o.plan !== planFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q) ||
        (o.industry || "").toLowerCase().includes(q) ||
        (o.owner_username || "").toLowerCase().includes(q)
      );
    });
  }, [search, planFilter, orgs]);

  const handleDelete = async (o) => {
    if (o.slug === "default") {
      alert("Cannot delete the default organization.");
      return;
    }
    if (!confirm(`Delete organization "${o.name}"? All its users, leads, deals will be cascaded.`)) return;
    try {
      await api.deleteOrganization(o.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  // Aggregate top numbers for the header
  const totalUsers = orgs.reduce((s, o) => s + (o.user_count || 0), 0);
  const totalLeads = orgs.reduce((s, o) => s + (o.lead_count || 0), 0);
  const totalDeals = orgs.reduce((s, o) => s + (o.deal_count || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Organizations"
        subtitle={`${orgs.length} tenants · ${totalUsers} users · ${totalLeads} leads · ${totalDeals} deals`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New organization"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Building2}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug, industry, owner..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        >
          <option value="">All plans</option>
          {PLAN_CHOICES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 hover:border-yellow-400/30 transition-colors flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${o.primary_color || '#facc15'}, ${o.accent_color || '#38bdf8'})` }}
                >
                  {o.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate flex items-center gap-2">
                    {o.name}
                    {o.slug === "default" && <Crown size={12} className="text-yellow-400" />}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">/{o.slug}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${PLAN_TINT[o.plan]}`}>{o.plan}</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_TINT[o.status]}`}>{o.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
              <Mini icon={Users} label="Users" value={o.user_count} />
              <Mini icon={BarChart3} label="Leads" value={o.lead_count} />
              <Mini icon={Briefcase} label="Deals" value={o.deal_count} />
            </div>

            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Industry: <span className="text-gray-300">{o.industry}</span></p>
              <p>Owner: <span className="text-gray-300">{o.owner_username || "—"}</span></p>
              <p>Limit: <span className="text-gray-300">{o.max_users} users · {o.max_leads.toLocaleString()} leads</span></p>
            </div>

            <div className="flex justify-end gap-2 mt-auto pt-2">
              <button onClick={async () => {
                const tmpl = prompt(
                  "Apply industry template — type one of:\nGENERAL · SOLAR · REAL_ESTATE · HEALTHCARE · INSURANCE · LOGISTICS · EDUCATION",
                  o.industry,
                );
                if (!tmpl) return;
                try {
                  const res = await api.applyIndustryTemplate(o.id, tmpl);
                  alert(`Template applied!\nStages added: ${res.summary.stages_added}\nFields added: ${res.summary.fields_added}\nScore rules added: ${res.summary.rules_added}`);
                  load();
                } catch (e) { alert(e.message); }
              }}
                className="p-2 rounded-lg bg-white/5 hover:bg-violet-400/20 text-violet-300 border border-white/10"
                title="Apply industry template"><Layers size={14} /></button>
              <button onClick={() => setEditing(o)}
                className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300 border border-white/10"
                title="Edit"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(o)}
                disabled={o.slug === "default"}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            {orgs.length === 0 ? "No organizations yet — click 'New organization' to add one." : "No matches."}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <OrgModal
            org={editing}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Mini({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <Icon size={12} className="mx-auto text-gray-500 mb-1" />
      <p className="text-[9px] text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-bold text-white">{value || 0}</p>
    </div>
  );
}

function OrgModal({ org, onClose, onSaved }) {
  const isEdit = !!org;
  const [form, setForm] = useState({
    name: org?.name || "",
    industry: org?.industry || "GENERAL",
    plan: org?.plan || "FREE",
    status: org?.status || "ACTIVE",
    primary_color: org?.primary_color || "#facc15",
    accent_color: org?.accent_color || "#38bdf8",
    max_users: org?.max_users ?? 5,
    max_leads: org?.max_leads ?? 500,
    max_storage_mb: org?.max_storage_mb ?? 500,
    email: org?.email || "",
    phone: org?.phone || "",
    address: org?.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.name) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        max_users: Number(form.max_users),
        max_leads: Number(form.max_leads),
        max_storage_mb: Number(form.max_storage_mb),
      };
      if (isEdit) {
        await api.updateOrganization(org.id, payload);
      } else {
        await api.createOrganization(payload);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={isEdit ? `Edit — ${org.name}` : "Create new organization"} onClose={onClose} size="lg">
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name *" wide>
          <input value={form.name} autoFocus
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Real Estate"
            className={modalInput} />
        </Field>

        <Field label="Industry">
          <select value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className={modalInput}>
            {INDUSTRY_CHOICES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Plan">
          <select value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className={modalInput}>
            {PLAN_CHOICES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Status">
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={modalInput}>
            {ORG_STATUS_CHOICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Contact email">
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Phone">
          <input value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Address">
          <input value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Max users">
          <input type="number" min="1" value={form.max_users}
            onChange={(e) => setForm({ ...form, max_users: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Max leads">
          <input type="number" min="1" value={form.max_leads}
            onChange={(e) => setForm({ ...form, max_leads: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Storage cap (MB)">
          <input type="number" min="1" value={form.max_storage_mb}
            onChange={(e) => setForm({ ...form, max_storage_mb: e.target.value })}
            className={modalInput} />
        </Field>

        <Field label="Brand color">
          <input type="color" value={form.primary_color}
            onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10" />
        </Field>

        <Field label="Accent color" wide>
          <input type="color" value={form.accent_color}
            onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
            className="w-full h-10 rounded-lg bg-white/5 border border-white/10" />
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving..." : isEdit ? "Save" : "Create organization"}
        </button>
      </div>
    </ModalShell>
  );
}
