import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown, Users, UserPlus, Activity, ArrowRight, Building2,
  Handshake, UserCheck, GitBranch, Sliders, Zap, History,
  TrendingUp, IndianRupee,
} from "lucide-react";
import { db } from "../../lib/db.js";
import { PageHeader, KpiCard, Panel, Badge, timeAgo, ROLE_COLORS } from "./_shared.jsx";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const QUICK_LINKS = [
  { to: "/admin/team",          label: "Manage Team",  icon: Users,     tint: "from-yellow-400 to-amber-500" },
  { to: "/admin/pipelines",     label: "Pipelines",    icon: GitBranch, tint: "from-sky-400 to-blue-500" },
  { to: "/admin/custom-fields", label: "Custom Fields", icon: Sliders,  tint: "from-violet-400 to-purple-500" },
  { to: "/admin/automation",    label: "Automation",   icon: Zap,       tint: "from-emerald-400 to-green-500" },
  { to: "/admin/audit-logs",    label: "Audit Logs",   icon: History,   tint: "from-pink-400 to-rose-500" },
];

export default function AdminOverview() {
  const stats = useMemo(() => {
    const root = db.raw();
    const users = root.users || [];
    const leads = root.leads || [];
    const deals = root.deals || [];
    const customers = root.customers || [];
    const audit = root.auditLogs || [];

    const wonDeals = deals.filter((d) => d.stage === "Won");
    const revenue = wonDeals.reduce((s, d) => s + Number(d.value || 0), 0);
    const profit = Math.round(revenue * 0.38);

    return {
      users: { total: users.length, active: users.filter((u) => u.status === "Active").length, super: users.filter((u) => u.role === "OWNER").length },
      leads: { total: leads.length },
      deals: { total: deals.length, won: wonDeals.length, profit },
      customers: { total: customers.length },
      revenue,
      recentAudit: audit.slice(0, 6),
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 relative">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-500/15 blur-3xl" />
      </div>

      <PageHeader
        icon={Crown}
        title="Overview"
        subtitle="System-wide metrics across every user, lead, deal, and payment."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Users}     label="Users"    value={stats.users.total} sub={`${stats.users.active} active · ${stats.users.super} super`} tint="from-yellow-400 to-amber-500" />
        <KpiCard icon={UserPlus}  label="Leads"    value={stats.leads.total} sub={`${stats.deals.total} deals in flight`}                       tint="from-sky-400 to-blue-500" />
        <KpiCard icon={Activity}  label="Revenue"  value={formatINR(stats.revenue)} sub={`${stats.deals.won} won deals`}                         tint="from-emerald-400 to-green-500" />
        <KpiCard icon={Crown}     label="Profit"   value={formatINR(stats.deals.profit)} sub="estimated @ 38% margin"                            tint="from-pink-400 to-rose-500" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="group flex items-center justify-between gap-2 px-3 py-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 hover:bg-white/[0.07] transition-colors min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${q.tint} flex items-center justify-center flex-shrink-0`}>
                <q.icon size={16} className="text-black" />
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate">{q.label}</span>
            </div>
            <ArrowRight size={14} className="text-gray-500 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all flex-shrink-0 hidden md:block" />
          </Link>
        ))}
      </div>

      {/* Activity + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Panel title="Recent activity" accent="text-yellow-300" action={
          <Link to="/admin/audit-logs" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-yellow-300 inline-flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        }>
          {stats.recentAudit.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No recent activity.</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.recentAudit.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                    {a.actorAvatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 truncate"><span className="font-semibold">{a.actor}</span> <span className="text-gray-500">{a.action.toLowerCase()}</span> <span className="text-yellow-200">{a.entity}</span></p>
                    <p className="text-[10px] text-gray-500 truncate">{a.target}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Team" accent="text-sky-300" action={
          <Link to="/admin/team" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-sky-300 inline-flex items-center gap-1">
            Manage <ArrowRight size={11} />
          </Link>
        }>
          <ul className="space-y-2">
            {(db.get("users") || []).slice(0, 6).map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                  {u.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                </div>
                <Badge color={ROLE_COLORS[u.role] || "gray"}>{u.role}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Customers + Deals snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Panel title="Customer health" accent="text-emerald-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
              <UserCheck size={16} className="text-emerald-400 mb-2" />
              <p className="text-2xl font-black text-emerald-300">{stats.customers.total}</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-300/70 mt-1">Total Customers</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
              <TrendingUp size={16} className="text-yellow-400 mb-2" />
              <p className="text-2xl font-black text-yellow-300">87%</p>
              <p className="text-[10px] uppercase tracking-widest text-yellow-300/70 mt-1">Retention rate</p>
            </div>
          </div>
        </Panel>

        <Panel title="Deal pipeline" accent="text-violet-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-violet-400/5 border border-violet-400/20">
              <Handshake size={16} className="text-violet-400 mb-2" />
              <p className="text-2xl font-black text-violet-300">{stats.deals.total}</p>
              <p className="text-[10px] uppercase tracking-widest text-violet-300/70 mt-1">Active deals</p>
            </div>
            <div className="p-4 rounded-xl bg-pink-400/5 border border-pink-400/20">
              <IndianRupee size={16} className="text-pink-400 mb-2" />
              <p className="text-xl font-black text-pink-300 truncate">{formatINR(stats.revenue)}</p>
              <p className="text-[10px] uppercase tracking-widest text-pink-300/70 mt-1">Closed revenue</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
