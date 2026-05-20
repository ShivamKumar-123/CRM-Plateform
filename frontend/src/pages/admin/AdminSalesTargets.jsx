import { useEffect, useState } from "react";
import { Trophy, Plus, Pencil, Trash2, Check, Crown, IndianRupee, TrendingUp } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Panel, KpiCard, formatINR } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminSalesTargets() {
  const [targets, setTargets] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ period_start: "", leaderboard: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getSalesTargets(),
      api.getSalesLeaderboard(),
      api.getAdminUsers().catch(() => []),
    ])
      .then(([t, lb, u]) => { setTargets(t); setLeaderboard(lb); setUsers(u || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (t) => {
    if (!confirm("Delete this target?")) return;
    await api.deleteSalesTarget(t.id);
    load();
  };

  const totalTarget = targets.reduce((s, t) => s + Number(t.target_amount || 0), 0);
  const totalAchieved = targets.reduce((s, t) => s + Number(t.achieved_amount || 0), 0);
  const totalCommission = targets.reduce((s, t) => s + Number(t.commission_earned || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Sales Targets"
        subtitle={`${targets.length} target(s) · ${leaderboard.leaderboard.length} active sellers this month`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New target"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Trophy}
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Trophy} label="Total target" value={formatINR(totalTarget)} tint="from-yellow-400 to-amber-500" />
        <KpiCard icon={IndianRupee} label="Total achieved" value={formatINR(totalAchieved)} tint="from-emerald-400 to-green-500" />
        <KpiCard icon={TrendingUp} label="Achievement %" value={totalTarget ? `${((totalAchieved / totalTarget) * 100).toFixed(0)}%` : "0%"} tint="from-sky-400 to-blue-500" />
        <KpiCard icon={Crown} label="Commission earned" value={formatINR(totalCommission)} tint="from-pink-400 to-rose-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Panel title="Leaderboard — this month" accent="text-yellow-300" full>
          {leaderboard.leaderboard.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No won deals this month yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.leaderboard.map((r, i) => (
                <div key={r.assigned_to__id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                    i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black" :
                    i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black" :
                    i === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black" :
                    "bg-white/10 text-gray-300"
                  }`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{r.assigned_to__username}</p>
                    <p className="text-xs text-gray-500">{r.won_count} won deal{r.won_count !== 1 ? "s" : ""}</p>
                  </div>
                  <p className="font-bold text-emerald-400">{formatINR(r.won_value)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Targets table */}
        <Panel title="Configured targets" accent="text-sky-300" full>
          {targets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No targets set. Click "New target" above.</p>
          ) : (
            <div className="space-y-3">
              {targets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-white">{t.user_username}</p>
                      <p className="text-xs text-gray-500">{t.period} · starting {t.period_start}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(t)} className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300"><Pencil size={12} /></button>
                      <button onClick={() => remove(t)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Target</p>
                      <p className="text-sm font-bold text-yellow-300">{formatINR(t.target_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Achieved</p>
                      <p className="text-sm font-bold text-emerald-400">{formatINR(t.achieved_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase">Commission</p>
                      <p className="text-sm font-bold text-pink-400">{formatINR(t.commission_earned)}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                      style={{ width: `${Math.min(100, t.achievement_pct || 0)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-right">{t.achievement_pct}% achieved</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <TargetModal
            target={editing}
            users={users}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TargetModal({ target, users, onClose, onSaved }) {
  const isEdit = !!target;
  const today = new Date();
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const [form, setForm] = useState({
    user: target?.user || (users[0]?.id ?? ""),
    period: target?.period || "MONTH",
    period_start: target?.period_start || firstOfMonth,
    target_amount: target?.target_amount ?? "",
    commission_pct: target?.commission_pct ?? "5",
    notes: target?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.user || !form.target_amount) { setError("User and target amount required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        target_amount: Number(form.target_amount),
        commission_pct: Number(form.commission_pct),
      };
      if (isEdit) await api.updateSalesTarget(target.id, payload);
      else await api.createSalesTarget(payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={isEdit ? "Edit target" : "New sales target"} onClose={onClose}>
      {error && <ErrorBanner msg={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Salesperson" wide>
          <select value={form.user} onChange={(e) => setForm({ ...form, user: Number(e.target.value) })}
            className={modalInput}>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
          </select>
        </Field>
        <Field label="Period">
          <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={modalInput}>
            <option value="MONTH">Monthly</option>
            <option value="QUARTER">Quarterly</option>
            <option value="YEAR">Yearly</option>
          </select>
        </Field>
        <Field label="Period start">
          <input type="date" value={form.period_start}
            onChange={(e) => setForm({ ...form, period_start: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Target amount (₹)">
          <input type="number" value={form.target_amount}
            onChange={(e) => setForm({ ...form, target_amount: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Commission %">
          <input type="number" step="0.1" value={form.commission_pct}
            onChange={(e) => setForm({ ...form, commission_pct: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Notes" wide>
          <textarea rows={2} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} className={modalInput} />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving…" : isEdit ? "Save" : "Create"}
        </button>
      </div>
    </ModalShell>
  );
}
