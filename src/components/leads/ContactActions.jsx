// ContactActions.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ContactActions({
  contact,
  rowIndex,
  onEdit,
  onMakePrimary,
  onDelete,
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

  useEffect(() => {
    if (!open) return;

    const onOutside = (e) => {
      const t = e.target;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);

    window.addEventListener("pointerdown", onOutside, true);
    window.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", () => setOpen(false), true);
    window.addEventListener("resize", () => setOpen(false));
    return () => {
      window.removeEventListener("pointerdown", onOutside, true);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", () => setOpen(false), true);
      window.removeEventListener("resize", () => setOpen(false));
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {/* three dots icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
        <span className="sr-only">Open actions</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="z-[9999] w-44 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {Number(contact?.is_primary) !== 1 && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onMakePrimary?.(contact);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              >
                ⭐ Make Primary
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onEdit?.(rowIndex);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
            >
              ✏️ Edit
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDelete?.(contact);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              🗑️ Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
