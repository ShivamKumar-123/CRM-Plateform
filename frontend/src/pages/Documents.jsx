import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, RefreshCw, Search, Upload, Trash2, Download,
  Loader2, AlertTriangle, Filter,
} from "lucide-react";
import { api } from "../lib/api.js";

const DOC_TYPES = [
  { value: "", label: "All types" },
  { value: "AADHAAR", label: "Aadhaar" },
  { value: "PAN", label: "PAN" },
  { value: "ADDRESS_PROOF", label: "Address Proof" },
  { value: "INCOME_PROOF", label: "Income Proof" },
  { value: "PASSBOOK", label: "Passbook" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INVOICE", label: "Invoice" },
  { value: "OTHER", label: "Other" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const load = () => {
    setLoading(true); setErr("");
    Promise.all([
      api.getDocuments(),
      api.getLeads().catch(() => ({ leads: [] })),
    ])
      .then(([docsData, leadsData]) => {
        const dList = Array.isArray(docsData) ? docsData : (docsData?.results || []);
        setDocs(dList);
        setLeads(leadsData?.leads || []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter((d) => {
      if (typeFilter && d.document_type !== typeFilter) return false;
      if (!q) return true;
      return (
        (d.name || "").toLowerCase().includes(q) ||
        (d.phone || "").includes(search) ||
        (d.document_type || "").toLowerCase().includes(q)
      );
    });
  }, [docs, search, typeFilter]);

  const remove = async (id) => {
    if (!confirm("Delete this document?")) return;
    try { await api.deleteDocument(id); load(); }
    catch (ex) { alert(ex.message); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen">
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <FileText size={20} className="text-black" />
            </span>
            Documents
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Contracts, KYC, proofs — attached to your leads.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-2"
          >
            <Upload size={14} /> Upload
          </button>
          <button onClick={load}
            className="p-2.5 rounded-xl bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lead name, phone, or doc type…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-yellow-400/50 outline-none"
          />
        </div>
        <div className="inline-flex items-center gap-2">
          <Filter size={12} className="text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white"
          >
            {DOC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {err && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> {err}
        </div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">
              {docs.length === 0 ? "No documents uploaded yet." : "No documents match this filter."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400">Type</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400">Lead</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400">Uploaded</th>
                <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <FileText size={14} className="text-yellow-400" />
                      <span className="text-white font-medium">{d.document_type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{d.name || `#${d.lead}`}</td>
                  <td className="px-4 py-3 text-gray-400">{d.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {d.document_file && (
                        <a
                          href={d.document_file}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 hover:bg-sky-500/20"
                          title="Open"
                        >
                          <Download size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => remove(d.id)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {showUpload && (
        <UploadModal leads={leads} onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); load(); }} />
      )}
    </div>
  );
}

function UploadModal({ leads, onClose, onUploaded }) {
  const [leadId, setLeadId] = useState("");
  const [docType, setDocType] = useState("AADHAAR");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!leadId || !file) { setErr("Select a lead and a file."); return; }
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("lead", leadId);
      fd.append("document_type", docType);
      fd.append("document_file", file);
      await api.uploadDocument(fd);
      onUploaded();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-yellow-400/20 p-6 shadow-[0_20px_80px_rgba(250,204,21,0.15)]">
        <h3 className="text-xl font-bold text-white mb-5">Upload Document</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
              required
            >
              <option value="">Select lead…</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>#{l.id} — {l.name} ({l.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Document type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-white"
            >
              {DOC_TYPES.slice(1).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">File (PDF / JPG / PNG)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-black file:font-semibold file:cursor-pointer"
              required
            />
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={busy}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {busy ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
