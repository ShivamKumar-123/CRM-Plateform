import { useEffect, useState } from "react";
import { MessageSquare, Send, RefreshCw, Settings } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, ErrorBanner, Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";
import { StubNotice } from "./AdminAutomation.jsx";

export default function AdminWhatsApp() {
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.getWhatsAppConfig(), api.getWhatsAppMessages()])
      .then(([cfg, msgs]) => { setConfig(cfg); setMessages(msgs); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveConfig = async (patch) => {
    setSaving(true);
    try {
      const updated = await api.updateWhatsAppConfig({ ...config, ...patch });
      setConfig(updated);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="WhatsApp"
        subtitle={config?.is_enabled ? "Configured" : "Not configured"}
        onRefresh={load}
        refreshing={loading}
        accent={MessageSquare}
      />

      <StubNotice
        feature="WhatsApp Business API"
        detail="Config & message log persist. Actual send requires Meta WhatsApp Business Cloud API account, phone number verification, and template approval."
      />

      {error && <ErrorBanner msg={error} />}

      <Panel title="Configuration" accent="text-emerald-300" full>
        {config && (
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Phone number ID">
              <input className={modalInput} value={config.phone_number_id || ""}
                onChange={(e) => setConfig({ ...config, phone_number_id: e.target.value })} />
            </Field>
            <Field label="Business account ID">
              <input className={modalInput} value={config.business_account_id || ""}
                onChange={(e) => setConfig({ ...config, business_account_id: e.target.value })} />
            </Field>
            <Field label="Access token (saved, not displayed)" wide>
              <input type="password" className={modalInput}
                placeholder={config.access_token ? "••••••••••••" : "Paste token"}
                onChange={(e) => setConfig({ ...config, access_token: e.target.value })} />
            </Field>
            <div className="col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-200">
                <input type="checkbox" checked={!!config.is_enabled}
                  onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })} />
                Enable WhatsApp integration
              </label>
              <button
                onClick={() => saveConfig({})}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Settings size={14} /> {saving ? "Saving…" : "Save config"}
              </button>
            </div>
          </div>
        )}
      </Panel>

      <Panel title={`Message log (${messages.length})`} accent="text-yellow-300" full>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No messages logged yet.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className={`w-2 h-2 rounded-full mt-2 ${
                  m.status === "SENT" || m.status === "DELIVERED" || m.status === "READ" ? "bg-emerald-400" :
                  m.status === "FAILED" ? "bg-red-400" : "bg-yellow-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.to_number} <span className="text-gray-500 text-xs">· {m.direction}</span></p>
                  <p className="text-xs text-gray-400 truncate">{m.body}</p>
                </div>
                <span className="text-[10px] text-gray-500">{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
