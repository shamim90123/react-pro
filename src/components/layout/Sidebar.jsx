// components/layout/Sidebar.jsx
import { NavLink, useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/leads", label: "Leads", icon: "📇" },
  { to: "/users", label: "Users", icon: "👥" },
];

const configurationChildren = [
  { to: "/products", label: "Product Setup", icon: "🛠️" },
  { to: "/lead-stages", label: "Lead Stages", icon: "📊" },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [configOpen, setConfigOpen] = useState(false);

  // Auto-expand Configuration if a child route is active
  const isConfigChildActive = useMemo(
    () => configurationChildren.some((c) => location.pathname.startsWith(c.to)),
    [location.pathname]
  );

  useEffect(() => {
    if (isConfigChildActive) setConfigOpen(true);
  }, [isConfigChildActive]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* overlay (mobile) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={`fixed md:static z-50 md:z-30 h-[calc(100dvh-56px)] md:h-[calc(100dvh-56px)]
        top-14 md:top-auto left-0 w-64 
        bg-[var(--color-background)] border-r border-gray-200 dark:border-gray-700
        transform transition-transform md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Nav */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                 ${isActive
                  ? "bg-[#282560]/10 text-[#282560] font-medium"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Configuration (parent) */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setConfigOpen((v) => !v)}
              aria-expanded={configOpen}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                ${isConfigChildActive ? "bg-[#282560]/10 text-[#282560] font-medium" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">⚙️</span>
                <span>Configuration</span>
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${configOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>

            {/* Submenu */}
            <div
              className={`overflow-hidden transition-[max-height] duration-200 ${
                configOpen ? "max-h-40" : "max-h-0"
              }`}
            >
              <ul className="mt-1 pl-9 pr-2 space-y-1">
                {configurationChildren.map((child) => (
                  <li key={child.to}>
                    <NavLink
                      to={child.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-md text-sm
                        ${isActive ? "bg-[#282560]/10 text-[#282560] font-medium" : "text-gray-700 hover:bg-gray-100"}`
                      }
                    >
                      <span className="text-sm">{child.icon}</span>
                      <span>{child.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
