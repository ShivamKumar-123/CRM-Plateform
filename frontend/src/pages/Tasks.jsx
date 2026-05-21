import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, RefreshCw, Calendar, AlertTriangle, Clock,
  CircleDashed, Loader2, CheckCircle2, X, Filter, List, ChevronLeft, ChevronRight,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_META = {
  PENDING:     { icon: CircleDashed, color: "text-gray-300", chip: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  IN_PROGRESS: { icon: Loader2,      color: "text-sky-300",  chip: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  COMPLETED:   { icon: CheckCircle2, color: "text-emerald-300", chip: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
};

const PRIORITY_CHIP = {
  HIGH:   "bg-red-500/20 text-red-300 border-red-500/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  LOW:    "bg-sky-500/20 text-sky-300 border-sky-500/40",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const { user } = useAuth();

  const canManage = user && (
    user.is_superuser ||
    user.is_staff ||
    ["OWNER", "ADMIN", "MANAGER"].includes(user.role)
  );

  const load = () => {
    setLoading(true);
    setError("");
    api.getTasks()
      .then((d) => {
        setTasks(d?.tasks || []);
        setStats(d?.stats || null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!statusFilter) return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const changeStatus = async (task, status) => {
    if (!canManage) {
      alert("Sirf Admin/Manager status update kar sakte hain. Apne lead ko bolo.");
      return;
    }
    // optimistic
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status } : t));
    try {
      await api.updateTask(task.id, { ...task, status });
    } catch (e) {
      alert(e.message);
      load();
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <CheckSquare size={20} className="text-black" />
            </span>
            My Tasks
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Tasks assigned to you. {canManage ? "Click status to update." : "Read-only — your manager controls status."}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                view === "list" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}>
              <List size={13} /> List
            </button>
            <button onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition ${
                view === "calendar" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}>
              <Calendar size={13} /> Calendar
            </button>
          </div>
          <button onClick={load}
            className="p-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="All tasks" value={stats.total_tasks ?? 0} />
          <Stat label="Pending" value={stats.pending_tasks ?? 0} accent="text-gray-300" />
          <Stat label="In progress" value={stats.in_progress_tasks ?? 0} accent="text-sky-300" />
          <Stat label="Completed" value={stats.completed_tasks ?? 0} accent="text-emerald-300" />
        </motion.div>
      )}

      {/* Filter chips */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1">
          <Filter size={11} /> Filter
        </span>
        <FilterChip active={!statusFilter} onClick={() => setStatusFilter("")}>All</FilterChip>
        <FilterChip active={statusFilter === "PENDING"} onClick={() => setStatusFilter("PENDING")}>Pending</FilterChip>
        <FilterChip active={statusFilter === "IN_PROGRESS"} onClick={() => setStatusFilter("IN_PROGRESS")}>In progress</FilterChip>
        <FilterChip active={statusFilter === "COMPLETED"} onClick={() => setStatusFilter("COMPLETED")}>Completed</FilterChip>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Task list / calendar */}
      {view === "list" ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
          className="space-y-3">
          {filtered.map((t) => (
            <TaskRow key={t.id} task={t} onClick={() => setSelected(t)} onStatusChange={changeStatus} canManage={canManage} />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 rounded-2xl bg-white/[0.03] border border-white/10">
              <CheckSquare size={32} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">
                {tasks.length === 0 ? "Koi tasks assigned nahi hain." : "No tasks match this filter."}
              </p>
            </div>
          )}
          {loading && (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          )}
        </motion.div>
      ) : (
        <TaskCalendar tasks={filtered} onSelect={setSelected} />
      )}

      <AnimatePresence>
        {selected && <TaskDetail task={selected} onClose={() => setSelected(null)} canManage={canManage} onStatusChange={(s) => { changeStatus(selected, s); setSelected({ ...selected, status: s }); }} />}
      </AnimatePresence>
    </div>
  );
}

function TaskRow({ task, onClick, onStatusChange, canManage }) {
  const meta = STATUS_META[task.status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  const due = task.due_date ? new Date(task.due_date) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = due && due < today && task.status !== "COMPLETED";

  return (
    <motion.div layout
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`group p-4 rounded-2xl bg-white/[0.03] border transition cursor-pointer
        ${overdue ? "border-red-500/40 hover:border-red-500/60" : "border-white/10 hover:border-yellow-400/30"}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!canManage) return;
            const next = task.status === "PENDING" ? "IN_PROGRESS"
                       : task.status === "IN_PROGRESS" ? "COMPLETED"
                       : "PENDING";
            onStatusChange(task, next);
          }}
          className={`mt-0.5 ${canManage ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
          title={canManage ? "Click to cycle status" : "Status managed by your manager"}
        >
          <Icon size={20} className={`${meta.color} ${task.status === "IN_PROGRESS" ? "animate-spin" : ""}`} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={`text-base font-semibold truncate ${task.status === "COMPLETED" ? "text-gray-500 line-through" : "text-white"}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {task.priority && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${PRIORITY_CHIP[task.priority]}`}>
                  {task.priority}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${meta.chip}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
            {due && (
              <span className={`flex items-center gap-1 ${overdue ? "text-red-400 font-semibold" : ""}`}>
                {overdue ? <AlertTriangle size={11} /> : <Calendar size={11} />}
                {due.toLocaleDateString()} {overdue && "(overdue)"}
              </span>
            )}
            {task.created_by_username && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> by {task.created_by_username}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskDetail({ task, onClose, onStatusChange, canManage }) {
  const meta = STATUS_META[task.status] || STATUS_META.PENDING;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-gray-950 border border-violet-400/20 shadow-[0_20px_80px_rgba(167,139,250,0.15)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">{task.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {task.description && (
          <p className="text-sm text-gray-300 whitespace-pre-wrap mb-4">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.chip}`}>
              {task.status.replace("_", " ")}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Priority</p>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${PRIORITY_CHIP[task.priority] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
              {task.priority || "MEDIUM"}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Due date</p>
            <p className="text-gray-200">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Created by</p>
            <p className="text-gray-200">{task.created_by_username || "—"}</p>
          </div>
        </div>

        {canManage && (
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Move to</p>
            <div className="flex gap-2">
              {["PENDING", "IN_PROGRESS", "COMPLETED"].map((s) => (
                <button key={s} onClick={() => onStatusChange(s)}
                  disabled={s === task.status}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition ${
                    s === task.status
                      ? "bg-white/10 text-gray-500 border-white/10 cursor-default"
                      : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                  }`}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, accent = "text-white" }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
      <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
        active
          ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/40"
          : "bg-white/[0.04] text-gray-400 border-white/10 hover:bg-white/10"
      }`}>
      {children}
    </button>
  );
}

/* ─── Calendar view ──────────────────────────────────────── */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function TaskCalendar({ tasks, onSelect }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d;
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const byDay = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const d = new Date(t.due_date);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = d.getDate();
      (m[key] = m[key] || []).push(t);
    });
    return m;
  }, [tasks, year, month]);

  const todayObj = new Date();
  const isToday = (day) =>
    todayObj.getFullYear() === year &&
    todayObj.getMonth() === month &&
    todayObj.getDate() === day;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
      className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); setCursor(d); }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[10px] uppercase tracking-widest text-gray-500 text-center py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} className="aspect-square" />;
          const dayTasks = byDay[day] || [];
          const overdueToday = isToday(day) && dayTasks.some((t) => t.status !== "COMPLETED");
          return (
            <div
              key={idx}
              className={`aspect-square rounded-lg p-1.5 border flex flex-col text-left ${
                isToday(day)
                  ? "bg-yellow-400/10 border-yellow-400/40"
                  : "bg-white/[0.02] border-white/10"
              } ${dayTasks.length ? "ring-1 ring-violet-400/20" : ""}`}
            >
              <div className={`text-xs font-bold ${isToday(day) ? "text-yellow-300" : "text-gray-300"} flex items-center justify-between`}>
                <span>{day}</span>
                {overdueToday && <AlertTriangle size={10} className="text-red-400" />}
              </div>
              <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => {
                  const chip = STATUS_META[t.status] || STATUS_META.PENDING;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelect(t)}
                      className={`block w-full text-left truncate text-[10px] px-1 py-0.5 rounded ${chip.chip} hover:opacity-80`}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-[9px] text-gray-500 pl-1">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
