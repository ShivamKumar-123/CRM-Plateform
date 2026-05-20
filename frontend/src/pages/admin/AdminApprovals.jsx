import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check, X, MessageCircle, Plus, Clock, Trash2, Workflow } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  PENDING: "bg-yellow-400 text-black",
  APPROVED: "bg-emerald-400 text-black",
  REJECTED: "bg-red-500 text-white",
  CANCELLED: "bg-gray-500 text-white",
};

const TYPES = ["DISCOUNT", "CONTRACT", "PAYMENT", "LEAVE", "REFUND", "OTHER"];

export default function AdminApprovals() {
  const [tab, setTab] = useState("inbox"); // inbox | requested | all
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(null);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState(null); // detail-pane request

  function load() {
    setErr(null);
    const q = tab === "inbox" ? "pending_my_approval" : tab === "requested" ? "requested" : "";
    api.getApprovals(q).then(setItems).catch((e) => setErr(e.message));
    api.getAdminUsers().then(setUsers).catch(() => {});
  }
  useEffect(load, [tab]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Workflow className="text-yellow-400" /> Approvals
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Multi-step approval chains for discounts, contracts, payments, leave and more.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {["inbox", "requested", "all"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs rounded ${tab === t ? "bg-yellow-400 text-black font-bold" : "text-gray-300"}`}
              >
                {t === "inbox" ? "Awaiting me" : t === "requested" ? "My requests" : "All"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm"
          >
            <Plus size={14} /> New request
          </button>
        </div>
      </header>

      {err && <ErrorBanner msg={err} />}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Requests" accent="text-yellow-300">
            {items.length === 0 ? <Empty msg="Nothing here." /> : (
              <ul className="space-y-2">
                {items.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => setActive(req)}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      active?.id === req.id
                        ? "border-yellow-400/40 bg-yellow-400/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">{req.request_type}</span>
                      <StatusBadge status={req.status} palette={STATUS_PALETTE} />
                    </div>
                    <div className="text-sm font-medium text-white">{req.title}</div>
                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                      <Clock size={10} /> {new Date(req.created_at).toLocaleString()}
                      <span>· by {req.requester_username || "—"}</span>
                    </div>
                  </button>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-3">
          {active ? (
            <DetailPane req={active} onAction={load} onClose={() => setActive(null)} />
          ) : (
            <Panel title="Select a request to view the chain" accent="text-sky-300">
              <Empty msg="Pick a request from the list to act on it." />
            </Panel>
          )}
        </div>
      </div>

      <AnimatePresence>
        {creating && (
          <NewRequestModal
            users={users}
            onClose={() => setCreating(false)}
            onSaved={() => { setCreating(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailPane({ req, onAction, onClose }) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function decide(action) {
    setBusy(true); setErr(null);
    try {
      await api.decideApproval(req.id, action, comment);
      setComment("");
      onAction();
    } catch (ex) {
      setErr(ex.message || "Action failed");
    } finally { setBusy(false); }
  }

  return (
    <Panel title={req.title} accent="text-yellow-300">
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={req.status} palette={STATUS_PALETTE} />
        <span className="text-[10px] uppercase tracking-wider text-gray-500">{req.request_type}</span>
        <button onClick={onClose} className="ml-auto text-gray-500 hover:text-white text-xs">close</button>
      </div>

      {req.description && (
        <p className="text-sm text-gray-300 bg-black/30 border border-white/5 rounded-lg p-3 mb-3">{req.description}</p>
      )}

      <div className="text-xs text-gray-400 mb-3">
        <div><b className="text-gray-300">Requester:</b> {req.requester_username}</div>
        {req.current_approver && (
          <div><b className="text-gray-300">Awaiting:</b> {req.current_approver.username} (step {req.current_step + 1} of {req.approver_chain.length})</div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Chain</div>
        <ol className="space-y-1.5">
          {(req.approver_chain || []).map((uid, idx) => {
            const step = req.steps?.find((s) => s.step_index === idx);
            const done = step?.action === "APPROVED";
            const rejected = step?.action === "REJECTED";
            const current = req.status === "PENDING" && idx === req.current_step;
            return (
              <li key={idx} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
                rejected ? "bg-red-500/10 border border-red-500/30"
                : done ? "bg-emerald-500/10 border border-emerald-500/30"
                : current ? "bg-yellow-400/10 border border-yellow-400/30"
                : "bg-white/5 border border-white/10"
              }`}>
                <span className="text-gray-500 w-5">{idx + 1}.</span>
                <span className="text-gray-200 flex-1">user #{uid}</span>
                {step && (
                  <span className="text-[10px] text-gray-400">
                    {step.action} {step.comment ? `· "${step.comment}"` : ""}
                  </span>
                )}
                {current && <span className="text-[10px] text-yellow-300 font-bold">PENDING</span>}
              </li>
            );
          })}
        </ol>
      </div>

      {req.status === "PENDING" && (
        <div className="rounded-lg border border-white/10 p-3 bg-black/30">
          {err && <ErrorBanner msg={err} />}
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment (optional)"
            className={modalInput}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              disabled={busy}
              onClick={() => decide("COMMENT")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-white/5 text-gray-300"
            >
              <MessageCircle size={12} /> Comment
            </button>
            <button
              disabled={busy}
              onClick={() => decide("REJECTED")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-red-500/20 text-red-200 border border-red-500/30"
            >
              <X size={12} /> Reject
            </button>
            <button
              disabled={busy}
              onClick={() => decide("APPROVED")}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-emerald-500/30 text-emerald-100 border border-emerald-500/40 font-bold"
            >
              <Check size={12} /> Approve
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function NewRequestModal({ users, onClose, onSaved }) {
  const [form, setForm] = useState({
    request_type: "DISCOUNT",
    title: "",
    description: "",
    approver_chain: [],
    payload_json: "{}",
  });
  const [err, setErr] = useState(null);

  function toggleApprover(id) {
    setForm((f) => ({
      ...f,
      approver_chain: f.approver_chain.includes(id)
        ? f.approver_chain.filter((x) => x !== id)
        : [...f.approver_chain, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    if (form.approver_chain.length === 0) {
      setErr("Add at least one approver.");
      return;
    }
    let payload = {};
    try { payload = form.payload_json.trim() ? JSON.parse(form.payload_json) : {}; }
    catch { setErr("Payload must be valid JSON."); return; }
    try {
      await api.createApproval({
        request_type: form.request_type,
        title: form.title,
        description: form.description,
        approver_chain: form.approver_chain,
        payload,
      });
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title="New approval request" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })} className={modalInput}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Title">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={modalInput} required />
        </Field>
        <Field label="Description" wide>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={modalInput} />
        </Field>
        <Field label="Approver chain (ordered — click to add/remove)" wide>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 p-2 grid grid-cols-2 gap-1 text-xs">
            {users.map((u) => {
              const idx = form.approver_chain.indexOf(u.id);
              const picked = idx >= 0;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleApprover(u.id)}
                  className={`text-left px-2 py-1 rounded flex items-center gap-2 ${
                    picked ? "bg-yellow-400/20 border border-yellow-400/40" : "hover:bg-white/5"
                  }`}
                >
                  {picked && <span className="w-4 text-center text-[10px] font-bold text-yellow-300">{idx + 1}.</span>}
                  <span className="text-gray-200 truncate flex-1">{u.username}</span>
                  <span className="text-gray-500 text-[10px]">{u.role}</span>
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Payload (JSON)" wide>
          <textarea rows={3} value={form.payload_json} onChange={(e) => setForm({ ...form, payload_json: e.target.value })} className={`${modalInput} font-mono text-xs`} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}
