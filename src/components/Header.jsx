// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Header({ onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const { logout /*, user */ } = useAuth(); // user optional if you want to show name/email

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
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    // Clear auth context/session and redirect
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Mobile: sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar"
          aria-controls="app-sidebar"
          aria-expanded="false"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
          <span className="sr-only">SAMS Backend</span>
        </Link>

        {/* Right cluster: user menu */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="user-menu"
          >
            {/* Optional: show user name/email if available */}
            {/* <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{user?.name}</span>
              <span className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</span>
            </div> */}
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="User avatar"
              className="h-8 w-8 rounded-full ring-1 ring-gray-200"
            />
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
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
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none"
            >
              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/change-password"
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Change Password
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  role="menuitem"
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
    </header>
  );
}
