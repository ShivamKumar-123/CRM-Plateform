import { useEffect, useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { api } from "../../lib/api.js";
import { portalAuth } from "./PortalLayout.jsx";

export default function PortalDocuments() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const t = portalAuth.get();
    api.portal.documents(t).then(setItems).catch((e) => setErr(e.message));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-6">
        <FileText className="text-yellow-400" /> Documents
      </h1>

      {err && <div className="text-sm text-red-300 mb-4">{err}</div>}

      {items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">No documents shared yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((d) => (
            <a
              key={d.id}
              href={d.file}
              target="_blank"
              rel="noreferrer"
              className="block p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/30 transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText size={16} className="text-yellow-400" />
                <ExternalLink size={12} className="text-gray-500 group-hover:text-yellow-300" />
              </div>
              <div className="text-sm font-semibold truncate" title={d.document_type || ""}>{d.document_type || "Document"}</div>
              <div className="text-[11px] text-gray-500 mt-1">{(d.uploaded_at || d.created_at) ? new Date(d.uploaded_at || d.created_at).toLocaleDateString() : "—"}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
