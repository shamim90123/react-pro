import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/lib/leads"; // Assuming you have this API

export default function LeadList() {

  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    lead_name: "",
    destination_id: "",
    city: "",
  });
  
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await LeadsApi.create(form); // API call to create a new lead
      fetchLeads(); // Refresh the lead list after creating a lead
      setShowLeadForm(false); // Close the form after submission
      setForm({ lead_name: "", destination_id: "", city: "" }); // Reset form
    } catch (err) {
      console.error("Error creating lead:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch all leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await LeadsApi.list({ page: 1, perPage: 10 });
      setLeads(response.data);
    } catch (err) {
      console.error("Error fetching leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = () => {
    setShowLeadForm(!showLeadForm);
  };

  const handleEditLead = (id) => {
    setShowLeadForm(true);
    const leadToEdit = leads.find(lead => lead.id === id);
    if (leadToEdit) {
      setForm({
        lead_name: leadToEdit.lead_name || "",
        destination_id: leadToEdit.destination_id || "",
        city: leadToEdit.city || "",
        lead_id: leadToEdit.id
      });
    }
  };

  const handleViewLead = (id) => {
    navigate(`/leads/${id}/edit`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lead List</h1>
        <button
          onClick={handleAddLead}
          className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg"
        >
          + Add Lead
        </button>
      </div>

      {/* lead Form Start */}
      {showLeadForm && (
        <div className="flex flex-row pb-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-4 items-center w-full"
          >
            <div className="flex-1 min-w-[200px]">
              <input
                value={form.lead_name}
                onChange={(e) => updateForm("lead_name", e.target.value)}
                placeholder="Lead Name"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <input
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
                placeholder="City"
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <select
                value={form.destination_id}
                onChange={(e) => updateForm("destination_id", e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select Destination</option>
                <option value="1">Destination 1</option>
                <option value="2">Destination 2</option>
              </select>
            </div>

            {/* ✅ Buttons Group */}
            <div className="flex items-center gap-3">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleAddLead}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>

              {/* Save Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 shadow-sm ${
                  submitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                }`}
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>

          </form>
        </div>
      )}
      {/* lead Form end */}

      {/* Lead Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Lead Name</th>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : leads.length ? (
              leads.map((lead) => (
                <tr key={lead.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                 <td
                    className="px-6 py-3 font-medium text-gray-900 cursor-pointer hover:text-[#282560] 
                    hover:underline"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    {lead.lead_name}
                  </td>

                  <td className="px-6 py-3">{lead.city}</td>
                  <td className="px-6 py-3">{lead.created_at?.slice(0, 10) || <span className="text-gray-400">—</span>}</td>
                  <td className="px-6 py-3 text-right space-x-2">
                   
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition"
                    >
                      <i className="fa-solid fa-eye text-xs"></i>
                      View
                    </button>

                    <button
                      onClick={() => handleEditLead(lead.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={4}>
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
