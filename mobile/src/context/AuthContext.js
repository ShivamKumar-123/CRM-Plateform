import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const access = await tokenStore.getAccess();
      const uname = await tokenStore.getUsername();
      if (access) {
        setIsAuthenticated(true);
        setUsername(uname || "");
        // Best-effort hydration of full profile
        try {
          const me = await api.getMe();
          setUser(me);
        } catch (_) {
          // 401 — refresh might recover, AuthContext re-uses tokens via refresh flow
          api.refresh().catch(() => logout());
        }
      }
      setBootstrapping(false);
    })();
  }, []);

  async function login(uname, password, otp) {
    setLoading(true);
    try {
      const data = await api.login(uname, password, otp);
      await tokenStore.set({
        access: data.access,
        refresh: data.refresh,
        username: uname,
      });
      setUsername(uname);
      setIsAuthenticated(true);

      // Hydrate full profile
      try {
        const me = await api.getMe();
        setUser(me);
      } catch (_) {
        /* protected screens will retry on their own */
      }

      return { ok: true };
    } catch (err) {
      // Detect 2FA challenge — server returns 401 with detail.requires_2fa = true
      const requires2fa =
        err?.data?.detail?.requires_2fa === true ||
        err?.data?.detail?.requires_2fa === "True" ||
        err?.data?.requires_2fa === true;
      return {
        ok: false,
        requires2fa,
        error: err?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await tokenStore.clear();
    setUsername("");
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        bootstrapping,
        isAuthenticated,
        username,
        user,
        organization: user?.organization || null,
        isSuperUser: !!user?.is_superuser,
        isStaff: !!user?.is_staff,
        role: user?.role,
        loading,
        login,
        logout,
      }}
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
