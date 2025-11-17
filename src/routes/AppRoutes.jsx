// src/routes/routes.js
import DashboardLayout from "@/layouts/DashboardLayout.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";

import Login from "@/pages/auth/Login.jsx";
import Dashboard from "@/pages/Dashboard.jsx";

// Users
import UserList from "@/pages/users/list.jsx";
import UserFormPage from "@/pages/users/form.jsx";

// Users
import LeadImporter from "@/pages/importer/leadImporter.jsx";

// Products
import ProductList from "@/pages/products/list.jsx";
import ProductFormPage from "@/pages/products/form.jsx";

// Lead Stages
import SaleStageList from "@/pages/sale_stages/list.jsx";
import SaleStageFormPage from "@/pages/sale_stages/form.jsx";

// Lead Stages
import MenuList from "@/pages/menu/list.jsx";
import MenuFormPage from "@/pages/menu/form.jsx";

import RoleEdit from "@/pages/roles/RoleEdit";
import RoleList from "@/pages/roles/RoleList";
import RoleCreate from "@/pages/roles/RoleCreate";

import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ChangePassword from "@/pages/auth/ChangePassword";

import PermissionList from "@/pages/permissions/List.jsx";
import PermissionForm from "@/pages/permissions/Form.jsx";


// Optional NotFound
import NotFound from "@/pages/NotFound.jsx";

export const appRoutes = [
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/change-password", element: <ChangePassword /> },
          { path: "/roles", element: <RoleList /> },
          { path: "/role-create", element: <RoleCreate /> },
          { path: "/role-edit/:id", element: <RoleEdit /> },

            // import-lead
          { path: "/lead-importer", element: <LeadImporter /> },

          // Users
          { path: "/users", element: <UserList /> },
          { path: "/users/new", element: <UserFormPage /> },
          { path: "/users/:id/edit", element: <UserFormPage /> },

          // Products
          { path: "/products", element: <ProductList /> },
          { path: "/products/new", element: <ProductFormPage /> },
          { path: "/products/:id/edit", element: <ProductFormPage /> },

          // Sale Stages
          { path: "/sale-stages", element: <SaleStageList /> },
          { path: "/sale-stages/new", element: <SaleStageFormPage /> },
          { path: "/sale-stages/:id/edit", element: <SaleStageFormPage /> },

          // menu
          { path: "/menus", element: <MenuList /> },
          { path: "/menus/new", element: <MenuFormPage /> },
          { path: "/menus/:id/edit", element: <MenuFormPage /> },

          { path: "/permissions", element: <PermissionList /> },
          { path: "/permissions/new", element: <PermissionForm /> },
          { path: "/permissions/:id/edit", element: <PermissionForm /> },
          
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> }, // fallback page
];
