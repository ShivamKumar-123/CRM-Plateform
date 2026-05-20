import { useEffect, useState } from "react";
import { Phone, Plus, Clock, PhoneIncoming, PhoneOutgoing, Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Panel, KpiCard } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

const OUTCOMES = [
  "CONNECTED", "NO_ANSWER", "BUSY", "VOICEMAIL", "WRONG_NUMBER",
  "CALLBACK", "INTERESTED", "NOT_INTERESTED", "CONVERTED",
];

const OUTCOME_COLOR = {
  CONNECTED:      "bg-emerald-400 text-black",
  CONVERTED:      "bg-yellow-400 text-black",
  INTERESTED:     "bg-sky-400 text-black",
  CALLBACK:       "bg-violet-400 text-black",
  NO_ANSWER:      "bg-gray-500/40 text-gray-300",
  BUSY:           "bg-orange-400 text-black",
  VOICEMAIL:      "bg-blue-400 text-black",
  WRONG_NUMBER:   "bg-red-500 text-white",
  NOT_INTERESTED: "bg-red-500 text-white",
};

const formatDur = (sec) => {
  if (!sec) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
};

export default function AdminCallLogs() {
  const [data, setData] = useState({ stats: {}, call_logs: [] });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getCallLogs(),
      api.getLeads().catch(() => ({ leads: [] })),
    ])
      .then(([calls, leadData]) => { setData(calls); setLeads(leadData?.leads || []); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Call Logs"
        subtitle={`${data.stats?.total_calls || 0} total · ${formatDur(data.stats?.total_duration || 0)} talk time`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="Log call"
        actionIcon={Plus}
        onAction={() => setCreating(true)}
        accent={Phone}
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Phone} label="Total calls" value={data.stats?.total_calls || 0} tint="from-yellow-400 to-amber-500" />
        <KpiCard icon={Check} label="Connected" value={data.stats?.connected || 0} tint="from-emerald-400 to-green-500" />
        <KpiCard icon={PhoneIncoming} label="Converted" value={data.stats?.converted || 0} tint="from-pink-400 to-rose-500" />
        <KpiCard icon={Clock} label="Talk time" value={formatDur(data.stats?.total_duration || 0)} tint="from-sky-400 to-blue-500" />
      </div>

      <Panel title="Recent calls" accent="text-yellow-300" full>
        {data.call_logs.length === 0 ? (
          <div className="text-center py-10">
            <Phone size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300">No calls logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.call_logs.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  c.direction === "INBOUND" ? "bg-sky-400/20 text-sky-300" : "bg-yellow-400/20 text-yellow-300"
                }`}>
                  {c.direction === "INBOUND" ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{c.lead_name || c.phone_number}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${OUTCOME_COLOR[c.outcome] || "bg-gray-500/20"}`}>
                      {c.outcome}
                    </span>
                    <span className="text-xs text-gray-500">· {formatDur(c.duration_seconds)}</span>
                    <span className="text-xs text-gray-500">· {c.user_username}</span>
                  </div>
                  {c.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.notes}</p>}
                  {c.next_action && (
                    <p className="text-xs text-yellow-300 mt-1">Next: {c.next_action}{c.next_action_at ? ` · ${new Date(c.next_action_at).toLocaleString()}` : ""}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">{new Date(c.called_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {creating && (
          <CallLogModal
            leads={leads}
            onClose={() => setCreating(false)}
            onSaved={() => { setCreating(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CallLogModal({ leads, onClose, onSaved }) {
  const [form, setForm] = useState({
    lead: "",
    direction: "OUTBOUND",
    outcome: "CONNECTED",
    duration_seconds: 0,
    phone_number: "",
    notes: "",
    next_action: "",
    next_action_at: "",
    called_at: new Date().toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        duration_seconds: Number(form.duration_seconds) || 0,
        called_at: form.called_at ? new Date(form.called_at).toISOString() : new Date().toISOString(),
        next_action_at: form.next_action_at ? new Date(form.next_action_at).toISOString() : null,
        lead: form.lead ? Number(form.lead) : null,
      };
      await api.createCallLog(payload);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Log a call" onClose={onClose} size="lg">
      {error && <ErrorBanner msg={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lead">
          <select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className={modalInput}>
            <option value="">— No lead —</option>
            {leads.map((l) => <option key={l.id} value={l.id}>#{l.id} · {l.name}</option>)}
          </select>
        </Field>
        <Field label="Phone (if no lead)">
          <input value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Direction">
          <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} className={modalInput}>
            <option value="OUTBOUND">Outbound</option>
            <option value="INBOUND">Inbound</option>
          </select>
        </Field>
        <Field label="Outcome">
          <select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} className={modalInput}>
            {OUTCOMES.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Duration (sec)">
          <input type="number" value={form.duration_seconds}
            onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })} className={modalInput} />
        </Field>
        <Field label="When">
          <input type="datetime-local" value={form.called_at}
            onChange={(e) => setForm({ ...form, called_at: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Notes / Voice transcription" wide>
          <textarea rows={3} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="What was discussed? Customer pain points, objections, next steps…"
            className={modalInput} />
        </Field>
        <Field label="Next action">
          <input value={form.next_action}
            onChange={(e) => setForm({ ...form, next_action: e.target.value })}
            placeholder="e.g. Send quotation" className={modalInput} />
        </Field>
        <Field label="Next action by">
          <input type="datetime-local" value={form.next_action_at}
            onChange={(e) => setForm({ ...form, next_action_at: e.target.value })} className={modalInput} />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300">Cancel</button>
        <button onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2">
          <Check size={14} /> {saving ? "Saving…" : "Log call"}
        </button>
      </div>
    </ModalShell>
  );
}
