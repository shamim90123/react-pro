import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// --------------------- Helper Functions ---------------------
function getInitials(nameLike) {
  if (!nameLike) return "U";
  const parts = String(nameLike).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}

function nameFromUser(user) {
  if (!user) return "";
  if (user.name) return user.name;
  if (user.full_name) return user.full_name;
  if (user.first_name || user.last_name)
    return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  if (user.username) return user.username;
  if (user.email) return user.email.split("@")[0];
  return "";
}

function prettyRoleName(name = "") {
  return String(name)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

function roleNamesFromUser(user) {
  const fromArray = Array.isArray(user?.roles)
    ? user.roles.map((r) => r?.name).filter(Boolean)
    : [];
  if (fromArray.length) return fromArray;
  if (user?.primary_role) return [user.primary_role];
  return [];
}

// --------------------- Component ---------------------
export default function Header({ onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const firstItemRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth() || {};
  const { theme } = useTheme();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  // Simple keyboard navigation inside dropdown
  useEffect(() => {
    const onKey = (e) => {
      if (!menuOpen || !menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]')
      );
      if (!items.length) return;

      const idx = items.findIndex((el) => el === document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(idx + 1 + items.length) % items.length];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[(idx - 1 + items.length) % items.length];
        prev?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Focus first item when menu opens
  useEffect(() => {
    if (menuOpen) setTimeout(() => firstItemRef.current?.focus(), 30);
  }, [menuOpen]);

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  // --------------------- Derived Data ---------------------
  const computedName = nameFromUser(user);
  const displayName = computedName || "User";
  const displayEmail = user?.email || user?.username || "";
  const avatarUrl = user?.avatar || "";
  const roleNames = roleNamesFromUser(user);
  const roleLabel = roleNames.map(prettyRoleName).join(", ");

  // --------------------- JSX ---------------------
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-background)] border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Sidebar Toggle (Mobile) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/img/logo.png"
            alt="SAMS Backend"
            className="h-7 w-auto"
            loading="eager"
            decoding="async"
          />
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="group flex items-center gap-2 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="user-menu"
            >
              {/* Avatar or Initials */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  className="h-8 w-8 rounded-full ring-1 ring-gray-200 transition group-hover:ring-indigo-300 object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="h-8 w-8 rounded-full ring-1 ring-gray-200 bg-indigo-600 text-white grid place-items-center text-xs font-semibold"
                  title={displayName}
                >
                  {getInitials(displayName)}
                </div>
              )}

              {/* Optional inline role badge */}
              {roleLabel && (
                <span className="hidden sm:inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                  {roleNames.length === 1
                    ? prettyRoleName(roleNames[0])
                    : "Roles"}
                </span>
              )}

              {/* Caret */}
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 z-50 mt-2 w-72 origin-top-right transition-all duration-150 ${
                menuOpen
                  ? "scale-100 opacity-100 translate-y-0"
                  : "pointer-events-none scale-95 opacity-0 -translate-y-1"
              }`}
            >
              {/* caret */}
              <div className="absolute -top-2 right-6 h-3 w-3 rotate-45 rounded-sm bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />

              <div
                ref={menuRef}
                id="user-menu"
                role="menu"
                aria-label="User menu"
                className="overflow-hidden rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/5"
              >
                {/* Profile Header */}
                <div className="relative border-b border-gray-100">
                  <div className="h-12 bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50" />
                  <div className="px-4 pb-3 -mt-6 flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${displayName} avatar`}
                        className="h-12 w-12 rounded-full border border-white shadow-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full border border-white shadow-md bg-indigo-600 text-white grid place-items-center text-sm font-semibold">
                        {getInitials(displayName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {displayName}
                        </p>
                        {roleLabel && (
                          <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                            {roleLabel}
                          </span>
                        )}
                      </div>
                      {!!displayEmail && (
                        <p className="truncate text-xs text-gray-500">
                          {displayEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/change-password"
                    role="menuitem"
                    ref={firstItemRef}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    tabIndex={0}
                  >
                    <span aria-hidden>🔒</span>
                    Change Password
                  </Link>

                  <Link
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    tabIndex={1}
                  >
                    <span aria-hidden>🚪</span>
                    Logout
                  </Link>
                </div>

              </div>
            </div>
          </div>
          {/* End user dropdown */}
        </div>
      </div>
    </header>
  );
}
