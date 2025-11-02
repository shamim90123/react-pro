import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { DemoBookApi } from "@/services/DemoBook"; // Import demo books API

function DateRequireBadge({ value }) {
  const on = Boolean(value);
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        on
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-gray-50 text-gray-600 ring-gray-500/10",
      ].join(" ")}
      title={on ? "Date is required" : "Date is not required"}
    >
      {on ? "Yes" : "No"}
    </span>
  );
}

export default function LeadStageList() {
  const navigate = useNavigate();

  // Table state
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState(""); // Search query (UI optional)
  const [debouncedQ, setDebouncedQ] = useState(""); // Debounced search query
  const [loading, setLoading] = useState(true); // Loading state

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch demo books with search query
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await DemoBookApi.list({
          q: debouncedQ || "",
        });

        const items = Array.isArray(data?.data) ? data.data : data || [];
        setRows(items);
      } catch (e) {
        SweetAlert.error(e?.data?.message || e?.message || "Failed to load demo books");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQ]);

  // Handle delete LeadStage
  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete Demo Book?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await DemoBookApi.remove(id);
      SweetAlert.success("Demo Book deleted");
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">DemoBook List</h1>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          {/* (Optional) Search input if you want to expose the 'query' state */}
          {/* <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            placeholder="Search demo books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          /> */}
          <button onClick={() => navigate("/demo-book/new")} className="btn-add">
            + Add demo book
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date Require</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={4}>
                  Loading demo books…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((LeadStage) => (
                <tr
                  key={LeadStage.id}
                  className="border-b border-gray-100 bg-white hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {LeadStage.name}
                  </td>
                  <td className="px-6 py-3">{LeadStage.status}</td>
                  <td className="px-6 py-3">
                    <DateRequireBadge value={LeadStage.date_require} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="mr-3 text-sm text-blue-600 hover:underline"
                      onClick={() => navigate(`/demo-book/${LeadStage.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => handleDelete(LeadStage.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={4}>
                  No demo book found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
