// src/components/layout/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext"; // ✅ import theme hook

export default function Header({ onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // ✅ use theme context

  // Close menu on outside click / Esc
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

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-background)] border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Mobile: sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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

        {/* Brand / Home */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/img/logo.png"
            alt="SAMS Backend"
            className="h-7 w-auto"
            loading="eager"
            decoding="async"
          />
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          {/* 🌗 Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-800"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3.1a1 1 0 0 1 1 1v1.44a1 1 0 1 1-2 0V4.1a1 1 0 0 1 1-1ZM5.6 5.6a1 1 0 0 1 1.4 0l1.02 1.02a1 1 0 0 1-1.42 1.42L5.6 7a1 1 0 0 1 0-1.4ZM12 6.9a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2ZM3.1 12a1 1 0 0 1 1-1h1.44a1 1 0 1 1 0 2H4.1a1 1 0 0 1-1-1Zm15.36-7.36a1 1 0 0 1 1.4 1.42L18.84 7a1 1 0 1 1-1.42-1.42l1.04-1.04ZM12 19.9a1 1 0 0 1-1-1v-1.44a1 1 0 1 1 2 0V18.9a1 1 0 0 1-1 1Zm6.36-2.54a1 1 0 0 1 1.42 1.42l-1.04 1.04a1 1 0 1 1-1.42-1.42l1.04-1.04ZM19.9 12a1 1 0 0 1 1-1h1.44a1 1 0 1 1 0 2H20.9a1 1 0 0 1-1-1Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-100"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.64 13a9 9 0 0 1-11.3-11.3A9 9 0 1 0 21.64 13Z" />
              </svg>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="user-menu"
            >
              <img
                src="https://i.pravatar.cc/40?img=1"
                alt="User avatar"
                className="h-8 w-8 rounded-full ring-1 ring-gray-200"
              />
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                id="user-menu"
                role="menu"
                aria-label="User menu"
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white dark:bg-gray-800 shadow-lg focus:outline-none"
              >
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Change Password
                  </Link>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white rounded-b-xl"
                    style={{ backgroundColor: "#282560" }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
