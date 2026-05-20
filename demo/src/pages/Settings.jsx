import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, LogOut, Database, ShieldCheck, Info } from "lucide-react";
import PageHeader, { Field, inputClass } from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { db } from "../lib/db.js";
import { api } from "../lib/api.js";

export default function Settings() {
  const { user, logout, resetDemo } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
  });
  const [saved, setSaved] = useState(false);

  const counts = {
    leads: db.get("leads").length,
    customers: db.get("customers").length,
    deals: db.get("deals").length,
    users: db.get("users").length,
  };

  function saveProfile() {
    if (!user) return;
    const updated = db.update("users", user.id, profile);
    if (updated) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // refresh in-memory user
      api.me();
    }
  }

  function handleReset() {
    if (confirm("Reset ALL demo data and log out? This cannot be undone.")) {
      resetDemo();
      navigate("/");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Manage your demo profile and data." />

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-1">Profile</h2>
        <p className="text-xs text-gray-500 mb-5">Changes are saved to localStorage instantly.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} /></Field>
          <Field label="Email"><input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} /></Field>
          <Field label="Company"><input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className={inputClass} /></Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={saveProfile} className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-yellow-400 to-amber-500">
            Save profile
          </button>
          {saved && <span className="text-xs text-emerald-400">✓ Saved</span>}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-yellow-400" />
          <h2 className="font-semibold">Data overview</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">Stored in your browser's localStorage under <code className="text-yellow-300">crm_demo_v1</code>.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
              <div className="text-2xl font-bold">{v}</div>
              <div className="text-xs text-gray-400 capitalize">{k}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h2 className="font-semibold">Privacy</h2>
        </div>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          This is a 100% client-side demo. No data is sent to a server. Clearing your browser's site data
          (or hitting "Reset demo" below) will wipe everything.
        </p>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border-red-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Info size={16} className="text-red-400" />
          <h2 className="font-semibold text-red-300">Danger zone</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">These actions cannot be undone.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/15"
          >
            <RotateCcw size={14} /> Reset all demo data
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </motion.section>
    </div>
  );
}
