import { useNavigate } from "react-router-dom";
import LeadForm from "./LeadForm";
import LeadDetailsModal from "./LeadListModal";
import LeadTable from "./table/LeadTable";
import { useLeads } from "./hooks/useLeads";
import { LeadsApi } from "@/services/leads";
import { SaleStageApi } from "@/services/SaleStages";


export default function LeadList() {
  const navigate = useNavigate();

  const {
    // ui
    detailsOpen,
    detailsLead,
    detailsTab,
    openDetails,
    closeDetails,

    // data
    users,
    usersLoading,
    assigning,
    leads,
    countries,
    loading,

    // form
    showLeadForm,
    submitting,
    form,
    updateForm,
    toggleLeadForm,

    // handlers
    handleAssignAccountManager,
    handleUniversityFormSubmit,
    handleDeleteLead,
  } = useLeads();

  const handleEditLead = (id) => {
    const l = leads.find((x) => x.id === id);
    if (!l) return;
    updateForm("lead_id", l.id);
    updateForm("lead_name", l.lead_name || "");
    updateForm("destination_id", l.destination_id || "");
    updateForm("city", l.city || "");
    if (!showLeadForm) toggleLeadForm();
  };

  const handleQuickFormSubmit = async ({ leadId, stageId, accountManagerId }) => {
    // Adjust to your actual endpoints
    await LeadsApi.update(leadId, {
      sales_stage_id: stageId,
      account_manager_id: accountManagerId,
    });
    // await fetchLeads(); // refresh row/list if you want
  };

  const handleViewLead = (id) => navigate(`/leads/${id}/edit`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">University List</h1>
        <button
          onClick={toggleLeadForm}
          className="rounded-lg bg-[#282560] hover:bg-[#1f1c4d] px-4 py-2 text-sm text-white transition-colors"
        >
          + Add University
        </button>
      </div>

      {/* Form */}
      {showLeadForm && (
        <div className="pb-8">
          <LeadForm
            form={form}
            submitting={submitting}
            onChange={updateForm}
            onCancel={toggleLeadForm}
            onSubmit={handleUniversityFormSubmit}
            countries={countries}
          />
        </div>
      )}

      {/* Table */}
      <LeadTable
        loading={loading}
        leads={leads}
        users={users}
        usersLoading={usersLoading}
        assigning={assigning}
        onAssignAM={handleAssignAccountManager}
        onOpenDetails={openDetails}
        onViewLead={handleViewLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onQuickFormSubmit={handleQuickFormSubmit}
      />

      {/* Details Modal */}
      <LeadDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        lead={detailsLead}
        initialTab={detailsTab}
      />
    </div>
  );
}
