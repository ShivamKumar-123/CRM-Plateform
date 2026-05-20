// Lightweight i18n — no external dependency. A central dictionary + a `t()`
// function that does dotted-path lookup with parameter interpolation. Locale
// is persisted to localStorage and exposed via LocaleContext.

import en from "./en.js";
import hi from "./hi.js";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी",    flag: "🇮🇳" },
];

const DICTS = { en, hi };

const FALLBACK = "en";

function dig(obj, path) {
  return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
}

export function translate(locale, key, params = {}) {
  const dict = DICTS[locale] || DICTS[FALLBACK];
  let value = dig(dict, key);
  if (value == null) value = dig(DICTS[FALLBACK], key);
  if (value == null) return key;  // surface untranslated keys
  return String(value).replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`));
}
