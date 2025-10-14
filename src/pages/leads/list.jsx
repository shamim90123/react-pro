import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { LeadsApi } from "@/lib/leads";

const productLabels = {
  sams_pay: "SAMS Pay",
  sams_manage: "SAMS Manage",
  sams_platform: "SAMS Platform",
  sams_pay_client_management: "SAMS Pay CM",
};

export default function LeadList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // api data
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetched meta (Laravel pagination)
  const [total, setTotal] = useState(0);

  const fetchList = async ({ p = page, ps = pageSize, q = query } = {}) => {
    try {
      setLoading(true);
      const res = await LeadsApi.list({ page: p, perPage: ps, q });

      // Check if the response contains data and is an array
      const rows = Array.isArray(res?.data) ? res.data : [];

      console.log("Fetched leads:", rows);
      setItems(rows);

      const meta = res?.meta || {};
      setTotal(meta.total ?? rows.length);
    } catch (err) {
      alert(`Failed to load leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchList({ p: page, ps: pageSize, q: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    // If backend already filters with ?q=, you can just return items.
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((l) => {
      const hay = [
        l.name,
        l.email,
        l.phone,
        l.city,
        l.firstname,
        l.lastname,
        l.job_title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const handleSearch = () => {
    setPage(1);
    fetchList({ p: 1, ps: pageSize, q: query });
  };

  const deleteLead = async (id) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await LeadsApi.remove(id);
      fetchList(); // refresh current page
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const rows = filtered; // already paginated by backend

  const renderProducts = (lead) => {
    const tags = Object.keys(productLabels).filter((k) => !!lead[k]);
    if (!tags.length) return <span className="text-gray-400">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((k) => (
          <span
            key={k}
            className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-700"
          >
            {productLabels[k]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Lead List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, phone, city…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Search
          </button>
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
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Booked Demo</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((lead) => (
                <tr key={lead.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{lead.name}</span>
                      <span className="text-xs text-gray-500">
                        {lead.firstname || lead.lastname
                          ? `${lead.firstname ?? ""} ${lead.lastname ?? ""}`.trim()
                          : lead.job_title || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">{lead.email}</td>
                  <td className="px-6 py-3">{lead.phone || <span className="text-gray-400">—</span>}</td>
                  <td className="px-6 py-3">{lead.city || <span className="text-gray-400">—</span>}</td>
                  <td className="px-6 py-3">{renderProducts(lead)}</td>
                  <td className="px-6 py-3">
                    {lead.booked_demo ? (
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-100 text-emerald-700">Yes</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-600">No</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {lead.created_at?.slice?.(0, 10) || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm mr-3"
                      onClick={() => { /* navigate(`/leads/${lead.id}`) */ }}
                    >
                      View
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => deleteLead(lead.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={8}>
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
