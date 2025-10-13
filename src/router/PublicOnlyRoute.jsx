// src/router/PublicOnlyRoute.jsx (new file)
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicOnlyRoute() {
  const { token, loading } = useAuth();
  if (loading) return null; // or a loader
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
