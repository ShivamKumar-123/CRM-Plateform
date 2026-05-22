import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Search, Mail, Trash2, Pencil, Check, X, Shield,
} from "lucide-react";
import { db, uid } from "../../lib/db.js";
import { PageHeader, Panel, Badge, timeAgo, ROLE_COLORS } from "./_shared.jsx";

const ROLES = ["OWNER", "ADMIN", "MANAGER", "SALES", "SUPPORT"];

export default function AdminTeam() {
  const [users, setUsers] = useState(() => db.get("users") || []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const saveUser = (data) => {
    if (editing) {
      const updated = users.map((u) => (u.id === editing.id ? { ...u, ...data } : u));
      setUsers(updated);
      db.set("users", updated);
    } else {
      const newUser = {
        id: uid("u"),
        avatar: data.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
        status: "Active",
        createdAt: Date.now(),
        lastLogin: null,
        company: "Acme Solar",
        ...data,
      };
      const updated = [newUser, ...users];
      setUsers(updated);
      db.set("users", updated);
    }
    setShowModal(false);
    setEditing(null);
  };

  const removeUser = (u) => {
    if (u.role === "OWNER") { alert("Cannot delete the OWNER. Demote them first."); return; }
    if (!confirm(`Delete ${u.name}?`)) return;
    const updated = users.filter((x) => x.id !== u.id);
    setUsers(updated);
    db.set("users", updated);
  };

  const toggleStatus = (u) => {
    const next = u.status === "Active" ? "Inactive" : "Active";
    const updated = users.map((x) => (x.id === u.id ? { ...x, status: next } : x));
    setUsers(updated);
    db.set("users", updated);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={Users}
        title="Team"
        subtitle={`${users.length} members · ${users.filter((u) => u.status === "Active").length} active`}
        action={
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-2"
          >
            <UserPlus size={14} /> Add User
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-yellow-400/50 outline-none"
        />
      </div>

      {/* Table */}
      <Panel title="Members">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-white/10">
              <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3 font-bold">Member</th>
                <th className="px-5 py-3 font-bold">Role</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Last login</th>
                <th className="px-5 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <motion.tr
                  key={u.id}
                  layout
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xs font-bold text-black">
                        {u.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{u.name}</p>
                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                          <Mail size={9} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={ROLE_COLORS[u.role] || "gray"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider transition ${
                        u.status === "Active"
                          ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-400/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
                      }`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {u.lastLogin ? timeAgo(u.lastLogin) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setEditing(u); setShowModal(true); }}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => removeUser(u)}
                        disabled={u.role === "OWNER"}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={u.role === "OWNER" ? "Cannot delete OWNER" : "Delete"}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                    No users match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <UserModal
            user={editing}
            onSave={saveUser}
            onClose={() => { setShowModal(false); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "SALES",
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-yellow-400/20 p-6 shadow-[0_20px_80px_rgba(250,204,21,0.15)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white inline-flex items-center gap-2">
            <Shield size={18} className="text-yellow-400" />
            {user ? "Edit user" : "Add user"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              placeholder="user@yourcompany.com"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-1.5">
            <Check size={14} /> {user ? "Save" : "Create"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
