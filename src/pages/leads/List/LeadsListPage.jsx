// src/pages/leads/LeadList.jsx
import { useMemo, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LeadForm from "./LeadForm";
import LeadContactsModal from "./ContactModal/ModalContact";
import LeadNotesModal from "./NoteModal/ModalNote";
import LeadTable from "./LeadTable/LeadTable";
import Pagination from "@/components/layout/Pagination";
import { LeadsApi } from "../api/leadsApi";
import { useLeads } from "../hooks/useLeads";
import LeadSearchPanel from "./SearchPanel";

export default function LeadList() {
  const navigate = useNavigate();

  const {
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

  // ------ Local state for pagination and filtering ------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [contactsOpen, setContactsOpen] = useState(false);
  const [notesOpen,   setNotesOpen]   = useState(false);
  const [detailsLead, setDetailsLead] = useState(null);

  const openContacts = (lead) => { setDetailsLead(lead); setContactsOpen(true); };
  const openNotes    = (lead) => { setDetailsLead(lead); setNotesOpen(true); };
  const closeContacts = () => setContactsOpen(false);
  const closeNotes    = () => setNotesOpen(false);

  // Filters
  const [leadName, setLeadName] = useState("");
  const [status, setStatus] = useState("");
  const [destinationId, setDestinationId] = useState("");

  // Build quick dropdown list of university names (from current data)
  const uniOptions = useMemo(() => {
    const s = new Set(rows.map((r) => r?.lead_name).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // ---------- Fetch paged leads ----------
  const fetchPagedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await LeadsApi.list({
        page,
        perPage: pageSize,
        leadName,
        status: status === "" ? "" : Number(status),
        destinationId,
      });
      setRows(data || []);
      setTotal(meta?.total ?? 0);
      if (meta?.current_page && meta.current_page !== page) setPage(meta.current_page);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, leadName, status, destinationId]);

  useEffect(() => {
    fetchPagedLeads();
  }, [fetchPagedLeads]);

  // ---------- Actions ----------
  const handleAfterDelete = async (id) => {
    await handleDeleteLead(id);
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

  const handleChangeStatus = useCallback(
    async (leadId, status) => {
      await LeadsApi.updateStatus(leadId, status);
      await fetchPagedLeads();
    },
    [fetchPagedLeads]
  );

  const handleAssignAMAndRefresh = useCallback(
    async (leadId, userId) => {
      await handleAssignAccountManager(leadId, userId);
      await fetchPagedLeads();
    },
    [handleAssignAccountManager, fetchPagedLeads]
  );

  const resetFilters = () => {
    setLeadName("");
    setStatus("");
    setDestinationId("");
    setPage(1);
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">University List</h1>
        <button onClick={toggleLeadForm} className="btn-add">
          + Add University
        </button>
      </div>

      {/* Create / Edit Form */}
      {showLeadForm && (
        <div className="pb-8">
          <LeadForm
            form={form}
            submitting={submitting}
            onChange={updateForm}
            onCancel={toggleLeadForm}
            onSubmit={async (payload) => {
              await handleUniversityFormSubmit(payload);
              fetchPagedLeads();
            }}
            countries={countries}
          />
        </div>
      )}

      {/* Search Panel */}
      <LeadSearchPanel
        uniOptions={uniOptions}
        countries={countries}
        leadName={leadName}
        setLeadName={setLeadName}
        status={status}
        setStatus={setStatus}
        destinationId={destinationId}
        setDestinationId={setDestinationId}
        onApply={() => {
          setPage(1);
          fetchPagedLeads();
        }}
        onReset={() => {
          resetFilters();
          fetchPagedLeads();
        }}
      />

      {/* Table */}
      <LeadTable
        loading={loading}
        leads={rows}
        users={users}
        usersLoading={usersLoading}
        assigning={assigning}
        onAssignAM={handleAssignAMAndRefresh}
        onViewLead={handleViewLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleAfterDelete}
        onQuickFormSubmit={handleQuickFormSubmit}
        page={page}
        pageSize={pageSize}
        onChangeStatus={handleChangeStatus}
        onOpenContacts={openContacts}
        onOpenNotes={openNotes}
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
          setPage(1);
        }}
      />

      <LeadContactsModal open={contactsOpen}  onClose={closeContacts} lead={detailsLead} />
      <LeadNotesModal    open={notesOpen}    onClose={closeNotes}    lead={detailsLead} />
    </div>
  );
}
