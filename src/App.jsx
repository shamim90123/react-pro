// src/App.jsx
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import ProtectedRoute from "@/router/ProtectedRoute";
import Login from "@/pages/auth/Login";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Dashboard from "./Dashboard.jsx";
import LeadList from "./pages/leads/list.jsx";
import LeadFormPage from "./pages/leads/form.jsx";
import UserList from "./pages/users/list.jsx";
import UserFormPage from "./pages/users/form.jsx";

function getToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
}

// ⬇️ Inline guard so you can continue
function PublicOnlyRoute() {
  const token = getToken();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lead-list" element={<LeadList />} />
          <Route path="/leads/new" element={<LeadFormPage />} />
          <Route path="/leads/:id/edit" element={<LeadFormPage />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/user/new" element={<UserFormPage />} />
          <Route path="/user/:id/edit" element={<UserFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
