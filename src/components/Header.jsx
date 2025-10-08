import { Link } from "react-router-dom";

export default function Header({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="h-14 px-4 flex items-center justify-between">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" fill="currentColor">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </button>

        {/* Logo from public/img */}
        <Link to="/dashboard" className="flex items-center">
          <img
            src="/img/logo.png"           // or /img/logo.png
            alt="CRM Backend"
            className="h-7 md:h-7 w-auto"
          />
          <span className="sr-only">CRM Backend</span>
        </Link>

        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40?img=1"
            alt="user"
            className="h-8 w-8 rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
