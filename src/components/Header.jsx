import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ onToggleSidebar, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleLogout = () => {
    // optional external handler
    if (typeof onLogout === "function") onLogout();
    // default: navigate to login
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center">
          <img src="/img/logo.png" alt="CRM Backend" className="h-7 w-auto" />
          <span className="sr-only">CRM Backend</span>
        </Link>

        {/* Avatar + Menu */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="user-menu"
            style={{ outlineOffset: "2px" }}
          >
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="User menu"
              className="h-8 w-8 rounded-full"
            />
            <svg
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
            </svg>
          </button>

          {open && (
            <div
              ref={menuRef}
              id="user-menu"
              role="menu"
              aria-label="User menu"
              className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none"
            >
              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/change-password"
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  Change Password
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-white rounded-b-xl"
                  // brand color #282560
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
