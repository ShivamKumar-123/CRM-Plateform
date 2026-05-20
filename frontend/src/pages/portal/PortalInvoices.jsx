import { useEffect, useState } from "react";
import { IndianRupee, Download } from "lucide-react";
import { api, API_URL } from "../../lib/api.js";
import { portalAuth } from "./PortalLayout.jsx";

const STATUS_COLORS = {
  PAID: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  PENDING: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  FAILED: "bg-red-400/15 text-red-300 border-red-400/30",
  CANCELLED: "bg-gray-400/15 text-gray-300 border-gray-400/30",
};

export default function PortalInvoices() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const t = portalAuth.get();
    api.portal.invoices(t).then(setItems).catch((e) => setErr(e.message));
  }, []);

  function download(inv) {
    fetch(`${API_URL}/api/billing/invoices/${inv.id}/pdf/`, {
      headers: { Authorization: `Portal ${portalAuth.get()}` },
    })
      .then((r) => r.ok ? r.blob() : Promise.reject(new Error(`status ${r.status}`)))
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `invoice_${inv.id}.pdf`;
        a.click();
      })
      .catch((e) => alert(`Download failed: ${e.message}`));
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-6">
        <IndianRupee className="text-yellow-400" /> Invoices
      </h1>

      {err && <div className="text-sm text-red-300 mb-4">{err}</div>}

      {items.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">No invoices yet.</div>
      ) : (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Period</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-xs">#{inv.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {inv.billing_period_start} → {inv.billing_period_end}
                  </td>
                  <td className="px-4 py-3 font-semibold">₹ {Number(inv.amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[inv.status] || ""}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => download(inv)} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-300">
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
