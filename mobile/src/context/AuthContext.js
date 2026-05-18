import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const access = await tokenStore.getAccess();
      const uname = await tokenStore.getUsername();
      if (access) {
        setIsAuthenticated(true);
        setUsername(uname || "");
        api.refresh().catch(() => {});
      }
      setBootstrapping(false);
    })();
  }, []);

  async function login(uname, password) {
    setLoading(true);
    try {
      const data = await api.login(uname, password);
      await tokenStore.set({
        access: data.access,
        refresh: data.refresh,
        username: uname,
      });
      setUsername(uname);
      setIsAuthenticated(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await tokenStore.clear();
    setUsername("");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{ bootstrapping, isAuthenticated, username, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
