import { useEffect, useState } from "react";
import { Target, Plus, Pencil, Trash2, Check, Flame } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Panel, Toggle } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

const EVENT_CHOICES = [
  "lead_created", "status_changed", "deal_created", "deal_won",
  "payment_received", "document_uploaded", "task_completed",
  "email_opened", "email_replied", "meeting_booked",
  "quotation_viewed", "payment_initiated", "inactivity_penalty",
];

export default function AdminLeadScoring() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    api.getScoreRules()
      .then(setRules)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (r) => {
    if (!confirm(`Delete rule "${r.event}"?`)) return;
    await api.deleteScoreRule(r.id);
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Lead Scoring Rules"
        subtitle={`${rules.length} rule(s) · scores cap at 100 · HOT ≥70 · WARM ≥40 · COLD <40`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New rule"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Target}
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <Panel title="Priority thresholds" accent="text-yellow-300" full>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-300 uppercase tracking-wider">HOT</p>
            <p className="text-2xl font-black text-red-300 mt-1">≥ 70</p>
            <p className="text-xs text-gray-500 mt-1">High-priority, contact within 24h</p>
          </div>
          <div className="rounded-xl p-4 bg-yellow-400/10 border border-yellow-400/30">
            <p className="text-xs text-yellow-300 uppercase tracking-wider">WARM</p>
            <p className="text-2xl font-black text-yellow-300 mt-1">40 – 69</p>
            <p className="text-xs text-gray-500 mt-1">Active interest, schedule follow-up</p>
          </div>
          <div className="rounded-xl p-4 bg-sky-500/10 border border-sky-500/30">
            <p className="text-xs text-sky-300 uppercase tracking-wider">COLD</p>
            <p className="text-2xl font-black text-sky-300 mt-1">&lt; 40</p>
            <p className="text-xs text-gray-500 mt-1">Early stage, nurture campaign</p>
          </div>
        </div>
      </Panel>

      {rules.length === 0 ? (
        <Panel full>
          <div className="text-center py-12">
            <Target size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300">No scoring rules defined.</p>
            <p className="text-xs text-gray-500 mt-1">Apply an industry template to auto-seed default rules.</p>
          </div>
        </Panel>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-yellow-300">
              <tr>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4 text-right">Points</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Active</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-mono text-xs text-gray-300">{r.event}</td>
                  <td className="px-5 py-3 text-right font-bold">
                    <span className={r.points > 0 ? "text-emerald-400" : r.points < 0 ? "text-red-400" : "text-gray-500"}>
                      {r.points > 0 ? "+" : ""}{r.points}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-sm">{r.description || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      r.is_active ? "bg-emerald-400/20 text-emerald-300" : "bg-gray-500/20 text-gray-400"
                    }`}>{r.is_active ? "ON" : "OFF"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setEditing(r)} className="p-2 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-yellow-300"><Pencil size={14} /></button>
                      <button onClick={() => remove(r)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <RuleModal
            rule={editing}
            existingEvents={rules.map(r => r.event)}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleModal({ rule, existingEvents, onClose, onSaved }) {
  const isEdit = !!rule;
  const [form, setForm] = useState({
    event: rule?.event || EVENT_CHOICES[0],
    points: rule?.points ?? 5,
    description: rule?.description || "",
    is_active: rule?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableEvents = isEdit ? EVENT_CHOICES : EVENT_CHOICES.filter(e => !existingEvents.includes(e));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, points: Number(form.points) };
      if (isEdit) await api.updateScoreRule(rule.id, payload);
      else await api.createScoreRule(payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={isEdit ? `Edit rule — ${rule.event}` : "New scoring rule"} onClose={onClose}>
      {error && <ErrorBanner msg={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Event">
          <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })}
            disabled={isEdit} className={modalInput}>
            {availableEvents.map((e) => <option key={e}>{e}</option>)}
          </select>
        </Field>
        <Field label="Points (-100 to +100)">
          <input type="number" value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Description" wide>
          <input value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="When does this apply?" className={modalInput} />
        </Field>
      </div>
      <div className="mt-4">
        <Toggle label="Active" checked={form.is_active} onChange={(v) => setForm({ ...form, is_active: v })} />
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
