import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, statusCopy } from "../data/i18n.js";

const AppContext = createContext(null);

function readStoredAuth() {
  const token = localStorage.getItem("ensany_token");
  const user = localStorage.getItem("ensany_user");
  if (!token || !user) return null;

  try {
    return { token, user: JSON.parse(user) };
  } catch {
    localStorage.removeItem("ensany_token");
    localStorage.removeItem("ensany_user");
    return null;
  }
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("ensany_lang") || "en");
  const [auth, setAuth] = useState(readStoredAuth);
  const dict = dictionaries[lang] ?? dictionaries.en;

  const value = useMemo(() => ({
    auth,
    setAuth,
    lang,
    setLang,
    t: dict,
    statusLabel: (status) => statusCopy[lang]?.[status] ?? status?.replaceAll("_", " "),
  }), [auth, dict, lang]);

  useEffect(() => {
    localStorage.setItem("ensany_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
