import { motion } from "framer-motion";
import {
  Zap, UserPlus, MessageCircle, ListChecks, BellRing, ArrowDown,
  Workflow, Sparkles, Mail, Phone, FileCheck, Trophy,
} from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useIndustry } from "../context/IndustryContext.jsx";

const FLOWS = [
  {
    id: "new-lead",
    title: "When a new lead arrives",
    trigger: { icon: UserPlus, label: "Lead created", color: "from-sky-400 to-blue-500" },
    actions: [
      { icon: MessageCircle, label: "Auto WhatsApp welcome", color: "from-emerald-400 to-green-500" },
      { icon: ListChecks, label: "Task assigned to owner", color: "from-yellow-400 to-amber-500" },
      { icon: BellRing, label: "Manager notified", color: "from-fuchsia-400 to-pink-500" },
    ],
    runs: 248,
    status: "active",
  },
  {
    id: "deal-won",
    title: "When a deal moves to WON",
    trigger: { icon: Trophy, label: "Deal · stage = Won", color: "from-emerald-400 to-green-500" },
    actions: [
      { icon: Mail, label: "Send invoice email", color: "from-yellow-400 to-amber-500" },
      { icon: FileCheck, label: "Generate contract PDF", color: "from-sky-400 to-blue-500" },
      { icon: Sparkles, label: "Move customer to Onboarding pipeline", color: "from-violet-400 to-purple-500" },
    ],
    runs: 64,
    status: "active",
  },
  {
    id: "renewal",
    title: "Renewal reminder",
    trigger: { icon: Sparkles, label: "Policy / contract · expires in 30d", color: "from-violet-400 to-purple-500" },
    actions: [
      { icon: Phone, label: "Schedule follow-up call", color: "from-rose-400 to-red-500" },
      { icon: Mail, label: "Send personalized renewal offer", color: "from-yellow-400 to-amber-500" },
    ],
    runs: 31,
    status: "active",
  },
];

export default function Automation() {
  const { industry } = useIndustry();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="Automation"
        subtitle={`Visual workflow chains running on top of your ${industry.label.replace(" CRM", "")} pipeline.`}
      />

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Active flows", value: FLOWS.length, icon: Workflow, color: "from-yellow-400 to-amber-500" },
          { label: "Runs this month", value: FLOWS.reduce((s, f) => s + f.runs, 0), icon: Zap, color: "from-sky-400 to-blue-500" },
          { label: "Avg success rate", value: "98.4%", icon: Sparkles, color: "from-emerald-400 to-green-500" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
              <k.icon size={16} className="text-black" />
            </div>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        {FLOWS.map((flow, fi) => (
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: fi * 0.08 }}
            className="glass rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative">
              <div>
                <h3 className="text-lg font-semibold">{flow.title}</h3>
                <div className="text-xs text-gray-500 mt-0.5">{flow.runs} runs in last 30 days</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">{flow.status}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 relative">
              <FlowCard {...flow.trigger} kind="trigger" />
              {flow.actions.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.12 }}
                  className="flex flex-col items-center gap-2 w-full"
                >
                  <Connector />
                  <FlowCard {...a} kind="action" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FlowCard({ icon: Icon, label, color, kind }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`w-full max-w-md flex items-center gap-3 px-5 py-4 rounded-2xl border ${
        kind === "trigger"
          ? "border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 via-amber-500/5 to-transparent"
          : "border-white/10 bg-white/5"
      } shadow-lg`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
        <Icon size={16} className="text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
          {kind === "trigger" ? "Trigger" : "Action"}
        </div>
        <div className="text-sm font-medium text-white">{label}</div>
      </div>
    </motion.div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-4 bg-gradient-to-b from-yellow-400/60 to-yellow-400/0" />
      <ArrowDown size={14} className="text-yellow-400/70" />
    </div>
  );
}
