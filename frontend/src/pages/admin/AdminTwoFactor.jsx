import { useEffect, useState } from "react";
import { ShieldCheck, Check, X, AlertTriangle, Copy } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminTwoFactor() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Setup-flow state
  const [setupData, setSetupData] = useState(null);  // {secret, otpauth_uri, qr_png_base64}
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState(null);

  const load = () => {
    setLoading(true);
    api.get2FAStatus()
      .then(setStatus)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startSetup = async () => {
    try {
      const d = await api.setup2FA();
      setSetupData(d);
      setOtp("");
      setBackupCodes(null);
    } catch (e) { alert(e.message); }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      alert("Enter the 6-digit code shown in your authenticator app.");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.verify2FA(otp);
      setBackupCodes(res.backup_codes || []);
      setSetupData(null);
      load();
    } catch (e) { alert(e.message); }
    finally { setVerifying(false); }
  };

  const disable = async () => {
    if (!confirm("Disable 2FA? You'll only need your password to sign in again.")) return;
    await api.disable2FA();
    load();
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Two-Factor Authentication"
        subtitle={status?.is_enabled ? "Enabled — required on every login" : "Disabled"}
        onRefresh={load}
        refreshing={loading}
        accent={ShieldCheck}
      />

      {error && <ErrorBanner msg={error} />}

      {/* Setup flow — QR code shown */}
      {setupData && (
        <Panel title="Step 1 of 2 — Scan QR" accent="text-yellow-300" full>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-300 mb-4">
                Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>{" "}
                and scan this QR. Then enter the 6-digit code below.
              </p>
              <div className="bg-white p-4 rounded-2xl inline-block">
                <img
                  src={`data:image/png;base64,${setupData.qr_png_base64}`}
                  alt="2FA QR code"
                  className="w-48 h-48"
                />
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Or enter this secret manually:</p>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <code className="text-xs text-yellow-300 font-mono break-all flex-1">{setupData.secret}</code>
                  <button onClick={() => navigator.clipboard.writeText(setupData.secret)}
                    className="text-gray-400 hover:text-white" title="Copy">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Step 2 — Enter the 6-digit code</p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123 456"
                inputMode="numeric"
                maxLength={6}
                className="w-full text-center text-3xl tracking-widest font-mono px-4 py-4 rounded-xl bg-white/5 border border-yellow-400/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
              <button
                onClick={verify}
                disabled={verifying || otp.length !== 6}
                className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Check size={16} /> {verifying ? "Verifying…" : "Verify & enable 2FA"}
              </button>
              <button
                onClick={() => setSetupData(null)}
                className="mt-2 w-full px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm"
              >
                Cancel setup
              </button>
            </div>
          </div>
        </Panel>
      )}

      {/* Backup codes shown after successful enable */}
      {backupCodes && (
        <Panel title="Backup codes — save these now!" accent="text-pink-300" full>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-sm text-red-200 flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>These backup codes will not be shown again. Save them somewhere safe — each one can be used once to sign in if you lose your authenticator app.</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-sm">
            {backupCodes.map((c) => (
              <code key={c} className="px-3 py-2 rounded-lg bg-white/5 border border-yellow-400/20 text-yellow-300 text-center">{c}</code>
            ))}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
            className="mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm inline-flex items-center gap-2"
          >
            <Copy size={14} /> Copy all
          </button>
        </Panel>
      )}

      {/* Status panel — only when not actively setting up */}
      {!setupData && !backupCodes && (
        <Panel title="Status" accent="text-yellow-300" full>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                status?.is_enabled ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"
              }`}>
                {status?.is_enabled ? <Check size={24} /> : <X size={24} />}
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {status?.is_enabled ? "Two-factor authentication is active" : "Two-factor authentication is off"}
                </p>
                <p className="text-sm text-gray-400">
                  {status?.is_enabled
                    ? `Enabled on ${status.enabled_at ? new Date(status.enabled_at).toLocaleDateString() : "—"}`
                    : "Add a second layer of security to your account."}
                </p>
              </div>
            </div>
            {status?.is_enabled ? (
              <button onClick={disable}
                className="px-5 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 font-semibold">
                Disable 2FA
              </button>
            ) : (
              <button onClick={startSetup}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold">
                Enable 2FA
              </button>
            )}
          </div>
        </Panel>
      )}

      <Panel title="How it works" accent="text-sky-300" full>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
            <span>Click <strong>Enable 2FA</strong>. A QR code appears.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
            <span>Scan it with Google Authenticator / Authy / 1Password.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
            <span>Enter the 6-digit code to confirm. You'll get backup codes — save them.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-yellow-400 text-black font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
            <span>From now on, every login asks for the 6-digit code after your password.</span>
          </li>
        </ol>
      </Panel>
    </div>
  );
}
