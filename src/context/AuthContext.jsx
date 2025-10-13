// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = "crm_auth_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || null;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async ({ token, remember, me }) => {
    // store token based on remember
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, token);
    if (!remember) localStorage.removeItem(STORAGE_KEY);
    setToken(token);
    setUser(me ?? null);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, setUser, login, logout, loading, setLoading }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
