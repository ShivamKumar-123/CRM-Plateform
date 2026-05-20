import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty } from "./_shared.jsx";

export default function AdminAI() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can summarize leads, draft follow-ups, or score deal risk. Ask anything." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { api.getAiRequests().then(setRequests).catch(() => {}); }, []);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || busy) return;
    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setErr(null);
    try {
      const res = await api.aiChat(next);
      setMessages([...next, { role: "assistant", content: res.reply, provider: res.provider }]);
      api.getAiRequests().then(setRequests).catch(() => {});
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-400" /> AI assistant
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          OpenAI / Anthropic powered. Set <code className="text-yellow-300">OPENAI_API_KEY</code> or{" "}
          <code className="text-yellow-300">ANTHROPIC_API_KEY</code> in your backend <code>.env</code> — otherwise stub mode runs.
        </p>
      </header>

      {err && <ErrorBanner msg={err} />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel title="Chat" accent="text-yellow-300">
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-3 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  m.role === "user"
                    ? "bg-sky-400/10 border border-sky-400/20 ml-12"
                    : "bg-white/5 border border-white/10 mr-12"
                }`}>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 flex justify-between">
                    <span>{m.role === "user" ? "You" : "AI"}</span>
                    {m.provider && <span>· {m.provider}</span>}
                  </div>
                  <div className="text-sm text-gray-200">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
              />
              <button onClick={send} disabled={busy} className="px-4 rounded-lg bg-yellow-400 text-black font-bold disabled:opacity-50">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </Panel>
        </div>

        <div>
          <Panel title={<><History size={12} className="inline mr-1" /> Recent AI requests</>} accent="text-sky-300">
            {requests.length === 0 ? <Empty msg="No AI requests yet." /> : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {requests.slice(0, 30).map((r) => (
                  <div key={r.id} className="p-2 rounded bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-yellow-300 flex justify-between">
                      <span>{r.kind}</span><span>{r.provider}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{r.prompt}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{r.tokens_used} tokens · {new Date(r.created_at).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
