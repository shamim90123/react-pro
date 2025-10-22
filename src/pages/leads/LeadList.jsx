import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/services/leads";
import { UsersApi } from "@/services/users";
import { SweetAlert } from "@/components/ui/SweetAlert";
import LeadActions from "./LeadActions"; // unchanged
import LeadForm from "./LeadForm";
import RowLoading from "./RowLoading";
import AccountManagerCell from "./AccountManagerCell";
import LeadDetailsModal from "./LeadDetailsModal";


export default function LeadList() {
  const navigate = useNavigate();

  // -------------------- State --------------------
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLead, setDetailsLead] = useState(null);
  const [detailsTab, setDetailsTab] = useState("contacts"); // or "notes"
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assigning, setAssigning] = useState({}); // { [leadId]: boolean }
  const [leads, setLeads] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    lead_id: undefined,
    lead_name: "",
    destination_id: "",
    city: "",
  });

  // -------------------- Helpers --------------------
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () =>
    setForm({ lead_id: undefined, lead_name: "", destination_id: "", city: "" });

  // -------------------- API --------------------
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await LeadsApi.list({ page: 1, perPage: 10 });
      setLeads(res.data || []);
    } catch (err) {
      console.error("Error fetching leads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAccountManager = async (leadId, userId) => {
    setAssigning((m) => ({ ...m, [leadId]: true }));
    const prevLeads = JSON.parse(JSON.stringify(leads));
    const normalized = userId === "" || userId == null ? null : Number(userId);

    try {
      // optimistic UI
      setLeads((ls) =>
        ls.map((l) =>
          l.id === leadId
            ? {
                ...l,
                account_manager_id: normalized,
                account_manager:
                  users.find((u) => String(u.id) === String(normalized)) || null,
              }
            : l
        )
      );

      await LeadsApi.assignAccountManager(leadId, normalized);
      SweetAlert.success("Account manager updated");
    } catch (e) {
      console.error(e);
      setLeads(prevLeads); // revert
      SweetAlert.error(e?.message || "Could not update account manager");
    } finally {
      setAssigning((m) => ({ ...m, [leadId]: false }));
    }
  };

  const fetchUserList = async () => {
    setUsersLoading(true);
    try {
      const res = await UsersApi.userlist();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await LeadsApi.getCountries();
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching countries", err);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (lead, tab) => {
    setDetailsLead(lead);
    setDetailsTab(tab);
    setDetailsOpen(true);
  };
  const closeDetails = () => setDetailsOpen(false);

  const handleUniversityFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await LeadsApi.create({
        lead_id: form.lead_id,
        lead_name: form.lead_name,
        destination_id: form.destination_id,
        city: form.city,
      });
      await fetchLeads();
      setShowLeadForm(false);
      resetForm();
    } catch (err) {
      console.error("Error saving lead:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      const result = await SweetAlert.confirm({
        title: "Delete Lead?",
        text: "This action cannot be undone.",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        SweetAlert.info("Deleting...");
        await LeadsApi.remove(id);
        SweetAlert.success("Lead deleted successfully");
        fetchLeads();
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      SweetAlert.error("Failed to delete lead");
    }
  };

  // -------------------- Effects --------------------
  useEffect(() => {
    fetchLeads();
    fetchCountries();
    fetchUserList();
  }, []);

  // -------------------- Handlers --------------------
  const toggleLeadForm = () => {
    setShowLeadForm((s) => !s);
    if (showLeadForm) resetForm(); // closing: clear form
  };

  const handleEditLead = (id) => {
    const leadToEdit = leads.find((l) => l.id === id);
    if (!leadToEdit) return;
    setForm({
      lead_id: leadToEdit.id,
      lead_name: leadToEdit.lead_name || "",
      destination_id: leadToEdit.destination_id || "",
      city: leadToEdit.city || "",
    });
    setShowLeadForm(true);
  };

  const handleViewLead = (id) => navigate(`/leads/${id}/edit`);

  // -------------------- Memo --------------------
  const hasLeads = useMemo(() => (leads || []).length > 0, [leads]);

  // -------------------- Render --------------------
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">SL</th>
              <th className="px-6 py-3">Account Manager</th>
              <th className="px-6 py-3">University Name</th>
              <th className="px-6 py-3">Contacts</th>
              <th className="px-6 py-3">Notes</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <RowLoading colSpan={7} />
            ) : hasLeads ? (
              leads.map((lead, i) => (
                <tr
                  key={lead.id ?? i}
                  className="border-b border-gray-100 bg-white hover:bg-gray-50"
                >
                  {/* SL */}
                  <td className="px-4 py-3 text-gray-600">{i + 1}</td>

                  {/* Account Manager */}
                  <AccountManagerCell
                    lead={lead}
                    users={users}
                    usersLoading={usersLoading}
                    assigning={assigning}
                    handleAssignAccountManager={handleAssignAccountManager}
                  />

                  {/* University Name */}
                  <td
                    className="cursor-pointer px-6 py-3 font-medium text-gray-900"
                    onClick={() => handleViewLead(lead.id)}
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

                  <td className="px-6 py-3">
                    <button
                      className="text-indigo-600 underline-offset-2 hover:underline disabled:text-gray-400"
                      onClick={() => openDetails(lead, "contacts")}
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
                      onClick={() => openDetails(lead, "notes")}
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
                      handleViewLead={handleViewLead}
                      handleEditLead={handleEditLead}
                      handleDeleteLead={handleDeleteLead}
                    />
                  </td>
                </tr>
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

      {/* 👇 Add the modal here, at the bottom */}
      <LeadDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        lead={detailsLead}
        initialTab={detailsTab}
      />
    </div>
  );
}
