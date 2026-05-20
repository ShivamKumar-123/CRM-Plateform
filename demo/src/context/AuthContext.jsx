import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { db } from "../lib/db.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure storage is initialized, then restore session if any.
  useEffect(() => {
    db.init();
    setUser(api.me());
    setBootstrapped(true);
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const u = await api.login({ email, password });
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  async function signup(data) {
    setLoading(true);
    try {
      const u = await api.signup(data);
      setUser(u);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  function resetDemo() {
    db.reset();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        bootstrapped,
        loading,
        login,
        signup,
        logout,
        resetDemo,
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
