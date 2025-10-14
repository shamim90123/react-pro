import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/lead-list", label: "Leads", icon: "📇" },
  { to: "/user-list", label: "Users", icon: "📇" },
  // product setup menu 
  { to: "/product-setup", label: "Product Setup", icon: "🛠️" },
  // { to: "/dashboard/campaigns", label: "Campaigns", icon: "✉️" },
  // { to: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* overlay (mobile) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static z-40 h-full md:h-[calc(100dvh-56px)] top-0 md:top-auto left-0 w-64 bg-white border-r border-gray-200
        transform transition-transform md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-14 md:hidden" /> {/* spacer under sticky header on mobile */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                 ${isActive ? "bg-[#282560]/10 text-[#282560] font-medium" : "text-gray-700 hover:bg-gray-100"}`
              }
              onClick={onClose}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
