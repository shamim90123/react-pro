import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, Lock, LogOut, User, Settings, ChevronDown, Bell } from "lucide-react";

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
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth() || {};

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && 
          !menuRef.current?.contains(e.target) && 
          !btnRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notificationsOpen && 
          !notificationsRef.current?.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen, notificationsOpen]);

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

  // Mock notifications data
  const notifications = [
    { id: 1, text: "New user registered", time: "5 min ago", unread: true },
    { id: 2, text: "System backup completed", time: "1 hour ago", unread: true },
    { id: 3, text: "Weekly report generated", time: "2 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200 
                     border border-transparent hover:border-gray-200/50
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group transition-all duration-200"
          >
            <div className="relative">
              <img
                src="/img/logo.png"
                alt="SAMS Backend"
                className="h-8 w-auto transition-transform group-hover:scale-105"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 leading-tight">
                SAMS Backend
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                Admin Portal
              </div>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-50/80 transition-all duration-200
                       border border-transparent hover:border-gray-200/50
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30
                       group"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white 
                               text-xs rounded-full flex items-center justify-center 
                               border-2 border-white font-medium animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 origin-top-right 
                            animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl 
                              shadow-xl ring-1 ring-black/5 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-50 last:border-b-0 
                                  hover:bg-gray-50/50 transition-colors cursor-pointer
                                  ${notification.unread ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 
                                        ${notification.unread ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-tight">
                              {notification.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100/80">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 
                                     font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200
                       border border-transparent hover:border-gray-200/50 hover:bg-gray-50/80
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="user-menu"
            >
              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName} avatar`}
                    className="h-8 w-8 rounded-full ring-2 ring-white/80 
                             group-hover:ring-blue-100 transition-all duration-200 object-cover
                             shadow-sm group-hover:shadow-md"
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                             text-white flex items-center justify-center text-sm font-semibold
                             ring-2 ring-white/80 group-hover:ring-blue-100 transition-all duration-200
                             shadow-sm group-hover:shadow-md"
                  >
                    {getInitials(displayName)}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full 
                              border-2 border-white bg-emerald-500" />
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[120px]">
                  {roleLabel || "User"}
                </div>
              </div>

              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 
                          group-hover:text-gray-600 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                ref={menuRef}
                id="user-menu"
                className="absolute right-0 top-full mt-2 w-72 origin-top-right 
                         animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl 
                              shadow-xl ring-1 ring-black/5 overflow-hidden">
                  {/* Profile Header */}
                  <div className="relative bg-gradient-to-br from-blue-50/50 via-white to-gray-50/50 
                                border-b border-gray-100/80 p-6">
                    <div className="flex items-center gap-4">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${displayName} avatar`}
                          className="h-12 w-12 rounded-full ring-2 ring-white/80 
                                   shadow-md object-cover"
                        />
                      ) : (
                        <div
                          className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                   text-white flex items-center justify-center text-base font-semibold
                                   ring-2 ring-white/80 shadow-md"
                        >
                          {getInitials(displayName)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {displayName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {displayEmail}
                        </p>
                        {roleLabel && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full 
                                           text-xs font-medium bg-blue-100 text-blue-700 
                                           border border-blue-200/60">
                              {roleLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 
                               hover:bg-gray-50/80 transition-all duration-200 
                               focus:outline-none focus:bg-gray-50/80 group"
                    >
                      <User className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 
                               hover:bg-gray-50/80 transition-all duration-200 
                               focus:outline-none focus:bg-gray-50/80 group"
                    >
                      <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/change-password"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 
                               hover:bg-gray-50/80 transition-all duration-200 
                               focus:outline-none focus:bg-gray-50/80 group"
                    >
                      <Lock className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                      <span>Change Password</span>
                    </Link>

                    <div className="h-px bg-gray-200/60 my-2" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm 
                               text-red-600 hover:bg-red-50/80 transition-all duration-200 
                               focus:outline-none focus:bg-red-50/80 group"
                    >
                      <LogOut className="h-4 w-4 group-hover:text-red-700" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}