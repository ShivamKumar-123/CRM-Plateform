import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Cloud, Trash2, Check } from "lucide-react";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty, SuccessNote } from "./_shared.jsx";

const PROVIDERS = [
  { id: "GOOGLE_DRIVE", label: "Google Drive", color: "from-blue-400 to-blue-600", logo: "G" },
  { id: "DROPBOX", label: "Dropbox", color: "from-sky-400 to-blue-500", logo: "D" },
  { id: "ONEDRIVE", label: "OneDrive", color: "from-violet-400 to-purple-500", logo: "O" },
];

export default function AdminCloudStorage() {
  const [conns, setConns] = useState([]);
  const [params, setParams] = useSearchParams();
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);

  function load() { api.getCloudConnections().then(setConns).catch((e) => setErr(e.message)); }
  useEffect(load, []);

  // Handle OAuth return.
  useEffect(() => {
    const code = params.get("code");
    const provider = params.get("provider");
    if (!code || !provider) return;
    api.cloudOAuthCallback(provider, code)
      .then(() => { setNote(`Connected ${provider}.`); params.delete("code"); setParams(params, { replace: true }); load(); })
      .catch((e) => setErr(e.message));
  }, [params, setParams]);

  async function connect(provider) {
    setErr(null);
    try {
      const res = await api.startCloudOAuth(provider);
      window.location.href = res.authorize_url;
    } catch (ex) { setErr(ex.message || `${provider} OAuth not configured`); }
  }

  async function disconnect(provider) {
    if (!confirm(`Disconnect ${provider}?`)) return;
    await api.disconnectCloud(provider);
    setNote(`Disconnected ${provider}.`);
    load();
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Cloud className="text-yellow-400" /> Cloud storage
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Connect Google Drive, Dropbox, or OneDrive to sync documents.
        </p>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <div className="grid sm:grid-cols-3 gap-4">
        {PROVIDERS.map((p) => {
          const connected = conns.find((c) => c.provider === p.id && c.is_active);
          return (
            <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-black text-xl mb-3`}>
                {p.logo}
              </div>
              <div className="text-sm font-semibold mb-1">{p.label}</div>
              {connected ? (
                <>
                  <div className="text-xs text-emerald-300 flex items-center gap-1 mb-3"><Check size={12} /> Connected</div>
                  <div className="text-[11px] text-gray-500 mb-3">{connected.account_email || connected.account_name || "Active"}</div>
                  <button onClick={() => disconnect(p.id)} className="w-full px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-300">
                    <Trash2 size={11} className="inline mr-1" /> Disconnect
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-gray-500 mb-3">Not connected</div>
                  <button onClick={() => connect(p.id)} className="w-full px-3 py-1.5 text-xs rounded bg-yellow-400 text-black font-bold">
                    Connect
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-500 mt-6">
        Configure each provider's <code>CLIENT_ID</code> / <code>CLIENT_SECRET</code> / <code>REDIRECT_URI</code> in your backend <code>.env</code> before connecting.
      </p>
    </div>
  );
}
