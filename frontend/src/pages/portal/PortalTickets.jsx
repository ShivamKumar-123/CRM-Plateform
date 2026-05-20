import { useEffect, useState } from "react";
import { Plus, MessageSquare, Send, AlertTriangle, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api.js";
import { portalAuth } from "./PortalLayout.jsx";

const STATUS_COLORS = {
  OPEN: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  IN_PROGRESS: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  WAITING: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  RESOLVED: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  CLOSED: "bg-gray-400/15 text-gray-300 border-gray-400/30",
};

export default function PortalTickets() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    const t = portalAuth.get();
    api.portal.tickets(t).then(setTickets).catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  if (active) {
    return <TicketView ticketId={active} onBack={() => { setActive(null); load(); }} />;
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="text-yellow-400" /> Support tickets
          </h1>
          <p className="text-sm text-gray-400 mt-1">{tickets.length} ticket(s)</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm"
        >
          <Plus size={14} /> New ticket
        </button>
      </header>

      {err && <div className="text-sm text-red-300 mb-4 flex items-center gap-2"><AlertTriangle size={14} /> {err}</div>}

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">No tickets yet. Open one if you need help.</div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/30 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-500">{t.number}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[t.status] || ""}`}>
                  {t.status}
                </span>
              </div>
              <div className="text-sm font-medium text-white truncate">{t.subject}</div>
              <div className="text-[11px] text-gray-500 mt-1">
                {new Date(t.created_at).toLocaleString()} · {t.message_count || 0} message(s)
              </div>
            </button>
          ))}
        </div>
      )}

      {creating && <NewTicketModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
    </div>
  );
}

function TicketView({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  function load() {
    const t = portalAuth.get();
    api.portal.ticket(t, ticketId).then(setTicket).catch((e) => setErr(e.message));
  }
  useEffect(load, [ticketId]);

  async function send() {
    if (!reply.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const t = portalAuth.get();
      await api.portal.replyTicket(t, ticketId, reply);
      setReply("");
      load();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  if (!ticket) return <div className="p-10 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mb-5">
        <div className="text-[10px] font-mono text-gray-500 mb-1">{ticket.number}</div>
        <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
        <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[ticket.status] || ""}`}>
          {ticket.status}
        </span>
      </div>

      {ticket.description && (
        <div className="mb-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl text-sm">
          {ticket.description}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {(ticket.messages || []).map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl border ${
              m.author_type === "CUSTOMER"
                ? "bg-sky-400/10 border-sky-400/20"
                : "bg-yellow-400/5 border-yellow-400/20"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 flex justify-between">
              <span>{m.author_type === "CUSTOMER" ? "You" : "Support team"}</span>
              <span>{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-200 whitespace-pre-wrap">{m.body}</div>
          </div>
        ))}
      </div>

      {!["RESOLVED", "CLOSED"].includes(ticket.status) && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          {err && <div className="text-xs text-red-300 mb-2">{err}</div>}
          <textarea
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply…"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
          <div className="flex justify-end mt-2">
            <button
              disabled={busy || !reply.trim()}
              onClick={send}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold text-sm disabled:opacity-50"
            >
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewTicketModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ subject: "", body: "", priority: "NORMAL" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const t = portalAuth.get();
      await api.portal.createTicket(t, form);
      onSaved();
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-gray-950 border border-yellow-400/30 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">New support ticket</h2>
        {err && <div className="text-xs text-red-300 mb-3">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Subject</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Description</label>
            <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
              {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold disabled:opacity-50">
              {busy ? "Sending…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
