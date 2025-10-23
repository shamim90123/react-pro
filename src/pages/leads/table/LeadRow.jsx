// src/pages/leads/table/LeadRow.jsx
import { useState, useCallback } from "react";
import AccountManagerCell from "../AccountManagerCell";
import LeadActions from "../LeadActions";
import InlineLeadProductMatrix from "./InlineLeadProductMatrix";

export default function LeadRow({
  index,
  lead,
  users,
  usersLoading,
  assigning,
  onAssignAM,
  onOpenDetails,
  onViewLead,     // still available for other entry points
  onEditLead,
  onDeleteLead,
  onQuickFormSubmit, // optional { leadId, productId, stageId } => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

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
        <td
          className="px-6 py-3 font-medium text-gray-900"
        >
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
              <span className="text-xs text-gray-500">
                {lead?.city || "—"}
              </span>
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

        {/* status */}
        <td className="px-6 py-3">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            {/* 1 active, 2 hold, 0 inactive */}
            {lead.status == 1
              ? "Active"
              : lead.status == 2
              ? "On Hold"
              : "Inactive"}
          </span>
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
          {/* SL + AM + Name + Contacts + Notes + Actions = 6 columns */}
          <td colSpan={6} className="px-6 py-4">
            <InlineLeadProductMatrix
              lead={lead}                 // pass object (for defaults)
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
