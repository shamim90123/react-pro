import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { Routes, Route } from "react-router-dom";

function Overview() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Leads</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">128</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Active Campaigns</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">6</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Conversion</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">4.7%</div>
        </div>
      </div>
    </div>
  );
}

const Placeholder = ({ title }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <p className="text-gray-600 mt-2">This is a placeholder section.</p>
  </div>
);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="leads" element={<Placeholder title="Leads" />} />
            <Route path="campaigns" element={<Placeholder title="Campaigns" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
