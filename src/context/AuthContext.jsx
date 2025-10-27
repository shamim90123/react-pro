// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "@/services/token";
import api from "@/services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(true); // ⬅️ only for initial hydrate
  const USER_KEY = "auth_user";

  useEffect(() => {
    const saved = tokenStore.get();
    if (saved) setToken(saved);
    // hydrate user (if saved)
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
   } catch {}
    setHydrating(false);
  }, []);

  const login = async ({ token: newToken, remember = false, me = null }) => {
    tokenStore.set(newToken, remember);
    setToken(newToken);
    setUser(me);
     if (me) localStorage.setItem(USER_KEY, JSON.stringify(me));
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, login, logout, hydrating }),
    [token, user, hydrating]
  );

  // (Optional) keep axios auth header in sync
  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
 }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
