import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, ArrowRight, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api.js";
import { portalAuth } from "./PortalLayout.jsx";

export default function PortalLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("t") || "");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  // Auto-login if token came via magic link.
  useEffect(() => {
    if (token && params.get("t")) submit(null, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e, override) {
    e?.preventDefault();
    setErr(null);
    setBusy(true);
    const t = (override || token).trim();
    if (!t) { setErr("Paste the portal token from your email."); setBusy(false); return; }
    try {
      await api.portal.me(t);  // verify
      portalAuth.set(t);
      navigate("/portal", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Invalid or expired token");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-[0_20px_80px_rgba(250,204,21,0.1)]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-5 shadow-lg">
          <Building2 size={20} className="text-black" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Customer portal</h1>
        <p className="text-sm text-gray-400 mb-6">
          Sign in with the secure link / token your account manager sent you.
        </p>

        {err && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2 mb-4">
            <AlertTriangle size={14} /> {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Portal token</span>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="prt_…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm disabled:opacity-50"
          >
            {busy ? "Verifying…" : <>Continue <ArrowRight size={14} /></>}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 mt-6 text-center">
          Don't have a token? Contact your account manager — they can mint one from the admin panel.
        </p>
      </div>
    </div>
  );
}
