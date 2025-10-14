// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/router/ProtectedRoute";
import PublicOnlyRoute from "@/router/PublicOnlyRoute";
import Login from "@/pages/auth/Login";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Dashboard from "./Dashboard.jsx";
import LeadList from "./pages/leads/list.jsx";
import LeadFormPage from "./pages/leads/form.jsx";
import UserList from "./pages/users/list.jsx";
import UserFormPage from "./pages/users/form.jsx";
import ProductList from "./pages/products/list.jsx";
import ProductFormPage from "./pages/products/form.jsx";
import LeadStageList from "./pages/lead_stages/list.jsx";
import LeadStageFormPage from "./pages/lead_stages/form.jsx";


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
          {/* product setup route */}
          <Route path="/product-setup" element={<ProductList />} />
          <Route path="/product/new" element={<ProductFormPage />} />
          <Route path="/product/:id/edit" element={<ProductFormPage />} />

          <Route path="/lead-stages" element={<LeadStageList />} />
          <Route path="/lead-stage/new" element={<LeadStageFormPage />} />
          <Route path="/lead-stage/:id/edit" element={<LeadStageFormPage />} />

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
