// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
  const { token, hydrating } = useAuth();
  const location = useLocation();

  if (hydrating) return <div className="flex h-screen items-center justify-center">Checking session…</div>;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
