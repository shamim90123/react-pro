// src/router/PublicOnlyRoute.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicOnlyRoute() {
  const { token, hydrating } = useAuth();
  if (hydrating) return <div className="flex h-screen items-center justify-center">Loading…</div>;
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
