import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function LeadActions({
  lead,
  handleViewLead,
  handleEditLead,
  handleDeleteLead,
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const toggle = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    setOpen((o) => !o);
  };

  // Close on outside click/escape/scroll/resize — but ignore clicks inside menu
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      const t = e.target;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return; // <-- key fix: don't close when clicking menu
      setOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);

    // pointerdown feels snappier and avoids onClick race
    window.addEventListener("pointerdown", handleOutside, true);
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", () => setOpen(false), true);
    window.addEventListener("resize", () => setOpen(false));

    return () => {
      window.removeEventListener("pointerdown", handleOutside, true);
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", () => setOpen(false), true);
      window.removeEventListener("resize", () => setOpen(false));
    };
  }, [open]);

  const IconDots = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );

  return (
    <>
      {/* Action button */}
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // if your <tr> has onClick
          toggle();
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <IconDots />
        <span className="sr-only">Open actions</span>
      </button>

      {/* Dropdown via portal */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="z-[9999] w-40 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()} // guard against row handlers
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                handleViewLead?.(lead?.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              👁️ View
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                handleEditLead?.(lead?.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                handleDeleteLead?.(lead?.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑️ Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
