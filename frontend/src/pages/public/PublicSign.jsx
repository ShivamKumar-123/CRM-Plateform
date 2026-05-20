import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useParams } from "react-router-dom";
import { PenTool, AlertTriangle, Check, Mail } from "lucide-react";
import { API_URL } from "../../lib/api.js";

export default function PublicSign() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [otpSent, setOtpSent] = useState(null);
  const [otp, setOtp] = useState("");
  const [signed, setSigned] = useState(false);
  const sigPadRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/public/sign/${token}/`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setErr(d.error); else setData(d); })
      .catch((e) => setErr(e.message));
  }, [token]);

  async function action(payload) {
    const r = await fetch(`${API_URL}/api/public/sign/${token}/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error || "action failed"); return null; }
    return j;
  }

  async function sendOtp() {
    const r = await action({ action: "send_otp" });
    if (r) setOtpSent(r);
  }

  async function sign() {
    if (!otp) { setErr("Enter the OTP first."); return; }
    const dataUrl = sigPadRef.current?.toDataURL();
    if (!dataUrl) { setErr("Draw your signature."); return; }
    const r = await action({ action: "verify_and_sign", otp, signature_image: dataUrl });
    if (r?.ok) setSigned(true);
  }

  async function decline() {
    const reason = prompt("Reason (optional)?") || "";
    const r = await action({ action: "decline", reason });
    if (r?.ok) setErr("You declined to sign.");
  }

  if (err && !data) return <Center><AlertTriangle className="text-red-400" /> <div className="text-sm text-red-300 mt-2">{err}</div></Center>;
  if (!data) return <Center><div className="text-sm text-gray-400">Loading…</div></Center>;
  if (signed) return <Center>
    <Check className="text-emerald-400" size={48} />
    <div className="text-xl font-bold mt-3">Signed!</div>
    <div className="text-sm text-gray-400 mt-1">Thank you. A signed copy has been sent to you.</div>
  </Center>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-1">
          <PenTool className="text-yellow-400" />
          <h1 className="text-xl font-bold">{data.request.title}</h1>
        </div>
        <p className="text-sm text-gray-400 mb-5">Signing as <b className="text-gray-200">{data.signer.name}</b> &lt;{data.signer.email}&gt;</p>

        {data.document_url && (
          <iframe title="document" src={data.document_url} className="w-full h-72 rounded-lg border border-white/10 mb-4 bg-white" />
        )}

        {err && <div className="text-sm text-red-300 mb-3 flex items-center gap-2"><AlertTriangle size={13} /> {err}</div>}

        {!otpSent ? (
          <button onClick={sendOtp} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">
            <Mail size={14} className="inline mr-2" /> Send me an OTP to sign
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-400">
              OTP sent. {otpSent.otp_demo && <span className="text-yellow-300 font-mono">(demo OTP: {otpSent.otp_demo})</span>}
            </div>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-lg text-center tracking-widest" />
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Draw signature</label>
              <SignaturePad ref={sigPadRef} />
            </div>
            <div className="flex gap-2">
              <button onClick={decline} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-300 text-sm">Decline</button>
              <button onClick={sign} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm">Sign</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Center({ children }) {
  return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6"><div className="text-center">{children}</div></div>;
}

const SignaturePad = forwardRef(function SignaturePad(_, ref) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png"),
    clear: () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    },
  }));

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = c.offsetWidth;
    c.height = 140;
    const ctx = c.getContext("2d");
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    function pos(e) {
      const r = c.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function start(e) { drawingRef.current = true; ctx.beginPath(); ctx.moveTo(...pos(e)); }
    function move(e) { if (!drawingRef.current) return; ctx.lineTo(...pos(e)); ctx.stroke(); e.preventDefault?.(); }
    function end() { drawingRef.current = false; }
    c.addEventListener("mousedown", start); c.addEventListener("mousemove", move);
    c.addEventListener("mouseup", end); c.addEventListener("mouseleave", end);
    c.addEventListener("touchstart", start); c.addEventListener("touchmove", move); c.addEventListener("touchend", end);
    return () => {
      c.removeEventListener("mousedown", start); c.removeEventListener("mousemove", move);
      c.removeEventListener("mouseup", end); c.removeEventListener("mouseleave", end);
      c.removeEventListener("touchstart", start); c.removeEventListener("touchmove", move); c.removeEventListener("touchend", end);
    };
  }, []);

  function clear() {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  }

  return (
    <div className="rounded-lg bg-white/5 border border-white/10">
      <canvas ref={canvasRef} className="w-full block touch-none" />
      <button type="button" onClick={clear} className="text-[10px] text-gray-400 px-2 py-1">Clear</button>
    </div>
  );
});
