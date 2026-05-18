import { useEffect, useState } from "react";
import { IndianRupee, Check, FileText, CreditCard, RefreshCw } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Panel, formatINR } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";
import { StubNotice } from "./AdminAutomation.jsx";

export default function AdminBilling() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getPlans(),
      api.getSubscription().catch(() => null),
      api.getInvoices(),
    ]).then(([p, s, i]) => {
      setPlans(p || []);
      setSubscription(s);
      setInvoices(i || []);
    }).catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const subscribe = async (slug) => {
    if (!confirm(`Subscribe to ${slug}? (stub — won't charge)`)) return;
    try {
      await api.subscribe(slug);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Billing"
        subtitle={subscription ? `Active plan: ${subscription.plan_name} (${subscription.status})` : "No subscription"}
        onRefresh={load}
        refreshing={loading}
        accent={IndianRupee}
      />

      <StubNotice
        feature="Razorpay subscriptions"
        detail="Plans + invoices persist. Real Razorpay checkout requires RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in .env + payment webhook handler."
      />

      {error && <ErrorBanner msg={error} />}

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isActive = subscription?.plan === p.id;
          return (
            <div key={p.id} className={`relative rounded-2xl p-6 flex flex-col ${
              p.slug === "pro"
                ? "bg-gradient-to-b from-yellow-500/20 to-transparent border-2 border-yellow-400/40"
                : "bg-white/[0.04] border border-white/10"
            }`}>
              {p.slug === "pro" && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-bold">POPULAR</span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="my-4">
                <span className="text-3xl font-black">{formatINR(p.price_monthly_inr)}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-5 flex-1 text-sm">
                {(p.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300">
                    <Check size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(p.slug)}
                disabled={isActive}
                className={`py-2.5 rounded-xl font-semibold ${
                  isActive
                    ? "bg-emerald-400/20 text-emerald-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-[1.02]"
                }`}
              >
                {isActive ? "Current plan" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <Panel title={`Invoices (${invoices.length})`} accent="text-emerald-300" full>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-yellow-300 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-right">{formatINR(inv.amount)}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-[10px] bg-yellow-400/20 text-yellow-300">{inv.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{inv.due_date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
