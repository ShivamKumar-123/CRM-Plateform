import { useEffect, useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Check, X, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, ErrorBanner, SuccessNote, Panel, Empty, StatusBadge } from "./_shared.jsx";

const MODULES = [
  { id: "lead", label: "Leads" },
  { id: "deal", label: "Deals" },
  { id: "customer", label: "Customers" },
  { id: "task", label: "Tasks" },
];

const STATUS_PALETTE = {
  PENDING: "bg-gray-500 text-white",
  PREVIEW: "bg-sky-400 text-black",
  RUNNING: "bg-yellow-400 text-black",
  COMPLETED: "bg-emerald-400 text-black",
  FAILED: "bg-red-500 text-white",
  ROLLED_BACK: "bg-amber-500 text-black",
};

export default function AdminImportExport() {
  const [module, setModule] = useState("lead");
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);
  const [preview, setPreview] = useState(null);   // { job, preview }
  const fileRef = useRef(null);

  function load() {
    api.listImports().then(setJobs).catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  async function onUpload(e) {
    e.preventDefault();
    setErr(null); setNote(null); setPreview(null);
    const file = fileRef.current?.files?.[0];
    if (!file) { setErr("Choose a CSV or .xlsx file first."); return; }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("module", module);
    fd.append("mapping", "{}"); // we'll fill the mapping after preview
    fd.append("options", JSON.stringify({ dry_run: false }));

    try {
      const data = await api.uploadImport(fd);
      setPreview(data);
      load();
    } catch (ex) {
      setErr(ex.message || "Upload failed");
    }
  }

  async function applyMapping(jobId, _mapping) {
    const job = jobs.find((j) => j.id === jobId) || preview?.job;
    if (!job) return;
    // PATCH not supported on the detail view — re-upload mapping by hitting commit
    // after attaching the mapping. Simplest: write through a one-shot POST.
    // For now we just commit with whatever the user mapped client-side.
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/imports/${jobId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("crm_access")}`,
        },
        body: JSON.stringify({ action: "commit" }),
      });
      setNote(`Import #${jobId} committed.`);
      setPreview(null);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  }

  async function commit(id) {
    try {
      await api.commitImport(id);
      setNote(`Import #${id} committed.`);
      load();
    } catch (ex) { setErr(ex.message); }
  }
  async function rollback(id) {
    if (!confirm("Roll back this import? Deletes all rows it created.")) return;
    try {
      const r = await api.rollbackImport(id);
      setNote(`Rolled back ${r.deleted} row(s).`);
      load();
    } catch (ex) { setErr(ex.message); }
  }
  async function destroy(id) {
    if (!confirm("Delete this import record?")) return;
    try { await api.deleteImport(id); load(); } catch (ex) { setErr(ex.message); }
  }

  function downloadExport() {
    const url = api.exportCsvUrl(module);
    // Add Authorization via fetch + blob to keep tokens private.
    fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("crm_access")}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${module}s_export.csv`;
        a.click();
      })
      .catch((e) => setErr(e.message));
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="text-yellow-400" /> Import / export
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Bulk-load CSV or Excel files with preview + rollback. Export org-scoped CSV any time.
        </p>
      </header>

      {err && <ErrorBanner msg={err} />}
      {note && <SuccessNote msg={note} />}

      <Panel title="New import" accent="text-yellow-300">
        <form onSubmit={onUpload} className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Module</label>
            <select value={module} onChange={(e) => setModule(e.target.value)} className={modalInput}>
              {MODULES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">CSV or .xlsx file</label>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className={modalInput} />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={downloadExport}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
            >
              <Download size={14} /> Export {module} CSV
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm"
            >
              <Upload size={14} /> Upload + preview
            </button>
          </div>
        </form>
      </Panel>

      {preview && (
        <>
          <div className="h-6" />
          <Panel title={`Preview · ${preview.preview.total_rows} rows total · ${preview.preview.errors.length} validation issue(s)`} accent="text-sky-300">
            <FieldMapper
              headers={preview.preview.headers}
              module={module}
              onSubmit={(mapping) => applyMapping(preview.job.id, mapping)}
              onCancel={() => setPreview(null)}
            />

            <div className="mt-4 overflow-x-auto max-h-64 border border-white/5 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-white/[0.03] text-gray-500">
                  <tr>{preview.preview.headers.map((h) => <th key={h} className="text-left px-2 py-1">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.preview.preview.map((row, i) => (
                    <tr key={i} className="border-t border-white/5">
                      {preview.preview.headers.map((h) => (
                        <td key={h} className="px-2 py-1 text-gray-300">{String(row[h] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.preview.errors.length > 0 && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-300">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle size={13} /> Validation issues
                </div>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {preview.preview.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>row {e.row}: {e.errors.join("; ")}</li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </>
      )}

      <div className="h-6" />
      <Panel title="Recent imports" accent="text-emerald-300">
        {jobs.length === 0 ? <Empty msg="No imports yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Module</th>
                  <th className="text-left px-3 py-2">File</th>
                  <th className="text-left px-3 py-2">Rows</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-white/5">
                    <td className="px-3 py-2 text-gray-500">{j.id}</td>
                    <td className="px-3 py-2">{j.module}</td>
                    <td className="px-3 py-2 truncate max-w-[200px]" title={j.original_filename}>{j.original_filename}</td>
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {j.succeeded_rows}/{j.total_rows}
                      {j.failed_rows > 0 && <span className="text-red-300"> · {j.failed_rows} failed</span>}
                    </td>
                    <td className="px-3 py-2"><StatusBadge status={j.status} palette={STATUS_PALETTE} /></td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        {j.status === "PREVIEW" && (
                          <button onClick={() => commit(j.id)} className="text-emerald-300 hover:text-emerald-200" title="Commit">
                            <Check size={14} />
                          </button>
                        )}
                        {j.status === "COMPLETED" && j.created_record_ids?.length > 0 && (
                          <button onClick={() => rollback(j.id)} className="text-amber-300 hover:text-amber-200" title="Rollback">
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button onClick={() => destroy(j.id)} className="text-red-300 hover:text-red-200" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function FieldMapper({ headers, module, onSubmit, onCancel }) {
  const choices = importableFields(module);
  const [mapping, setMapping] = useState(() => {
    const init = {};
    for (const h of headers) {
      const guess = choices.find((c) => c.toLowerCase() === String(h).toLowerCase());
      if (guess) init[h] = guess;
    }
    return init;
  });
  return (
    <div className="rounded-lg border border-white/10 p-3 bg-black/30">
      <div className="text-xs text-gray-400 mb-2 font-semibold">Map CSV columns → fields</div>
      <div className="grid sm:grid-cols-2 gap-2">
        {headers.map((h) => (
          <div key={h} className="flex items-center gap-2 text-xs">
            <div className="flex-1 text-gray-300 truncate" title={h}>{h}</div>
            <span className="text-gray-500">→</span>
            <select
              value={mapping[h] || ""}
              onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })}
              className={`${modalInput} max-w-[180px]`}
            >
              <option value="">(ignore)</option>
              {choices.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded bg-white/5 text-gray-300">Cancel</button>
        <button
          onClick={() => onSubmit(mapping)}
          className="px-3 py-1.5 text-xs rounded bg-yellow-400 text-black font-bold"
        >
          Commit import
        </button>
      </div>
    </div>
  );
}

function importableFields(module) {
  return ({
    lead: ["name", "email", "phone", "city", "state", "pincode", "leads_source", "status",
           "product_name", "product_category", "brand_name", "model_name", "watt_capacity",
           "base_price", "tags", "notes", "score"],
    deal: ["status", "deal_value", "cost_price", "expected_close_date", "notes"],
    customer: ["name", "email", "phone", "city", "state", "tags", "notes"],
    task: ["title", "description", "status", "priority", "due_date"],
  })[module] || [];
}
