// components/layout/Sidebar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAbility } from "@/hooks/useAbility";

// Lucide Icons
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Shield,
  KeyRound,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  UserCog,
} from "lucide-react";

// -------------------------
// MAIN MENU (EXCEPT USER MANAGEMENT)
// -------------------------
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, need: "dashboard.view" },
  { to: "/lead-importer", label: "Universities Importer", icon: GraduationCap, need: ["leads.bulk-import", "leads.bulk-comment-import"], any: true },
];

// -------------------------
// USER MANAGEMENT SUBMENU
// -------------------------
const USER_MANAGEMENT_ITEMS = [
  { to: "/users", label: "Users", icon: Users, need: "users.view" },
  { to: "/roles", label: "Roles", icon: Shield, need: "roles.view" },
  { to: "/permissions", label: "Permissions", icon: KeyRound, need: "roles.view" },
];

// -------------------------
// CONFIGURATION SUBMENU
// -------------------------
const CONFIG_CHILDREN = [
  { to: "/products", label: "Products", icon: Package, need: "products.view" },
  { to: "/sale-stages", label: "Sale Stages", icon: BarChart3, need: "stages.view" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { can } = useAbility();

  // States for collapsible menus
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  // -------------------------
  // FILTER ITEMS BY ABILITY
  // -------------------------
  const navItems = useMemo(
    () =>
      NAV_ITEMS.filter((it) =>
        it.any ? can(it.need, { any: true }) : can(it.need)
      ),
    [can]
  );

  const userManagementChildren = useMemo(
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

  // -------------------------
  // AUTO OPEN USER MANAGEMENT IF INSIDE
  // -------------------------
  const isUserChildActive = useMemo(
    () => userManagementChildren.some((c) => location.pathname.startsWith(c.to)),
    [userManagementChildren, location.pathname]
  );

  useEffect(() => {
    if (isUserChildActive) setUserMenuOpen(true);
  }, [isUserChildActive]);

  // -------------------------
  // AUTO OPEN CONFIG MENU IF ACTIVE
  // -------------------------
  const isConfigChildActive = useMemo(
    () => configurationChildren.some((c) => location.pathname.startsWith(c.to)),
    [configurationChildren, location.pathname]
  );

  useEffect(() => {
    if (isConfigChildActive) setConfigOpen(true);
  }, [isConfigChildActive]);

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const showConfig = configurationChildren.length > 0;
  const showUserManagement = userManagementChildren.length > 0;

  return (
    <>
      {/* Background Overlay for Mobile */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={`fixed md:static z-50 h-[calc(100dvh-56px)]
        top-14 left-0 w-64 bg-[var(--color-background)]
        border-r border-gray-200 transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <nav className="p-3 space-y-1">

          {/* MAIN MENU ITEMS */}
          {navItems.map((item) => {
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
                      : "text-gray-700 hover:bg-gray-100"
                    }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* -------------------------
              USER MANAGEMENT SECTION
          ------------------------- */}
          {showUserManagement && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                ${isUserChildActive
                  ? "bg-[#282560]/10 text-[#282560] font-medium"
                  : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span className="flex items-center gap-3">
                  <UserCog className="h-5 w-5" />
                  <span>User Management</span>
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* User Management Submenu */}
              <div
                className={`overflow-hidden transition-[max-height] duration-200 ${
                  userMenuOpen ? "max-h-40" : "max-h-0"
                }`}
              >
                <ul className="mt-1 pl-9 pr-2 space-y-1">
                  {userManagementChildren.map((child) => {
                    const Icon = child.icon;
                    return (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm
                            ${isActive
                              ? "bg-[#282560]/10 text-[#282560] font-medium"
                              : "text-gray-700 hover:bg-gray-100"}`}
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

          {/* -------------------------
              CONFIG SECTION
          ------------------------- */}
          {showConfig && (
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

              {/* Config submenu */}
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
                              : "text-gray-700 hover:bg-gray-100"}`}
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
