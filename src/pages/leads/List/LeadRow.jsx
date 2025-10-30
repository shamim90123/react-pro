// src/pages/leads/table/LeadRow.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import AccountManagerCell from "./AccountManagerCell";
import LeadActions from "./LeadActions";
import InlineLeadProductMatrix from "./InlineLeadProductMatrix";

function StatusPill({ value }) {
  const base =
    "inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap";

  if (value == 1)
    return <span className={`${base} bg-blue-100 text-blue-800`}>Active</span>;

  if (value == 2)
    return <span className={`${base} bg-amber-100 text-amber-800`}>On Hold</span>;

  return <span className={`${base} bg-gray-200 text-gray-700`}>Inactive</span>;
}


export default function LeadRow({
  index,
  lead,
  users,
  usersLoading,
  assigning,
  onOpenContacts,
  onOpenNotes,
  onAssignAM,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onQuickFormSubmit,
  onChangeStatus,
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  // --- status dropdown state ---
  const [stOpen, setStOpen] = useState(false);
  const stBtnRef = useRef(null);
  const stMenuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 160 });

  const calcAndSetPos = useCallback(() => {
    const btn = stBtnRef.current;
    const menu = stMenuRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const menuWidth = 160; // w-40
    const gap = 8;

    // Start with below the button (viewport coords; no scrollX/Y here)
    let left = r.left;
    let top = r.bottom + gap;

    // Clamp horizontally inside viewport
    left = Math.min(
      Math.max(8, left),
      window.innerWidth - menuWidth - 8
    );

    // If we know menu height, flip above if needed
    const menuH = menu ? menu.offsetHeight : 0;
    if (menuH && top + menuH > window.innerHeight - 8) {
      const aboveTop = r.top - gap - menuH;
      if (aboveTop >= 8) {
        top = aboveTop;
      }
    }

    setPos({ top, left, width: menuWidth });
  }, []);


 useEffect(() => {
  if (!stOpen) return;

  // First pass: position using default guess
  calcAndSetPos();

  // Second pass: measure actual menu height and adjust (next frame)
  const raf = requestAnimationFrame(() => calcAndSetPos());

  const onDown = (e) => {
    const t = e.target;
    if (stBtnRef.current?.contains(t)) return;
    if (stMenuRef.current?.contains(t)) return;
    setStOpen(false);
  };
  const onKey = (e) => e.key === "Escape" && setStOpen(false);
  const onScroll = () => calcAndSetPos();
  const onResize = () => calcAndSetPos();

  window.addEventListener("pointerdown", onDown, true);
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onResize);
  };
}, [stOpen, calcAndSetPos]);

  const handlePick = async (val) => {
    if (val === lead.status) return setStOpen(false);
    await onChangeStatus?.(lead.id, val);
    setStOpen(false);
  };

  return (
    <>
      <tr className="border-b border-gray-100 bg-white hover:bg-gray-50">
        {/* SL */}
        <td className="px-4 py-3 text-gray-600">{index + 1}</td>

        {/* Account Manager */}
        <AccountManagerCell
          lead={lead}
          users={users}
          usersLoading={usersLoading}
          assigning={assigning}
          handleAssignAccountManager={onAssignAM}
        />

        {/* University */}
        <td className="px-6 py-3 font-medium text-gray-900">
          <button
            type="button"
            onClick={toggle}
            className="group flex w-full items-center gap-3 text-left"
            title="Quick edit (product & sales stage)"
          >
            <img
              src={`/flags/1x1/${lead?.destination?.iso_3166_2?.toLowerCase() || "unknown"}.svg`}
              alt={lead?.destination?.name || "Flag"}
              title={lead?.destination?.name || ""}
              className="h-5 w-5 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/no-img.png";
              }}
            />
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-gray-900 group-hover:underline">
                {lead?.lead_name}
              </span>
              <span className="text-xs text-gray-500">{lead?.city || "—"}</span>
            </div>
            <span className="ml-auto text-xs text-gray-400">{expanded ? "Hide" : ""}</span>
          </button>
        </td>

        {/* Contacts */}

        <td className="px-6 py-3">
          <button
            className="text-indigo-600 underline-offset-2 hover:underline disabled:text-gray-400"
            onClick={() => onOpenContacts?.(lead)}   // optional chaining prevents crash
            disabled={!lead.contacts_count}
            title="View contacts"
          >
            {lead.contacts_count ?? "—"}
          </button>
        </td>

        {/* Notes */}
        <td className="px-6 py-3">
          <button
            className="text-indigo-600 underline-offset-2 hover:underline disabled:text-gray-400"
            onClick={() => onOpenNotes(lead)}
            disabled={!lead.notes_count}
            title="View notes"
          >
            {lead.notes_count ?? "—"}
          </button>
        </td>

        {/* Status (pill + portal menu) */}
        <td className="relative px-6 py-3">
          <button
            ref={stBtnRef}
            type="button"
            onClick={() => setStOpen((v) => !v)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Change status"
          >
            <StatusPill value={lead.status} />
          </button>
        </td>

        {/* Actions */}
        <td className="space-x-2 px-6 py-3 text-right">
          <LeadActions
            lead={lead}
            handleViewLead={() => onViewLead?.(lead.id)}
            handleEditLead={() => onEditLead?.(lead.id)}
            handleDeleteLead={() => onDeleteLead?.(lead.id)}
          />
        </td>
      </tr>

      {/* Portal menu */}
      {stOpen &&
        createPortal(
          <div
            ref={stMenuRef}
            style={{
              position: "fixed",
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: `${pos.width}px`,
              zIndex: 1000,
            }}
            className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
          >
            <button
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                lead.status == 1 ? "text-blue-700 font-semibold" : "text-gray-800"
              }`}
              onClick={() => handlePick(1)}
            >
              Active
            </button>
            <button
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                lead.status == 2 ? "text-amber-700 font-semibold" : "text-gray-800"
              }`}
              onClick={() => handlePick(2)}
            >
              On Hold
            </button>
            <button
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                lead.status == 0 ? "text-gray-700 font-semibold" : "text-gray-800"
              }`}
              onClick={() => handlePick(0)}
            >
              Inactive
            </button>
          </div>,
          document.body
        )}

      {/* Expander Row */}
      {expanded && (
        <tr className=" bg-slate-300">
          <td colSpan={7} className="px-6 py-4">
            <InlineLeadProductMatrix
              lead={lead}
              users={users}
              onClose={() => setExpanded(false)}
              onSubmit={onQuickFormSubmit}
            />
          </td>
        </tr>
      )}
    </>
  );
}
