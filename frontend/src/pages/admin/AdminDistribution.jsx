import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Users2, Plus, Edit3, Trash2, History } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, Toggle, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STRATEGIES = [
  { id: "ROUND_ROBIN", label: "Round robin" },
  { id: "LEAST_LOADED", label: "Least loaded" },
  { id: "TERRITORY", label: "Territory based" },
  { id: "WEIGHTED", label: "Weighted" },
  { id: "SKILL", label: "Skill based" },
];

const ACTIVE_PALETTE = {
  TRUE: "bg-emerald-400 text-black",
  FALSE: "bg-gray-500 text-white",
};

export default function AdminDistribution() {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function load() {
    api.getDistributionRules().then(setRules).catch((e) => setErr(e.message));
    api.getAssignmentLogs().then(setLogs).catch(() => {});
    api.getAdminUsers().then(setUsers).catch(() => {});
  }
  useEffect(load, []);

  function remove(id) {
    if (!confirm("Delete this distribution rule?")) return;
    api.deleteDistributionRule(id).then(load).catch((e) => setErr(e.message));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users2 className="text-yellow-400" /> Lead distribution
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Auto-assign new leads with round-robin, least-loaded, territory, weighted or skill matching.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold"
        >
          <Plus size={14} /> New rule
        </button>
      </header>

      {err && <ErrorBanner msg={err} />}

      <Panel title="Active rules" accent="text-yellow-300">
        {rules.length === 0 ? <Empty msg="No distribution rules yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">Priority</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Strategy</th>
                  <th className="text-left px-3 py-2">Eligible</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="px-3 py-2 text-gray-400">{r.priority}</td>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 text-xs">{r.strategy.replace("_", " ").toLowerCase()}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">
                      {(r.eligible_users_detail || []).map((u) => u.username).slice(0, 3).join(", ") || "—"}
                      {(r.eligible_users_detail || []).length > 3 && ` +${r.eligible_users_detail.length - 3}`}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={String(r.is_active).toUpperCase()} palette={ACTIVE_PALETTE} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => setEditing(r)} className="text-yellow-300 hover:text-yellow-200"><Edit3 size={14} /></button>
                        <button onClick={() => remove(r.id)} className="text-red-300 hover:text-red-200"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="h-6" />

      <Panel title={<span><History size={14} className="inline mr-2" />Recent assignments</span>} accent="text-sky-300">
        {logs.length === 0 ? <Empty msg="No assignments yet — create a rule and add some leads." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">When</th>
                  <th className="text-left px-3 py-2">Lead</th>
                  <th className="text-left px-3 py-2">Assignee</th>
                  <th className="text-left px-3 py-2">Rule</th>
                  <th className="text-left px-3 py-2">Strategy</th>
                  <th className="text-left px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-3 py-2 text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{l.lead_name}</td>
                    <td className="px-3 py-2 text-yellow-300">{l.assigned_to_username}</td>
                    <td className="px-3 py-2">{l.rule_name || "—"}</td>
                    <td className="px-3 py-2 text-gray-400">{l.strategy}</td>
                    <td className="px-3 py-2 text-gray-400 truncate max-w-[260px]">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {(creating || editing) && (
          <RuleModal
            rule={editing}
            users={users}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleModal({ rule, users, onClose, onSaved }) {
  const isEdit = !!rule;
  const [form, setForm] = useState(() => ({
    name: rule?.name || "",
    strategy: rule?.strategy || "ROUND_ROBIN",
    is_active: rule?.is_active ?? true,
    priority: rule?.priority ?? 10,
    eligible_user_ids: rule?.eligible_users_detail?.map((u) => u.id) || [],
    weights: rule?.weights ? JSON.stringify(rule.weights, null, 2) : "{}",
    skills_required: (rule?.skills_required || []).join(", "),
    match_filter: rule?.match_filter ? JSON.stringify(rule.match_filter, null, 2) : "{}",
  }));
  const [err, setErr] = useState(null);

  function toggleUser(id) {
    setForm((f) => ({
      ...f,
      eligible_user_ids: f.eligible_user_ids.includes(id)
        ? f.eligible_user_ids.filter((x) => x !== id)
        : [...f.eligible_user_ids, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    let weights = {}, matchFilter = {};
    try { weights = form.weights.trim() ? JSON.parse(form.weights) : {}; }
    catch { setErr("Weights must be valid JSON."); return; }
    try { matchFilter = form.match_filter.trim() ? JSON.parse(form.match_filter) : {}; }
    catch { setErr("Match filter must be valid JSON."); return; }

    const body = {
      name: form.name,
      strategy: form.strategy,
      is_active: form.is_active,
      priority: Number(form.priority),
      eligible_user_ids: form.eligible_user_ids,
      weights,
      match_filter: matchFilter,
      skills_required: form.skills_required.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isEdit) await api.updateDistributionRule(rule.id, body);
      else await api.createDistributionRule(body);
      onSaved();
    } catch (ex) {
      setErr(ex.message || "Save failed");
    }
  }

  return (
    <ModalShell title={isEdit ? "Edit rule" : "New distribution rule"} onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} required />
        </Field>
        <Field label="Strategy">
          <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} className={modalInput}>
            {STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Priority (lower = first)">
          <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Active">
          <Toggle label="Run this rule" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
        </Field>
        <Field label="Eligible users" wide>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 p-2 grid grid-cols-2 gap-1 text-xs">
            {users.length === 0 && <div className="col-span-2 text-gray-500">No users found.</div>}
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.eligible_user_ids.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                />
                <span className="text-gray-200 truncate">{u.username}</span>
                <span className="text-gray-500 text-[10px] ml-auto">{u.role}</span>
              </label>
            ))}
          </div>
        </Field>
        {form.strategy === "WEIGHTED" && (
          <Field label="Weights (JSON: {user_id: integer})" wide>
            <textarea
              value={form.weights}
              onChange={(e) => setForm({ ...form, weights: e.target.value })}
              rows={3}
              className={`${modalInput} font-mono text-xs`}
            />
          </Field>
        )}
        {form.strategy === "SKILL" && (
          <Field label="Skills required (comma-separated)" wide>
            <input value={form.skills_required} onChange={(e) => setForm({ ...form, skills_required: e.target.value })} className={modalInput} />
          </Field>
        )}
        <Field label="Match filter AST (JSON — empty = match all)" wide>
          <textarea
            value={form.match_filter}
            onChange={(e) => setForm({ ...form, match_filter: e.target.value })}
            rows={4}
            className={`${modalInput} font-mono text-xs`}
            placeholder='{"op":"AND","children":[{"field":"city","op":"equals","value":"Pune"}]}'
          />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">
            {isEdit ? "Save" : "Create rule"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
