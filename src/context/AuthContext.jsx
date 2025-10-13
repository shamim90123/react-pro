// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "@/lib/token";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [hydrating, setHydrating] = useState(true); // ⬅️ only for initial hydrate

  useEffect(() => {
    const saved = tokenStore.get();
    if (saved) setToken(saved);
    setHydrating(false);
  }, []);

  const login = async ({ token: newToken, remember = false, me = null }) => {
    tokenStore.set(newToken, remember);
    setToken(newToken);
    setUser(me);
  };

  const logout = () => {
    tokenStore.clear();
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, login, logout, hydrating }),
    [token, user, hydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
