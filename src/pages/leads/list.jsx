import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { useLeadsStore } from "../../store/leads";

export default function LeadList() {
  const navigate = useNavigate();
  const leads = useLeadsStore((s) => s.leads);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [leads, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const startIndex = (current - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const rows = filtered.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Lead List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search leads..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => navigate("/leads/new")}
            className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg"
          >
            + Add Lead
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Lead Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((lead) => (
                <tr
                  key={lead.id}
                  className="bg-white border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-6 py-3">{lead.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lead.status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : lead.status === "Contacted"
                          ? "bg-yellow-100 text-yellow-800"
                          : lead.status === "Qualified"
                          ? "bg-green-100 text-green-800"
                          : lead.status === "Won"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{lead.date}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm mr-3"
                      onClick={() => {/* navigate(`/leads/${lead.id}/edit`) */}}
                    >
                      View
                    </button>
                    <button className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={current}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
