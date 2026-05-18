import { useEffect, useState } from "react";
import { Zap, Plus, RefreshCw, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminAutomation() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.getAutomationRules()
      .then(setRules)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Automation"
        subtitle={`${rules.length} rule(s) configured`}
        onRefresh={load}
        refreshing={loading}
        actionLabel="New rule"
        actionIcon={Plus}
        onAction={() => alert("Rule editor UI — not implemented in this scaffold pass.")}
        accent={Zap}
      />

      <StubNotice
        feature="Automation engine"
        detail="Rules can be created and stored. Actual trigger execution requires Celery + Redis infrastructure — not yet wired."
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      {rules.length === 0 ? (
        <Panel full>
          <div className="text-center py-12">
            <Zap size={36} className="mx-auto text-yellow-400/60 mb-3" />
            <p className="text-gray-300 font-semibold">No automation rules yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Triggers: lead_created · status_changed · deal_won · payment_received · task_overdue
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                r.is_active ? "bg-emerald-400/20 text-emerald-300" : "bg-gray-500/20 text-gray-400"
              }`}><Zap size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{r.name}</p>
                <p className="text-xs text-gray-500">trigger: <span className="text-gray-300">{r.trigger_event}</span> · runs: {r.run_count}</p>
                {r.description && <p className="text-sm text-gray-400 mt-2">{r.description}</p>}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-yellow-300"><Pencil size={14} /></button>
                <button className="p-2 rounded-lg bg-white/5 text-red-300"
                  onClick={async () => {
                    if (confirm(`Delete "${r.name}"?`)) {
                      await api.deleteAutomationRule(r.id);
                      load();
                    }
                  }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StubNotice({ feature, detail }) {
  return (
    <div className="rounded-2xl bg-yellow-400/10 border border-yellow-400/30 p-4 flex items-start gap-3">
      <AlertTriangle size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-yellow-200">{feature} — scaffold only</p>
        <p className="text-gray-300 mt-1">{detail}</p>
      </div>
    </div>
  );
}
