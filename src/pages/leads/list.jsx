import { useMemo, useState } from "react";
import Pagination from "../../components/Pagination";

export default function LeadList() {
  // Mock data
  const statuses = ["New", "Contacted", "Qualified", "Won", "Lost"];
  const allLeads = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const id = i + 1;
        return {
          id,
          name: `Lead ${id}`,
          email: `lead${id}@example.com`,
          status: statuses[id % statuses.length],
          date: `2025-10-${String((id % 28) + 1).padStart(2, "0")}`,
        };
      }),
    []
  );

  // State
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Derived
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLeads;
    return allLeads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  }, [allLeads, query]);

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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or status…"
            className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg transition-colors">
            + Add Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
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
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={5}>
                  No results found.
                </td>
              </tr>
            ) : (
              rows.map((lead) => (
                <tr
                  key={lead.id}
                  className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {lead.name}
                  </td>
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
                    <button className="text-blue-600 hover:underline text-sm mr-3">
                      View
                    </button>
                    <button className="text-red-600 hover:underline text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Reusable Pagination */}
        <Pagination
          page={current}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50]}
          showRange
          showFirstLast
          className=""
        />
      </div>
    </div>
  );
}
