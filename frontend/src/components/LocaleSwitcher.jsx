import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLocale } from "../context/LocaleContext.jsx";

export default function LocaleSwitcher({ compact = false }) {
  const { locale, setLocale, locales } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg hover:bg-white/5 text-gray-300 ${compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"}`}
        title="Change language"
      >
        <Globe size={compact ? 12 : 14} />
        {!compact && <span>{current.flag} {current.label}</span>}
        <ChevronDown size={compact ? 11 : 13} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg bg-gray-950 border border-white/10 shadow-xl overflow-hidden z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 ${
                l.code === locale ? "bg-white/5 text-yellow-300" : "text-gray-200"
              }`}
            >
              <span>{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {l.code === locale && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
