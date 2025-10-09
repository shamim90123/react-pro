import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import LeadList from "./pages/leads/list.jsx";
import LeadFormPage from "./pages/leads/form.jsx";
import UserList from "./pages/users/list.jsx";
import UserFormPage from "./pages/users/form.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<App />} />

      {/* Protected layout (Header + Sidebar always visible) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lead-list" element={<LeadList />} />
        <Route path="/leads/new" element={<LeadFormPage />} />
        <Route path="/leads/:id/edit" element={<LeadFormPage />} />
        {/* <Route path="*" element={<Navigate to="/leads" replace />} /> */}

        <Route path="/user-list" element={<UserList />} />
        <Route path="/user/new" element={<UserFormPage />} />
        <Route path="/user/:id/edit" element={<UserFormPage />} />

      </Route>
    </Routes>
  </BrowserRouter>
);
