import { useEffect, useState } from "react";
import { Bell, Send, Trash2, Check, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty, SuccessNote, StatusBadge } from "./_shared.jsx";

const PLATFORM_PALETTE = {
  WEB: "bg-sky-400 text-black",
  EXPO: "bg-violet-400 text-white",
  FCM: "bg-amber-500 text-black",
};

export default function AdminPush() {
  const [subs, setSubs] = useState([]);
  const [vapid, setVapid] = useState("");
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);

  function load() {
    api.getPushSubscriptions().then(setSubs).catch((e) => setErr(e.message));
    api.getPushPublicKey().then((d) => setVapid(d.vapid_public_key || "")).catch(() => {});
  }
  useEffect(load, []);

  async function subscribe() {
    setErr(null);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setErr("Web Push not supported in this browser.");
      return;
    }
    if (!vapid) {
      setErr("Set VAPID_PUBLIC_KEY in your backend .env to enable Web Push.");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw.js").catch(() => null);
      if (!reg) { setErr("Could not register service worker (sw.js missing)."); return; }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const json = subscription.toJSON();
      await api.subscribePush({
        platform: "WEB",
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh || "",
        auth: json.keys?.auth || "",
        device_label: navigator.userAgent.slice(0, 100),
      });
      setNote("Subscribed to push notifications.");
      load();
    } catch (ex) { setErr(ex.message); }
  }

  async function test() {
    try {
      const r = await api.testPush({ title: "Test from CRM", body: "It works!" });
      setNote(`Sent ${r.sent} / failed ${r.failed}.`);
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Bell className="text-yellow-400" /> Push notifications
          </h1>
          <p className="text-sm text-gray-400 mt-1">Web Push (VAPID) + Expo / mobile push.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={subscribe} className="px-3 py-2 text-xs rounded bg-yellow-400 text-black font-bold">
            <Bell size={12} className="inline" /> Subscribe this device
          </button>
          <button onClick={test} className="px-3 py-2 text-xs rounded bg-white/5 text-gray-300">
            <Send size={12} className="inline" /> Send test
          </button>
        </div>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      {!vapid && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-xs text-yellow-200 flex items-center gap-2">
          <AlertTriangle size={13} /> VAPID keys not configured. Set <code>VAPID_PUBLIC_KEY</code> + <code>VAPID_PRIVATE_KEY</code> + <code>VAPID_CLAIMS_EMAIL</code> in your backend <code>.env</code>.
        </div>
      )}

      <Panel title="Your active subscriptions" accent="text-yellow-300">
        {subs.length === 0 ? <Empty msg="No push subscriptions on this account." /> : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-3 py-2">Platform</th>
                <th className="text-left px-3 py-2">Device</th>
                <th className="text-left px-3 py-2">Last used</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-3 py-2"><StatusBadge status={s.platform} palette={PLATFORM_PALETTE} /></td>
                  <td className="px-3 py-2 text-xs text-gray-300 truncate max-w-[300px]" title={s.device_label}>{s.device_label || "—"}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{s.last_used_at ? new Date(s.last_used_at).toLocaleString() : "never"}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => api.unsubscribePush(s.id).then(load)} className="text-red-300"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
