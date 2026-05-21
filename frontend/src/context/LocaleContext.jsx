/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translate, SUPPORTED_LOCALES } from "../i18n/index.js";

const LocaleContext = createContext(null);
const STORAGE_KEY = "crm_locale";

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  const setLocale = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLocaleState(code);
    document.documentElement.lang = code;
  }, []);

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  const t = useCallback((key, params) => translate(locale, key, params), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, locales: SUPPORTED_LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

export function useT() {
  return useLocale().t;
}
