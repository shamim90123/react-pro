// src/pages/leads/table/LeadTable.jsx
import RowLoading from "./RowLoading";
import LeadRow from "./LeadRow";

export default function LeadTable({
  loading,
  leads,
  users,
  usersLoading,
  assigning,
  onAssignAM,
  onOpenDetails,
  onViewLead,
  onEditLead,
  onOpenContacts,
  onOpenNotes,
  onDeleteLead,
  onQuickFormSubmit, // NEW
  page = 1,
  pageSize = 10,
  onChangeStatus,
}) {
  const hasLeads = (leads || []).length > 0;

  return (
    <div className="relative overflow-x-auto overflow-y-visible rounded-lg border border-gray-200 bg-white shadow-sm">

    {/* <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"> */}
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3">SL</th>
            <th className="px-6 py-3">Account Manager</th>
            <th className="px-6 py-3">University Name</th>
            <th className="px-6 py-3">Contacts</th>
            <th className="px-6 py-3">Notes</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <RowLoading colSpan={7} />
          ) : hasLeads ? (
            leads.map((lead, i) => (
              <LeadRow
                key={lead.id ?? i}
                index={(page - 1) * pageSize + i}
                // index={i}
                lead={lead}
                users={users}
                usersLoading={usersLoading}
                assigning={assigning}
                onAssignAM={onAssignAM}
                onOpenDetails={onOpenDetails}
                onViewLead={onViewLead}
                onEditLead={onEditLead}
                onOpenContacts={onOpenContacts}   // ← forward
                onOpenNotes={onOpenNotes}         // ← forward
                onDeleteLead={onDeleteLead}
                onQuickFormSubmit={onQuickFormSubmit} // NEW
                onChangeStatus={onChangeStatus}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                No leads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
