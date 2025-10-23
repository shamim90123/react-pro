// src/pages/leads/LeadList.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LeadForm from "./LeadForm";
import LeadDetailsModal from "./LeadListModal";
import LeadTable from "./table/LeadTable";
import Pagination from "@/components/layout/Pagination";
import { useLeads } from "./hooks/useLeads";
import { LeadsApi } from "@/services/leads";

export default function LeadList() {
  const navigate = useNavigate();

  const {
    // ui
    detailsOpen,
    detailsLead,
    detailsTab,
    openDetails,
    closeDetails,

    // data (keep using hook for users, countries, etc.)
    users,
    usersLoading,
    assigning,
    countries,

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

  // ------ NEW: local pagination state for list ------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(""); // optional search term if you add a search box

  const fetchPagedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await LeadsApi.list({ page, perPage: pageSize, q });
      setRows(data || []);
      setTotal(meta?.total ?? 0);
      // guard against out-of-range states after deletes/filters
      if (meta?.current_page && meta.current_page !== page) {
        setPage(meta.current_page);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q]);

  useEffect(() => {
    fetchPagedLeads();
  }, [fetchPagedLeads]);

  // If you delete a lead, refresh the current page
  const handleAfterDelete = async (id) => {
    await handleDeleteLead(id);
    // if the page becomes empty (e.g., last item deleted), go back a page
    if (rows.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      fetchPagedLeads();
    }
  };

  const handleEditLead = (id) => {
    const l = rows.find((x) => x.id === id);
    if (!l) return;
    updateForm("lead_id", l.id);
    updateForm("lead_name", l.lead_name || "");
    updateForm("destination_id", l.destination_id || "");
    updateForm("city", l.city || "");
    if (!showLeadForm) toggleLeadForm();
  };

  const handleQuickFormSubmit = async ({ leadId, stageId, accountManagerId }) => {
    await LeadsApi.update(leadId, {
      sales_stage_id: stageId,
      account_manager_id: accountManagerId,
    });
    fetchPagedLeads();
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

      {/* Optional: simple search box that resets to page 1 */}
      {/* <div className="mb-4">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by name or city…"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div> */}

      {/* Form */}
      {showLeadForm && (
        <div className="pb-8">
          <LeadForm
            form={form}
            submitting={submitting}
            onChange={updateForm}
            onCancel={toggleLeadForm}
            onSubmit={async (payload) => {
              await handleUniversityFormSubmit(payload);
              // after create/update, reload first page to show newest (or keep current page)
              fetchPagedLeads();
            }}
            countries={countries}
          />
        </div>
      )}

      {/* Table */}
      <LeadTable
        loading={loading}
        leads={rows}
        users={users}
        usersLoading={usersLoading}
        assigning={assigning}
        onAssignAM={handleAssignAccountManager}
        onOpenDetails={openDetails}
        onViewLead={handleViewLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleAfterDelete}
        onQuickFormSubmit={handleQuickFormSubmit}
        page={page}               // 👈 add this
        pageSize={pageSize}       // 👈 and this
      />

      {/* Pagination */}
      <Pagination
        className="mt-2"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1); // reset to first page on page-size change
        }}
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
