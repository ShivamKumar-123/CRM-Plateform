import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Users, Crown, ShieldCheck, UserCheck, UserX, Search, RefreshCw,
  Plus, Pencil, Trash2, Check, AlertTriangle,
} from "lucide-react";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  modalInput, Field, Toggle, ModalShell, ErrorBanner,
  ROLE_CHOICES, USER_STATUS_CHOICES,
} from "./_shared.jsx";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    api.getAdminUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
      );
    });
  }, [search, roleFilter, users]);

  const handleDelete = async (u) => {
    if (u.id === currentUserId) {
      alert("You cannot delete yourself.");
      return;
    }
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await api.deleteAdminUser(u.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Users"
        subtitle={`${users.length} total · ${users.filter((u) => u.is_active).length} active · ${users.filter((u) => u.is_superuser).length} super`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New user"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        >
          <option value="">All roles</option>
          {ROLE_CHOICES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs uppercase tracking-wider bg-white/5 text-yellow-300">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Flags</th>
              <th className="px-5 py-4 text-right">Leads</th>
              <th className="px-5 py-4 text-right">Deals</th>
              <th className="px-5 py-4">Joined</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-black flex-shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white flex items-center gap-2">
                        {u.username}
                        {u.is_superuser && <Crown size={12} className="text-yellow-400" />}
                        {u.id === currentUserId && (
                          <span className="text-[10px] text-gray-500">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{u.email || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-300">{u.role}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    u.status === "ACTIVE"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-red-400/20 text-red-300"
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {u.is_active ? (
                      <span title="Active" className="text-emerald-400"><UserCheck size={14} /></span>
                    ) : (
                      <span title="Disabled" className="text-red-400"><UserX size={14} /></span>
                    )}
                    {u.is_staff && <span title="Staff" className="text-sky-400"><ShieldCheck size={14} /></span>}
                    {u.is_superuser && <span title="Super" className="text-yellow-400"><Crown size={14} /></span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-300">{u.lead_count}</td>
                <td className="px-5 py-4 text-right text-gray-300">{u.deal_count}</td>
                <td className="px-5 py-4 text-xs text-gray-500">
                  {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => setEditing(u)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300 border border-white/10"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={u.id === currentUserId}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  {users.length === 0 ? "No users yet." : "No matches."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <UserEditModal
            user={editing}
            isSelf={editing.id === currentUserId}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
        {creating && (
          <UserCreateModal
            onClose={() => setCreating(false)}
            onSaved={() => { setCreating(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Modals ── */

function UserEditModal({ user, isSelf, onClose, onSaved }) {
  const [form, setForm] = useState({
    email: user.email || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    role: user.role,
    status: user.status,
    is_active: user.is_active,
    is_staff: user.is_staff,
    is_superuser: user.is_superuser,
    company_name: user.company_name || "",
    gst_number: user.gst_number || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api.updateAdminUser(user.id, payload);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Edit user — ${user.username}`} onClose={onClose}>
      {isSelf && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-200 flex items-center gap-2">
          <AlertTriangle size={14} /> Editing your own account — be careful with role/superuser flags.
        </div>
      )}
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Status">
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={modalInput}>
            {USER_STATUS_CHOICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="First name">
          <input value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Last name">
          <input value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Role" wide>
          <select value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={modalInput}>
            {ROLE_CHOICES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Company name">
          <input value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="GST number">
          <input value={form.gst_number}
            onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="New password (leave blank to keep)" wide>
          <input type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            className={modalInput} />
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <Toggle label="Account active" checked={form.is_active}
          onChange={(v) => setForm({ ...form, is_active: v })} />
        <Toggle label="Staff (Django admin access)" checked={form.is_staff}
          onChange={(v) => setForm({ ...form, is_staff: v })} />
        <Toggle label="Superuser (full system control)" checked={form.is_superuser}
          onChange={(v) => setForm({ ...form, is_superuser: v })} />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </ModalShell>
  );
}

function UserCreateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "SALES",
    status: "ACTIVE",
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.createAdminUser(form);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Create new user" onClose={onClose}>
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Username *" wide>
          <input value={form.username} autoFocus
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Password *">
          <input type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
            className={modalInput} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="First name">
          <input value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Last name">
          <input value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className={modalInput} />
        </Field>
        <Field label="Role">
          <select value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={modalInput}>
            {ROLE_CHOICES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={modalInput}>
            {USER_STATUS_CHOICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-4 space-y-2">
        <Toggle label="Account active" checked={form.is_active}
          onChange={(v) => setForm({ ...form, is_active: v })} />
        <Toggle label="Staff (Django admin)" checked={form.is_staff}
          onChange={(v) => setForm({ ...form, is_staff: v })} />
        <Toggle label="Superuser" checked={form.is_superuser}
          onChange={(v) => setForm({ ...form, is_superuser: v })} />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10">
          Cancel
        </button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-60 inline-flex items-center gap-2">
          <Plus size={14} /> {saving ? "Creating..." : "Create user"}
        </button>
      </div>
    </ModalShell>
  );
}

/* Shared header used at top of admin pages */
export function Header({ title, subtitle, onRefresh, refreshing, actionLabel, actionIcon: ActionIcon, onAction, accent = Users }) {
  const Accent = accent;
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-3">
          <Accent size={12} className="text-yellow-400" />
          <span className="text-[10px] tracking-widest uppercase text-yellow-300 font-bold">
            Super admin
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg hover:shadow-yellow-500/40"
          >
            {ActionIcon && <ActionIcon size={16} />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
