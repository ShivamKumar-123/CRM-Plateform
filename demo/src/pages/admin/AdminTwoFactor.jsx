import { useState } from "react";
import {
  ShieldCheck, QrCode, Smartphone, KeyRound, Check, Lock,
} from "lucide-react";
import { PageHeader, Panel, Badge } from "./_shared.jsx";

export default function AdminTwoFactor() {
  const [enabled, setEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const toggle = () => {
    if (enabled) {
      if (confirm("Disable 2FA? You'll only need your password to log in.")) {
        setEnabled(false);
      }
    } else {
      setShowSetup(true);
    }
  };

  const verify = (e) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setEnabled(true);
      setShowSetup(false);
      setVerifying(false);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title="Two-Factor Authentication"
        subtitle="Add a second layer of security. Once enabled, you'll need your password plus a 6-digit code from your authenticator app."
      />

      {/* Status card */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        enabled
          ? "bg-emerald-400/5 border-emerald-400/30"
          : "bg-amber-400/5 border-amber-400/30"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            enabled
              ? "bg-gradient-to-br from-emerald-400 to-green-500"
              : "bg-gradient-to-br from-amber-400 to-orange-500"
          }`}>
            {enabled ? <ShieldCheck size={20} className="text-black" /> : <Lock size={20} className="text-black" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-lg font-bold text-white">
                {enabled ? "2FA is enabled" : "2FA is disabled"}
              </p>
              <Badge color={enabled ? "emerald" : "amber"}>
                {enabled ? "PROTECTED" : "ACTION RECOMMENDED"}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">
              {enabled
                ? "Your account is protected with TOTP. Recovery codes available on request."
                : "Your account is only protected by your password. Enable 2FA in under a minute."}
            </p>
          </div>
          <button
            onClick={toggle}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0 ${
              enabled
                ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/10 hover:text-red-300"
                : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
            }`}
          >
            {enabled ? "Disable" : "Enable 2FA"}
          </button>
        </div>
      </div>

      {/* How it works */}
      <Panel title="How it works">
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard
            num={1}
            icon={QrCode}
            title="Scan QR code"
            desc="Open Google Authenticator, Microsoft Authenticator, or Authy and scan the QR code."
          />
          <StepCard
            num={2}
            icon={Smartphone}
            title="Get a code"
            desc="Your app will show a fresh 6-digit code that changes every 30 seconds."
          />
          <StepCard
            num={3}
            icon={KeyRound}
            title="Use it to log in"
            desc="Enter the code along with your password every time you sign in from a new device."
          />
        </div>
      </Panel>

      {/* Enforcement (admin-only) */}
      <Panel title="Organization policy" accent="text-sky-300">
        <div className="space-y-3">
          <PolicyRow
            label="Require 2FA for all OWNER + ADMIN users"
            recommended
            defaultOn
          />
          <PolicyRow
            label="Require 2FA for all SALES users"
            recommended={false}
            defaultOn={false}
          />
          <PolicyRow
            label="Block login from new devices for 24 hours"
            recommended={false}
            defaultOn={false}
          />
        </div>
      </Panel>

      {/* Setup modal */}
      {showSetup && (
        <SetupModal
          verifying={verifying}
          onSubmit={verify}
          onClose={() => setShowSetup(false)}
        />
      )}
    </div>
  );
}

function StepCard({ num, icon: Icon, title, desc }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xs font-bold text-black">
          {num}
        </span>
        <Icon size={16} className="text-yellow-300" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function PolicyRow({ label, recommended, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 cursor-pointer">
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative w-10 rounded-full transition-colors flex-shrink-0 ${
          on ? "bg-emerald-500" : "bg-white/10"
        }`}
        style={{ height: 22 }}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-gray-200 flex-1">{label}</span>
      {recommended && <Badge color="yellow">Recommended</Badge>}
    </label>
  );
}

function SetupModal({ verifying, onSubmit, onClose }) {
  const [code, setCode] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-yellow-400/20 p-6"
      >
        <h3 className="text-lg font-bold text-white mb-1">Set up 2FA</h3>
        <p className="text-xs text-gray-400 mb-5">Scan the QR with your authenticator app, then enter the 6-digit code below.</p>

        {/* Fake QR placeholder */}
        <div className="w-40 h-40 mx-auto rounded-xl bg-white p-3 flex items-center justify-center mb-4">
          <QrCode size={120} className="text-black" />
        </div>
        <p className="text-center text-[10px] text-gray-500 font-mono mb-5">
          OR enter key: <span className="text-yellow-300">JBSWY3DPEHPK3PXP</span>
        </p>

        <input
          autoFocus
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="123456"
          className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-center text-2xl font-mono tracking-widest text-white"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm">Cancel</button>
          <button
            type="submit"
            disabled={code.length < 6 || verifying}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Check size={14} /> {verifying ? "Verifying…" : "Verify & enable"}
          </button>
        </div>
      </form>
    </div>
  );
}
