import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, AlertTriangle } from "lucide-react";
import { API_URL } from "../../lib/api.js";

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/public/forms/${slug}/`)
      .then((r) => r.json())
      .then((d) => { setForm(d); if (d.error) setErr(d.error); })
      .catch((e) => setErr(e.message));
  }, [slug]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const r = await fetch(`${API_URL}/api/public/forms/${slug}/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || "Submission failed"); return; }
      setSubmitted(data);
      if (data.redirect_url) setTimeout(() => { window.location.href = data.redirect_url; }, 1500);
    } catch (ex) { setErr(ex.message); }
  }

  if (err) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center"><AlertTriangle className="text-red-400 mx-auto mb-2" /><div className="text-sm text-red-300">{err}</div></div>
    </div>;
  }
  if (!form) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-sm text-gray-400">Loading…</div>;

  if (submitted) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-emerald-400/20 border border-emerald-400/40 mx-auto mb-4 flex items-center justify-center">
          <Check className="text-emerald-300" size={32} />
        </div>
        <h1 className="text-xl font-bold mb-2">Thank you!</h1>
        <p className="text-sm text-gray-400">{submitted.message}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl bg-white/[0.03] border border-white/10">
        <h1 className="text-2xl font-bold mb-1">{form.name}</h1>
        {form.description && <p className="text-sm text-gray-400 mb-6">{form.description}</p>}
        <form onSubmit={submit} className="space-y-3">
          {(form.fields_detail || []).map((f) => (
            <div key={f.field_key}>
              <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">
                {f.label}{f.is_required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {f.field_type === "textarea" ? (
                <textarea required={f.is_required} placeholder={f.placeholder}
                  value={values[f.field_key] || ""}
                  onChange={(e) => setValues({ ...values, [f.field_key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
              ) : f.field_type === "select" ? (
                <select required={f.is_required} value={values[f.field_key] || ""}
                  onChange={(e) => setValues({ ...values, [f.field_key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                  <option value="">—</option>
                  {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.field_type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-gray-200">
                  <input type="checkbox" checked={!!values[f.field_key]}
                    onChange={(e) => setValues({ ...values, [f.field_key]: e.target.checked })} />
                  {f.placeholder || f.label}
                </label>
              ) : (
                <input required={f.is_required} type={f.field_type === "email" ? "email" : f.field_type === "number" ? "number" : f.field_type === "date" ? "date" : f.field_type === "phone" ? "tel" : "text"}
                  placeholder={f.placeholder}
                  value={values[f.field_key] || ""}
                  onChange={(e) => setValues({ ...values, [f.field_key]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40" />
              )}
              {f.help_text && <div className="text-[11px] text-gray-500 mt-1">{f.help_text}</div>}
            </div>
          ))}
          <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
