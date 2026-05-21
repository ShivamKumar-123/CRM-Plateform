/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStore.getAccess());
  const [username, setUsername] = useState(() => localStorage.getItem("crm_username") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bootstrap: if a token exists, hydrate `user` from /api/me/.
  useEffect(() => {
    if (isAuthenticated) {
      api.getMe()
        .then(setUser)
        .catch(() => logout());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(uname, password, otp) {
    setLoading(true);
    try {
      const data = await api.login(uname, password, otp);
      tokenStore.set(data.access, data.refresh);
      localStorage.setItem("crm_username", uname);
      setUsername(uname);
      setIsAuthenticated(true);

      try {
        const me = await api.getMe();
        setUser(me);
      } catch {
        /* ignore — protected pages will retry */
      }

      return { ok: true };
    } catch (err) {
      // Detect 2FA challenge — server returns 401 with `requires_2fa: true`
      const requires2fa = err?.data?.requires_2fa === true;
      return {
        ok: false,
        requires2fa,
        error: err.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    tokenStore.clear();
    localStorage.removeItem("crm_username");
    setUsername("");
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
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
