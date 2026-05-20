import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api.js";
import { getIndustry, INDUSTRIES } from "../lib/industries.js";

const IndustryContext = createContext(null);

/**
 * IndustryContext — owns the active industry preset and broadcasts a `dataVersion`
 * counter that consuming pages can watch in their useEffect deps to re-pull
 * after a switch.
 */
export function IndustryProvider({ children }) {
  const [industryId, setIndustryId] = useState(() => api.getIndustryId());
  const [dataVersion, setDataVersion] = useState(0);

  // Re-sync if storage was reset elsewhere.
  useEffect(() => { setIndustryId(api.getIndustryId()); }, []);

  const switchTo = useCallback((id) => {
    if (id === industryId) {
      api.regenerateData();
    } else {
      api.switchIndustry(id);
      setIndustryId(id);
    }
    setDataVersion((v) => v + 1);
  }, [industryId]);

  const regenerate = useCallback(() => {
    api.regenerateData();
    setDataVersion((v) => v + 1);
  }, []);

  const bumpVersion = useCallback(() => setDataVersion((v) => v + 1), []);

  const industry = getIndustry(industryId);

  return (
    <IndustryContext.Provider value={{
      industry,
      industryId,
      industries: INDUSTRIES,
      dataVersion,
      switchTo,
      regenerate,
      bumpVersion,
    }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error("useIndustry must be used inside <IndustryProvider>");
  return ctx;
}
