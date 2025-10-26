// src/pages/leads/table/LeadRow.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import AccountManagerCell from "../AccountManagerCell";
import LeadActions from "../LeadActions";
import InlineLeadProductMatrix from "./InlineLeadProductMatrix";

function StatusPill({ value }) {
  if (value == 1)
    return (
      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
        Active
      </span>
    );
  if (value == 2)
    return (
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        On Hold
      </span>
    );
  return (
    <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
      Inactive
    </span>
  );
}

export default function LeadRow({
  index,
  lead,
  users,
  usersLoading,
  assigning,
  onAssignAM,
  onOpenDetails,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onQuickFormSubmit,
  // ✅ NEW
  onChangeStatus,
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  // --- status dropdown state ---
  const [stOpen, setStOpen] = useState(false);
  const stBtnRef = useRef(null);
  const stMenuRef = useRef(null);

  useEffect(() => {
    if (!stOpen) return;
    const onDown = (e) => {
      const t = e.target;
      if (stBtnRef.current?.contains(t)) return;
      if (stMenuRef.current?.contains(t)) return;
      setStOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setStOpen(false);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onEsc);
    };
  }, [stOpen]);

  const handlePick = async (val) => {
    if (val === lead.status) {
      setStOpen(false);
      return;
    }
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

        {/* University Name + City -> now toggles expander */}
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
            <span className="ml-auto text-xs text-gray-400">
              {expanded ? "Hide" : ""}
            </span>
          </button>
        </td>

        {/* Contacts */}
        <td className="px-6 py-3">
          <button
            className="text-indigo-600 underline-offset-2 hover:underline disabled:text-gray-400"
            onClick={() => onOpenDetails(lead, "contacts")}
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
            onClick={() => onOpenDetails(lead, "notes")}
            disabled={!lead.notes_count}
            title="View notes"
          >
            {lead.notes_count ?? "—"}
          </button>
        </td>

        {/* Status (clickable pill with dropdown) */}
        <td className="relative px-6 py-3">
          <button
            ref={stBtnRef}
            type="button"
            onClick={() => setStOpen((v) => !v)}
            className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
            title="Change status"
          >
            <StatusPill value={lead.status} />
          </button>

          {stOpen && (
            <div
              ref={stMenuRef}
              className="absolute z-[1000] mt-2 w-40 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
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
            </div>
          )}
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

      {/* Expander Row */}
      {expanded && (
        <tr className="bg-indigo-50/40">
          {/* SL + AM + Name + Contacts + Notes + Status + Actions = 7 columns */}
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
