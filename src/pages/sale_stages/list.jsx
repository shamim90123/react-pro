import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { SaleStageApi } from "@/services/SaleStages"; // Import sale stages API

export default function LeadStageList() {
  const navigate = useNavigate();

  // Table state
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState(""); // Search query
  const [debouncedQ, setDebouncedQ] = useState(""); // Debounced search query
  const [loading, setLoading] = useState(true); // Loading state

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch sale stages with search query
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await SaleStageApi.list({
          q: debouncedQ || "",
        });

        const items = Array.isArray(data?.data) ? data.data : data || [];
        setRows(items);
      } catch (e) {
        SweetAlert.error(e?.data?.message || e?.message || "Failed to load sale stages");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQ]);

  // Handle delete LeadStage
  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete LeadStage?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await SaleStageApi.remove(id);
      SweetAlert.success("LeadStage deleted");
      // Reload the sale stages list
      const updatedRows = rows.filter((LeadStage) => LeadStage.id !== id);
      setRows(updatedRows);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">LeadStage List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
       
          <button
            onClick={() => navigate("/sale-stages/new")}
            className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg"
          >
            + Add sale Stage
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  Loading sale Stages…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((LeadStage) => (
                <tr key={LeadStage.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{LeadStage.name}</td>
                  <td className="px-6 py-3">{LeadStage.status}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm mr-3"
                      onClick={() => navigate(`/sale-stages/${LeadStage.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(LeadStage.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  No sale stages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
