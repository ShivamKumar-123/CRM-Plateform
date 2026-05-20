import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw, Wand2, Plus, MonitorPlay, Presentation, Activity,
  Sun, Building2, HeartPulse, Truck, ShieldCheck, Sparkles, Bell, VolumeX, Volume2,
} from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useIndustry } from "../context/IndustryContext.jsx";
import { useDemoMode } from "../context/DemoModeContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { generateLeads } from "../lib/fakeData.js";

const ICONS = { Sun, Building2, HeartPulse, Truck, ShieldCheck };

export default function CommandCenter() {
  const navigate = useNavigate();
  const { industry, industries, switchTo, regenerate, bumpVersion } = useIndustry();
  const { presentation, salesDemo, togglePresentation, toggleSalesDemo } = useDemoMode();
  const { soundEnabled, toggleSound, generate: pushNotification } = useNotifications();
  const { resetDemo } = useAuth();

  function generateMoreLeads() {
    const fresh = generateLeads(industry, 5);
    const existing = api.listLeads();
    const merged = [...fresh, ...existing];
    // direct write through db.set via api.* not exposed — use createLead loop instead
    fresh.forEach((l) => api.createLead(l));
    bumpVersion();
    pushNotification();
    void merged;
  }

  function simulateBurst() {
    for (let i = 0; i < 5; i++) setTimeout(() => pushNotification(), i * 600);
  }

  function fullReset() {
    if (!confirm("Wipe everything and re-seed? This signs you out.")) return;
    resetDemo();
    navigate("/");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="Command center"
        subtitle="One-click controls to drive your demo — switch industries, generate data, toggle modes."
      />

      {/* Mode toggles */}
      <div className="grid md:grid-cols-2 gap-4">
        <ModeCard
          active={presentation}
          onToggle={togglePresentation}
          icon={MonitorPlay}
          title="Presentation mode"
          subtitle="Auto-rotating walkthrough · keyboard nav · spotlight overlay"
          accent="from-yellow-400 to-amber-500"
        />
        <ModeCard
          active={salesDemo}
          onToggle={toggleSalesDemo}
          icon={Presentation}
          title="Sales demo mode"
          subtitle="Boost data velocity · rapid notifications · curated narrative"
          accent="from-fuchsia-400 to-pink-500"
        />
      </div>

      {/* Industry presets */}
      <section className="glass rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            Industry presets
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Repopulate every module instantly with realistic, industry-specific data.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {industries.map((ind) => {
            const I = ICONS[ind.iconName] || Sun;
            const active = ind.id === industry.id;
            return (
              <motion.button
                key={ind.id}
                onClick={() => switchTo(ind.id)}
                whileHover={{ y: -3 }}
                className={`p-4 rounded-2xl border text-left transition ${
                  active
                    ? "border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 to-amber-500/5"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ind.accent} flex items-center justify-center mb-3`}>
                  <I size={16} className="text-black" />
                </div>
                <div className="text-sm font-semibold">{ind.label}</div>
                <div className="text-[11px] text-gray-500 mt-1 leading-snug">{ind.tagline}</div>
                {active && (
                  <div className="text-[10px] text-yellow-300 font-bold tracking-wider mt-2">● ACTIVE</div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Data actions */}
      <section className="glass rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Data actions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Manipulate the in-browser dataset live.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionButton onClick={regenerate} icon={Wand2} title="Regenerate dataset" subtitle={`Fresh ${industry.label.replace(" CRM", "")} data`} accent="from-yellow-400 to-amber-500" />
          <ActionButton onClick={generateMoreLeads} icon={Plus} title="Generate 5 leads" subtitle="Random + scored" accent="from-sky-400 to-blue-500" />
          <ActionButton onClick={simulateBurst} icon={Activity} title="Simulate activity" subtitle="5 notifications fast" accent="from-fuchsia-400 to-pink-500" />
          <ActionButton onClick={fullReset} icon={RotateCcw} title="Full reset" subtitle="Wipe everything" accent="from-red-400 to-rose-500" danger />
        </div>
      </section>

      {/* Notifications */}
      <section className="glass rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-xs text-gray-500 mt-0.5">Quick toggles for sound + manual push.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Sound: {soundEnabled ? "On" : "Off"}
          </button>
          <button
            onClick={pushNotification}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm"
          >
            <Bell size={14} /> Push test notification
          </button>
        </div>
      </section>
    </div>
  );
}

function ModeCard({ active, onToggle, icon: Icon, title, subtitle, accent }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ y: -2 }}
      className={`text-left p-5 rounded-3xl border transition relative overflow-hidden ${
        active
          ? "border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 to-amber-500/5 shadow-lg shadow-yellow-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      {active && (
        <motion.div
          className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      )}
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon size={18} className="text-black" />
      </div>
      <div className="text-base font-semibold">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      <div className={`mt-3 text-[10px] font-bold tracking-wider ${active ? "text-emerald-300" : "text-gray-500"}`}>
        {active ? "● ACTIVE — click to disable" : "○ Inactive — click to enable"}
      </div>
    </motion.button>
  );
}

function ActionButton({ onClick, icon: Icon, title, subtitle, accent, danger }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`text-left p-4 rounded-2xl border ${
        danger ? "border-red-400/20 hover:border-red-400/40" : "border-white/10 hover:border-white/20"
      } bg-white/5 hover:bg-white/10 transition`}
    >
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3`}>
        <Icon size={15} className="text-black" />
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{subtitle}</div>
    </motion.button>
  );
}
