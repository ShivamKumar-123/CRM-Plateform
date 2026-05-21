import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Headphones, Plus, Building2, Clock, MessageSquare, Send,
  Trash2, Edit3, AlertTriangle, Check, ChevronRight, Search,
} from "lucide-react";
import { api } from "../../lib/api.js";
import {
  modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge, SuccessNote,
} from "./_shared.jsx";

const STATUS_PALETTE = {
  OPEN: "bg-sky-400 text-black",
  IN_PROGRESS: "bg-yellow-400 text-black",
  WAITING: "bg-violet-400 text-white",
  RESOLVED: "bg-emerald-400 text-black",
  CLOSED: "bg-gray-500 text-white",
};
const PRIORITY_PALETTE = {
  LOW: "bg-gray-500 text-white",
  NORMAL: "bg-sky-400 text-black",
  HIGH: "bg-amber-500 text-black",
  URGENT: "bg-red-500 text-white",
};

export default function AdminHelpdesk() {
  const [tab, setTab] = useState("tickets");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Headphones className="text-yellow-400" /> Helpdesk
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tickets, SLA timers, departments, canned replies — all in one place.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {["tickets", "departments", "sla", "canned"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs rounded ${
                tab === t ? "bg-yellow-400 text-black font-bold" : "text-gray-300"
              }`}
            >
              {t === "sla" ? "SLA" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {tab === "tickets" && <TicketsTab />}
      {tab === "departments" && <DepartmentsTab />}
      {tab === "sla" && <SLATab />}
      {tab === "canned" && <CannedRepliesTab />}
    </div>
  );
}

// ─── Tickets tab ─────────────────────────────────────────────────

function TicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [active, setActive] = useState(null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState(null);

  function load() {
    api.getTickets(statusFilter || null)
      .then((d) => setTickets(d.results || []))
      .catch((e) => setErr(e.message));
    api.getDepartments().then(setDepartments).catch(() => {});
  }
  useEffect(load, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search) return tickets;
    const q = search.toLowerCase();
    return tickets.filter((t) =>
      t.subject.toLowerCase().includes(q) ||
      (t.customer_email || "").toLowerCase().includes(q) ||
      t.number.toLowerCase().includes(q),
    );
  }, [tickets, search]);

  return (
    <>
      {err && <ErrorBanner msg={err} onRetry={load} />}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <Panel
            title={<span className="flex items-center justify-between"><span>Tickets ({filtered.length})</span></span>}
            accent="text-yellow-300"
          >
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className={`${modalInput} pl-7 text-xs`}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${modalInput} max-w-[120px] text-xs`}>
                <option value="">All</option>
                {Object.keys(STATUS_PALETTE).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={() => setCreating(true)}
                className="px-2 rounded bg-yellow-400 text-black"
                title="New ticket"
              >
                <Plus size={14} />
              </button>
            </div>

            {filtered.length === 0 ? <Empty msg="No tickets." /> : (
              <ul className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      active?.id === t.id
                        ? "border-yellow-400/40 bg-yellow-400/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500 font-mono">{t.number}</span>
                      <div className="flex gap-1">
                        <StatusBadge status={t.priority} palette={PRIORITY_PALETTE} />
                        <StatusBadge status={t.status} palette={STATUS_PALETTE} />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-white truncate">{t.subject}</div>
                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                      <span className="truncate">{t.customer_email || "—"}</span>
                      {t.sla_breached && (
                        <span className="text-red-300 flex items-center gap-1">
                          <AlertTriangle size={9} /> SLA
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-3">
          {active ? (
            <TicketDetail
              ticketId={active.id}
              departments={departments}
              onChanged={() => load()}
              onClose={() => setActive(null)}
            />
          ) : (
            <Panel title="Select a ticket" accent="text-sky-300">
              <Empty msg="Click a ticket on the left." />
            </Panel>
          )}
        </div>
      </div>

      <AnimatePresence>
        {creating && (
          <NewTicketModal
            departments={departments}
            onClose={() => setCreating(false)}
            onSaved={() => { setCreating(false); load(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function TicketDetail({ ticketId, departments: _departments, onChanged, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [canned, setCanned] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    api.getTicket(ticketId).then(setTicket).catch((e) => setErr(e.message));
    api.getCannedReplies().then(setCanned).catch(() => {});
  }
  useEffect(load, [ticketId]);

  async function sendReply() {
    if (!reply.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api.replyTicket(ticketId, reply, internal);
      setReply("");
      setInternal(false);
      load();
      onChanged();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  async function changeStatus(status) {
    try {
      await api.updateTicket(ticketId, { status });
      load();
      onChanged();
    } catch (ex) { setErr(ex.message); }
  }

  if (!ticket) return <Panel title="Loading…"><Empty msg="" /></Panel>;

  return (
    <Panel
      title={<div className="flex items-center justify-between gap-2">
        <span>{ticket.number} · {ticket.subject}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">close</button>
      </div>}
      accent="text-yellow-300"
    >
      {err && <ErrorBanner msg={err} />}

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <StatusBadge status={ticket.priority} palette={PRIORITY_PALETTE} />
        <StatusBadge status={ticket.status} palette={STATUS_PALETTE} />
        <select
          value={ticket.status}
          onChange={(e) => changeStatus(e.target.value)}
          className={`${modalInput} max-w-[150px] text-xs`}
        >
          {Object.keys(STATUS_PALETTE).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {ticket.sla_breached && (
          <span className="text-xs text-red-300 flex items-center gap-1">
            <AlertTriangle size={11} /> SLA breached
          </span>
        )}
      </div>

      <div className="text-xs text-gray-400 grid grid-cols-2 gap-2 mb-4 bg-black/30 rounded-lg p-3">
        <div><b className="text-gray-300">Customer:</b> {ticket.customer_name || ticket.customer_email || "—"}</div>
        <div><b className="text-gray-300">Email:</b> {ticket.customer_email || "—"}</div>
        <div><b className="text-gray-300">Department:</b> {ticket.department_name || "—"}</div>
        <div><b className="text-gray-300">Assignee:</b> {ticket.assigned_to_username || "—"}</div>
        {ticket.resolution_due && (
          <div className="col-span-2">
            <b className="text-gray-300">Resolution due:</b> {new Date(ticket.resolution_due).toLocaleString()}
          </div>
        )}
      </div>

      {ticket.description && (
        <div className="mb-4 p-3 bg-white/[0.03] border border-white/5 rounded-lg text-sm text-gray-200">
          {ticket.description}
        </div>
      )}

      <div className="mb-4 max-h-72 overflow-y-auto space-y-3 pr-2">
        {(ticket.messages || []).map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>

      <div className="rounded-lg border border-white/10 p-3 bg-black/30">
        {canned.length > 0 && (
          <div className="mb-2 flex gap-2 flex-wrap text-[10px]">
            {canned.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => setReply((r) => (r ? `${r}\n\n${c.body}` : c.body))}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
        <textarea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to customer…"
          className={modalInput}
        />
        <div className="flex items-center justify-between gap-2 mt-2">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
            Internal note (invisible to customer)
          </label>
          <button
            disabled={busy || !reply.trim()}
            onClick={sendReply}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold disabled:opacity-50"
          >
            <Send size={12} /> Send reply
          </button>
        </div>
      </div>
    </Panel>
  );
}

function MessageRow({ message }) {
  const isCustomer = message.author_type === "CUSTOMER";
  const isInternal = message.is_internal;
  return (
    <div className={`rounded-lg p-3 border ${
      isInternal ? "bg-yellow-400/5 border-yellow-400/20"
      : isCustomer ? "bg-sky-400/5 border-sky-400/20"
      : "bg-white/[0.03] border-white/10"
    }`}>
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
        <span className="font-bold uppercase tracking-wider">
          {isInternal && "[Internal] "}
          {isCustomer ? "Customer" : message.author_username || message.author_name || "Agent"}
        </span>
        <span>{new Date(message.created_at).toLocaleString()}</span>
      </div>
      <div className="text-sm text-gray-200 whitespace-pre-wrap">{message.body}</div>
    </div>
  );
}

function NewTicketModal({ departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    subject: "", description: "",
    customer_name: "", customer_email: "", customer_phone: "",
    priority: "NORMAL", source: "WEB", department: "",
  });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const body = { ...form };
      if (!body.department) delete body.department;
      await api.createTicket(body);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="New ticket" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Subject" wide>
          <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Description" wide>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Customer name">
          <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Customer email">
          <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Phone">
          <input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Department">
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={modalInput}>
            <option value="">(unassigned)</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={modalInput}>
            {Object.keys(PRIORITY_PALETTE).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Source">
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={modalInput}>
            {["WEB", "EMAIL", "PORTAL", "PHONE", "CHAT"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Departments tab ─────────────────────────────────────────────

function DepartmentsTab() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState(null);

  function load() {
    api.getDepartments().then(setItems).catch((e) => setErr(e.message));
    api.getAdminUsers().then(setUsers).catch(() => {});
  }
  useEffect(load, []);

  function remove(id) {
    if (!confirm("Delete this department?")) return;
    api.deleteDepartment(id).then(load).catch((e) => setErr(e.message));
  }

  return (
    <>
      {err && <ErrorBanner msg={err} />}
      <Panel
        title={<div className="flex items-center justify-between"><span>Departments</span>
          <button onClick={() => setCreating(true)} className="px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold">
            <Plus size={12} className="inline" /> Add
          </button>
        </div>}
        accent="text-yellow-300"
      >
        {items.length === 0 ? <Empty msg="No departments yet." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: d.color }}>
                  <Building2 size={14} className="text-black" />
                </div>
                <div className="text-sm font-semibold mb-1">{d.name}</div>
                <div className="text-xs text-gray-400 line-clamp-2 mb-2">{d.description || "—"}</div>
                <div className="text-[11px] text-gray-500 flex gap-3">
                  <span>{d.member_count} members</span>
                  <span>{d.ticket_count} tickets</span>
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => setEditing(d)} className="text-yellow-300"><Edit3 size={12} /></button>
                  <button onClick={() => remove(d.id)} className="text-red-300"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <AnimatePresence>
        {(creating || editing) && (
          <DepartmentModal
            dept={editing}
            users={users}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function DepartmentModal({ dept, users, onClose, onSaved }) {
  const isEdit = !!dept;
  const [form, setForm] = useState({
    name: dept?.name || "",
    description: dept?.description || "",
    email: dept?.email || "",
    color: dept?.color || "#facc15",
    default_assignee: dept?.default_assignee || "",
    is_active: dept?.is_active ?? true,
    member_ids: [],
  });
  const [err, setErr] = useState(null);

  function toggleMember(id) {
    setForm((f) => ({
      ...f,
      member_ids: f.member_ids.includes(id)
        ? f.member_ids.filter((x) => x !== id)
        : [...f.member_ids, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const body = { ...form };
      if (!body.default_assignee) delete body.default_assignee;
      if (isEdit) await api.updateDepartment(dept.id, body);
      else await api.createDepartment(body);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title={isEdit ? "Edit department" : "New department"} onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Color">
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded bg-white/5 border border-white/10" />
        </Field>
        <Field label="Description" wide>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Inbound email">
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Default assignee">
          <select value={form.default_assignee || ""} onChange={(e) => setForm({ ...form, default_assignee: e.target.value })} className={modalInput}>
            <option value="">—</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </Field>
        <Field label="Members" wide>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-white/10 p-2 grid grid-cols-2 gap-1 text-xs">
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                <input type="checkbox" checked={form.member_ids.includes(u.id)} onChange={() => toggleMember(u.id)} />
                {u.username}
              </label>
            ))}
          </div>
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">{isEdit ? "Save" : "Create"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── SLA tab ─────────────────────────────────────────────────────

function SLATab() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    api.getSLAPolicies().then(setItems).catch((e) => setErr(e.message));
    api.getDepartments().then(setDepartments).catch(() => {});
  }
  useEffect(load, []);

  return (
    <>
      {err && <ErrorBanner msg={err} />}
      <Panel
        title={<div className="flex items-center justify-between"><span>SLA policies</span>
          <button onClick={() => setCreating(true)} className="px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold">
            <Plus size={12} className="inline" /> Add
          </button>
        </div>}
        accent="text-yellow-300"
      >
        {items.length === 0 ? <Empty msg="No SLA policies yet." /> : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Dept</th>
                <th className="text-left px-3 py-2">Priority</th>
                <th className="text-left px-3 py-2">First response</th>
                <th className="text-left px-3 py-2">Resolution</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-xs">{departments.find((d) => d.id === p.department)?.name || "—"}</td>
                  <td className="px-3 py-2 text-xs"><StatusBadge status={p.priority} palette={PRIORITY_PALETTE} /></td>
                  <td className="px-3 py-2 text-xs text-gray-300">{p.first_response_minutes} min</td>
                  <td className="px-3 py-2 text-xs text-gray-300">{p.resolution_minutes} min</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => api.deleteSLAPolicy(p.id).then(load)} className="text-red-300"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <AnimatePresence>
        {creating && (
          <SLAModal departments={departments} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function SLAModal({ departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", priority: "NORMAL", department: "",
    first_response_minutes: 60, resolution_minutes: 1440, is_active: true,
  });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault(); setErr(null);
    try {
      const body = { ...form, first_response_minutes: Number(form.first_response_minutes), resolution_minutes: Number(form.resolution_minutes) };
      if (!body.department) delete body.department;
      await api.createSLAPolicy(body);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="New SLA policy" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Name" wide>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Department">
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={modalInput}>
            <option value="">(any)</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={modalInput}>
            {Object.keys(PRIORITY_PALETTE).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="First response (minutes)">
          <input type="number" value={form.first_response_minutes} onChange={(e) => setForm({ ...form, first_response_minutes: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Resolution (minutes)">
          <input type="number" value={form.resolution_minutes} onChange={(e) => setForm({ ...form, resolution_minutes: e.target.value })} className={modalInput} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Canned replies tab ──────────────────────────────────────────

function CannedRepliesTab() {
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    api.getCannedReplies().then(setItems).catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  return (
    <>
      {err && <ErrorBanner msg={err} />}
      <Panel
        title={<div className="flex items-center justify-between"><span>Canned replies</span>
          <button onClick={() => setCreating(true)} className="px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold">
            <Plus size={12} className="inline" /> Add
          </button>
        </div>}
        accent="text-yellow-300"
      >
        {items.length === 0 ? <Empty msg="No canned replies yet. Variables: {customer_name}, {ticket_number}, {assignee}, {subject}" /> : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-white/5 border border-white/10 relative">
                <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <MessageSquare size={12} className="text-yellow-400" /> {c.title}
                </div>
                <div className="text-xs text-gray-400 line-clamp-3 mb-2">{c.body}</div>
                <div className="text-[10px] text-gray-500 flex items-center gap-2">
                  Used {c.usage_count}× · {c.department_name || "any dept"}
                </div>
                <button onClick={() => api.deleteCannedReply(c.id).then(load)} className="absolute top-2 right-2 text-red-300">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <AnimatePresence>
        {creating && (
          <CannedModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function CannedModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault(); setErr(null);
    try {
      await api.createCannedReply(form);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="New canned reply" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Body — supports {customer_name}, {ticket_number}, {assignee}, {subject}">
          <textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={modalInput} />
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}
