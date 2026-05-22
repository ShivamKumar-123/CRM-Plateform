import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Plus, Trash2, Pause, Play, Check, X, Activity, AlertCircle,
} from "lucide-react";
import { db, uid } from "../../lib/db.js";
import { PageHeader, Panel, Badge, timeAgo } from "./_shared.jsx";

const TRIGGER_TEMPLATES = [
  "Lead created",
  "Lead score ≥ 70",
  "Lead idle for 7 days",
  "Deal created",
  "Deal moved to Lost",
  "Deal idle for 7 days",
  "Deal value ≥ ₹10,00,000",
  "Invoice unpaid 7 days past",
  "Customer churned",
];

const ACTION_TEMPLATES = [
  "Send WhatsApp template",
  "Send email template",
  "Assign to senior sales rep",
  "Notify all managers",
  "Create follow-up task",
  "Add to executive review",
  "Send feedback form",
  "Tag as high-priority",
];

export default function AdminAutomation() {
  const [rules, setRules] = useState(() => db.get("automationRules") || []);
  const [adding, setAdding] = useState(false);

  const persist = (next) => {
    setRules(next);
    db.set("automationRules", next);
  };

  const toggle = (id) => {
    persist(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const remove = (id) => {
    if (!confirm("Delete this automation rule?")) return;
    persist(rules.filter((r) => r.id !== id));
  };

  const addRule = (data) => {
    const newRule = {
      id: uid("ar"),
      name: data.name,
      trigger: data.trigger,
      action: data.action,
      enabled: true,
      runs: 0,
      lastRun: null,
    };
    persist([newRule, ...rules]);
    setAdding(false);
  };

  const totalRuns = rules.reduce((s, r) => s + (r.runs || 0), 0);
  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={Zap}
        title="Automation"
        subtitle="Trigger workflows when leads change, deals move, or time passes. No-code rule builder."
        action={
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-2"
          >
            <Plus size={14} /> New rule
          </button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-400/5 border border-emerald-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Play size={14} className="text-emerald-400" />
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/80">Active</p>
          </div>
          <p className="text-2xl font-black text-emerald-300">{activeCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-500/5 border border-gray-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Pause size={14} className="text-gray-400" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Paused</p>
          </div>
          <p className="text-2xl font-black text-gray-300">{rules.length - activeCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-yellow-400/5 border border-yellow-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-yellow-400" />
            <p className="text-[10px] uppercase tracking-widest text-yellow-300/80">Total runs</p>
          </div>
          <p className="text-2xl font-black text-yellow-300">{totalRuns}</p>
        </div>
      </div>

      <Panel title={`Rules (${rules.length})`}>
        {rules.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No automation rules yet. Click "New rule" to create your first.</p>
        ) : (
          <ul className="space-y-2.5">
            {rules.map((r) => (
              <motion.li
                key={r.id}
                layout
                className={`p-4 rounded-xl border transition ${
                  r.enabled
                    ? "bg-white/[0.04] border-emerald-500/15 hover:border-emerald-400/30"
                    : "bg-white/[0.02] border-white/10 opacity-70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(r.id)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 mt-1 ${
                      r.enabled ? "bg-emerald-500" : "bg-white/10"
                    }`}
                    style={{ height: 22 }}
                    title={r.enabled ? "Pause rule" : "Enable rule"}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        r.enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold mb-2">{r.name}</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="p-2.5 rounded-lg bg-sky-500/5 border border-sky-500/20">
                        <p className="text-[9px] uppercase tracking-widest text-sky-300 font-bold mb-1">When</p>
                        <p className="text-sky-200 text-xs">{r.trigger}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <p className="text-[9px] uppercase tracking-widest text-yellow-300 font-bold mb-1">Then</p>
                        <p className="text-yellow-200 text-xs">{r.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
                      <span><strong className="text-gray-300">{r.runs || 0}</strong> runs</span>
                      <span>·</span>
                      <span>Last run: {r.lastRun ? timeAgo(r.lastRun) : "never"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(r.id)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Tip card */}
      <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 flex items-start gap-3">
        <AlertCircle size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-200">Demo notice</p>
          <p className="text-xs text-violet-300/70 mt-0.5">
            Rules created here are stored in your browser only. On the real platform, rules run on the backend and trigger emails / WhatsApp / webhooks in real time.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {adding && <NewRuleModal onSave={addRule} onClose={() => setAdding(false)} />}
      </AnimatePresence>
    </div>
  );
}

function NewRuleModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    trigger: TRIGGER_TEMPLATES[0],
    action: ACTION_TEMPLATES[0],
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-yellow-400/20 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white inline-flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> New automation rule
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Rule name</label>
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Auto-assign hot leads"
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-sky-300 block mb-1">When (trigger)</label>
            <select
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-sky-500/5 border border-sky-500/20 text-sm text-white"
            >
              {TRIGGER_TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-yellow-300 block mb-1">Then (action)</label>
            <select
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-sm text-white"
            >
              {ACTION_TEMPLATES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Cancel</button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-1.5">
            <Check size={14} /> Create rule
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
