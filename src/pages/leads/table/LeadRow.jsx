import AccountManagerCell from "../AccountManagerCell";
import LeadActions from "../LeadActions";

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
}) {
  return (
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

      {/* University Name + City */}
      <td
        className="cursor-pointer px-6 py-3 font-medium text-gray-900"
        onClick={() => onViewLead(lead.id)}
      >
        <div className="flex items-center gap-3">
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
            <span className="font-medium text-gray-900">
              {lead?.lead_name}
            </span>
            <span className="text-xs text-gray-500">
              {lead?.city || "—"}
            </span>
          </div>
        </div>
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

      {/* Actions */}
      <td className="space-x-2 px-6 py-3 text-right">
        <LeadActions
          lead={lead}
          handleViewLead={() => onViewLead(lead.id)}
          handleEditLead={() => onEditLead(lead.id)}
          handleDeleteLead={() => onDeleteLead(lead.id)}
        />
      </td>
    </tr>
  );
}
