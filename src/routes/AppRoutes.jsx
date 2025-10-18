// src/routes/routes.js
import DashboardLayout from "@/layouts/DashboardLayout.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";

import Login from "@/pages/auth/Login.jsx";
import Dashboard from "@/pages/Dashboard.jsx";

// Leads
import LeadList from "@/pages/leads/LeadList.jsx";
import LeadContactPage from "@/pages/leads/LeadContact.jsx";

// Users
import UserList from "@/pages/users/list.jsx";
import UserFormPage from "@/pages/users/form.jsx";

// Products
import ProductList from "@/pages/products/list.jsx";
import ProductFormPage from "@/pages/products/form.jsx";

// Lead Stages
import LeadStageList from "@/pages/lead_stages/list.jsx";
import LeadStageFormPage from "@/pages/lead_stages/form.jsx";

// Optional NotFound
import NotFound from "@/pages/NotFound.jsx";

export const appRoutes = [
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },

          // Leads
          { path: "/leads", element: <LeadList /> },
          { path: "/leads/:id/edit", element: <LeadContactPage /> },

          // Users
          { path: "/users", element: <UserList /> },
          { path: "/users/new", element: <UserFormPage /> },
          { path: "/users/:id/edit", element: <UserFormPage /> },

          // Products
          { path: "/products", element: <ProductList /> },
          { path: "/products/new", element: <ProductFormPage /> },
          { path: "/products/:id/edit", element: <ProductFormPage /> },

          // Lead Stages
          { path: "/lead-stages", element: <LeadStageList /> },
          { path: "/lead-stages/new", element: <LeadStageFormPage /> },
          { path: "/lead-stages/:id/edit", element: <LeadStageFormPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> }, // fallback page
];
