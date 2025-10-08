import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import LeadList from "./pages/leads/list.jsx";
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
      </Route>
    </Routes>
  </BrowserRouter>
);
