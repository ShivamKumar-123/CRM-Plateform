import {
  Server, Database, Lock, ShieldCheck, Activity, Crown,
  BarChart3, ExternalLink, Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../lib/api.js";
import { Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminSystem() {
  const { user } = useAuth();

  const cards = [
    { icon: Server, label: "API endpoint", value: API_URL },
    { icon: Database, label: "Database", value: "PostgreSQL · CONN_MAX_AGE 60s" },
    { icon: Lock, label: "Auth", value: "JWT (SimpleJWT) · rotating refresh · 60min access / 7day refresh" },
    { icon: ShieldCheck, label: "Permissions", value: "DRF · role-based · IsSuperUser custom permission" },
    { icon: Activity, label: "Throttling", value: "30/min anonymous · 1000/hr authenticated" },
    { icon: Crown, label: "Signed in as", value: user ? `${user.username} (id #${user.id}) · role ${user.role}` : "—" },
  ];

  const securityChecklist = [
    "JWT bearer tokens with rotating refresh",
    "Password validators (length 8+, common, numeric, similarity)",
    "CORS origin whitelist (env-driven)",
    "CSRF trusted origins (env-driven)",
    "Strict-Transport-Security 1 year (DEBUG=False)",
    "X-Frame-Options: DENY",
    "X-Content-Type-Options: nosniff",
    "Strict-Origin-When-Cross-Origin referrer policy",
    "Upload caps: 5 MB max (both data and file)",
    "Document upload whitelist: PDF / JPG / JPEG / PNG",
    "Superuser-only routes server-side enforced",
    "WhiteNoise compressed static delivery",
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Header title="System" subtitle="Stack, endpoints, and security posture." accent={Server} />

      <Panel title="System information" accent="text-sky-300" full>
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                <c.icon size={18} className="text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-gray-500">{c.label}</p>
                <p className="text-sm text-white mt-1 break-all">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Quick links" accent="text-emerald-300" full>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <LinkCard
            icon={ShieldCheck}
            label="Django Admin"
            href={`${API_URL}/admin/`}
            sub="/admin/"
            tint="text-yellow-400"
          />
          <LinkCard
            icon={BarChart3}
            label="Dashboard API"
            href={`${API_URL}/api/dashboard/`}
            sub="/api/dashboard/"
            tint="text-sky-400"
          />
          <LinkCard
            icon={Activity}
            label="Admin Stats API"
            href={`${API_URL}/api/admin/stats/`}
            sub="/api/admin/stats/"
            tint="text-emerald-400"
          />
        </div>
      </Panel>

      <Panel title="Security hardening" accent="text-pink-300" full>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {securityChecklist.map((line) => (
            <li key={line} className="flex items-center gap-2 text-gray-300">
              <Check size={14} className="text-emerald-400 flex-shrink-0" />
              {line}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function LinkCard({ icon: Icon, label, href, sub, tint }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-3"
    >
      <Icon size={18} className={tint} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-gray-500 truncate">{sub}</p>
      </div>
      <ExternalLink size={14} className="text-gray-500" />
    </a>
  );
}
