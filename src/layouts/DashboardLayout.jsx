// src/router/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function getToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    ""
  );
}

// 🟢 Protected routes (require login)
export default function ProtectedRoute({ allowed }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

// 🟣 Public-only routes (login/register etc.)
// Exported separately — make sure this is below the default export
export function PublicOnlyRoute() {
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    "";
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
