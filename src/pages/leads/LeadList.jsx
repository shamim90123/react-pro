import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/lib/leads"; // Assuming you have this API

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

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
    navigate("/leads/new");
  };

  const handleEditLead = (id) => {
    navigate(`/leads/${id}/edit`);
  };

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
                  <td className="px-6 py-3 font-medium text-gray-900">{lead.lead_name}</td>
                  <td className="px-6 py-3">{lead.city}</td>
                  <td className="px-6 py-3">{lead.created_at?.slice(0, 10) || <span className="text-gray-400">—</span>}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleEditLead(lead.id)}
                      className="text-blue-600 hover:underline text-sm mr-3"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDeleteLead(lead.id)} // Delete function will be defined
                    >
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
