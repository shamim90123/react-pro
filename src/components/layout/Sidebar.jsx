// components/layout/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAbility } from "@/hooks/useAbility";

// Lucide Icons
import {
  LayoutDashboard,
  Database,
  Users,
  Shield,
  KeyRound,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  Users2,
} from "lucide-react";

/* -----------------------------
   MAIN MENU + USER MANAGEMENT
------------------------------ */

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, need: "dashboard.view" },

  // Updated icon for Data Importer
  { to: "/lead-importer", label: "Data Importer", icon: Database, need: ["leads.bulk-import", "leads.bulk-comment-import"], any: true },
];

/* -----------------------------
   USER MANAGEMENT SUBMENU
------------------------------ */

const USER_MANAGEMENT_ITEMS = [
  { to: "/users", label: "Users", icon: Users2, need: "users.view" },
  { to: "/roles", label: "Roles", icon: Shield, need: "roles.view" },
  { to: "/permissions", label: "Permissions", icon: KeyRound, need: "roles.view" },
];

/* -----------------------------
   CONFIGURATION SUBMENU
------------------------------ */

const CONFIG_CHILDREN = [
  { to: "/menus", label: "Menu", icon: Package, need: "products.view" },
  { to: "/products", label: "Products", icon: Package, need: "products.view" },
  { to: "/sale-stages", label: "Sale Stages", icon: BarChart3, need: "stages.view" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [configOpen, setConfigOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { can } = useAbility();

  /* -----------------------------
      FILTER PERMISSION ITEMS
  ------------------------------ */

  const mainItems = useMemo(
    () => NAV_ITEMS.filter((it) =>
      it.any ? can(it.need, { any: true }) : can(it.need)
    ),
    [can]
  );

  const userManagementItems = useMemo(
    () =>
      USER_MANAGEMENT_ITEMS.filter((it) =>
        it.any ? can(it.need, { any: true }) : can(it.need)
      ),
    [can]
  );

  const configurationChildren = useMemo(
    () =>
      CONFIG_CHILDREN.filter((it) =>
        it.any ? can(it.need, { any: true }) : can(it.need)
      ),
    [can]
  );

  /* -----------------------------
      AUTO EXPAND MENUS ON ACTIVE
  ------------------------------ */

  const isUserMenuActive = userManagementItems.some((c) =>
    location.pathname.startsWith(c.to)
  );

  const isConfigChildActive = configurationChildren.some((c) =>
    location.pathname.startsWith(c.to)
  );

  useEffect(() => {
    if (isUserMenuActive) setUserMenuOpen(true);
  }, [isUserMenuActive]);

  useEffect(() => {
    if (isConfigChildActive) setConfigOpen(true);
  }, [isConfigChildActive]);

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40 md:hidden" />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static z-50 h-[calc(100dvh-56px)]
        top-14 left-0 w-64 bg-[var(--color-background)]
        border-r border-gray-200 transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <nav className="p-3 space-y-1">

          {/* MAIN MENU */}
          {mainItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                   ${isActive
                    ? "bg-[#282560]/10 text-[#282560] font-medium"
                    : "text-gray-700 hover:bg-gray-100"}`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* USER MANAGEMENT SECTION */}
          {userManagementItems.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${isUserMenuActive
                      ? "bg-[#282560]/10 text-[#282560] font-medium"
                      : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span className="flex items-center gap-3">
                  <Users2 className="h-5 w-5" />
                  <span>User Management</span>
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-[max-height] duration-200 ${
                  userMenuOpen ? "max-h-40" : "max-h-0"
                }`}
              >
                <ul className="mt-1 pl-9 pr-2 space-y-1">
                  {userManagementItems.map((child) => {
                    const Icon = child.icon;
                    return (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm
                             ${isActive
                              ? "bg-[#282560]/10 text-[#282560] font-medium"
                              : "text-gray-700 hover:bg-gray-100"}`
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* CONFIGURATION SECTION */}
          {configurationChildren.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setConfigOpen((v) => !v)}
                aria-expanded={configOpen}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                  ${isConfigChildActive
                    ? "bg-[#282560]/10 text-[#282560] font-medium"
                    : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Configuration</span>
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${configOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-[max-height] duration-200 ${
                  configOpen ? "max-h-40" : "max-h-0"
                }`}
              >
                <ul className="mt-1 pl-9 pr-2 space-y-1">
                  {configurationChildren.map((child) => {
                    const Icon = child.icon;
                    return (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm
                             ${isActive
                              ? "bg-[#282560]/10 text-[#282560] font-medium"
                              : "text-gray-700 hover:bg-gray-100"}`
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
