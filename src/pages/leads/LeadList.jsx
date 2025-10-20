import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/services/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";
import Select from 'react-select'
import CountrySelect from "@/components/ui/CountrySelect";

export default function LeadList() {
  // -------------------- Router --------------------
  const navigate = useNavigate();

  // -------------------- State --------------------
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
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // -------------------- Helpers --------------------
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () =>
    setForm({ lead_id: undefined, lead_name: "", destination_id: "", city: "" });

  const formatDate = (iso) => (iso ? String(iso).slice(0, 10) : "—");

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

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await LeadsApi.getCountries();
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching leads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Backend supports upsert via lead_id (create or update)
      await LeadsApi.create({
        lead_id: form.lead_id, // optional for update
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
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
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
            onSubmit={handleSubmit}
            countries={countries}
            isSearchable={true}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3">University Name</th>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
               <RowLoading colSpan={4} />
            ) : hasLeads ? (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-100 bg-white hover:bg-gray-50"
                >
                  <td
                    className="cursor-pointer px-6 py-3 font-medium text-gray-900 hover:underline"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    {lead.lead_name}
                  </td>
                  <td className="px-6 py-3">{lead.city || "—"}</td>
                  <td className="px-6 py-3">{formatDate(lead.created_at)}</td>
                  <td className="space-x-2 px-6 py-3 text-right">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 transition hover:bg-green-100"
                    >
                      <i className="fa-solid fa-eye text-xs" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditLead(lead.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                      <i className="fa-solid fa-pen text-xs" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==================== Sub-Components ==================== */

function LeadForm({ form, submitting, onChange, onCancel, onSubmit, countries }) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-wrap items-center gap-4"
    >
      <div className="min-w-[200px] flex-1">
        <input
          value={form.lead_name}
          onChange={(e) => onChange("lead_name", e.target.value)}
          placeholder="Uni Name"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <input
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="City"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[200px] flex-1">

        <CountrySelect
          countries={countries}
          valueId={form.destination_id}
          onChangeId={(v) => onChange("destination_id", v)}
        />
       
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 ${
            submitting
              ? "cursor-not-allowed bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
          }`}
        >
          {submitting ? "Saving…" : form.lead_id ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}


function RowLoading({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </td>
    </tr>
  );
}