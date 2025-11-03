import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { PermissionApi } from "@/services/PermissionApi";
import Pagination from "@/components/layout/Pagination";

export default function PermissionList() {
  const navigate = useNavigate();

  // Table state
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState(""); // Search query
  const [debouncedQ, setDebouncedQ] = useState(""); // Debounced search query
  const [loading, setLoading] = useState(true); // Loading state

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    per_page: 10,
  });

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch permissions with search query and pagination
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await PermissionApi.list({
          page,
          perPage,
          q: debouncedQ || "",
        });

        const items = Array.isArray(data?.data) ? data.data : data || [];
        setRows(items);
        
        // Set pagination data
        setPagination({
          total: data?.total || 0,
          current_page: data?.current_page || 1,
          last_page: data?.last_page || 1,
          from: data?.from || 0,
          to: data?.to || 0,
          per_page: data?.per_page || perPage,
        });
      } catch (e) {
        SweetAlert.error(e?.data?.message || e?.message || "Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQ, page, perPage]);

  // Handle delete permission
  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete Permission?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await PermissionApi.remove(id);
      SweetAlert.success("Permission deleted");
      // Reload the permissions list
      const updatedRows = rows.filter((permission) => permission.id !== id);
      setRows(updatedRows);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  // Handle page change from Pagination component
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle page size change from Pagination component
  const handlePageSizeChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Permissions List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search permissions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => navigate("/permissions/new")}
            className="btn-add"
          >
            + Add Permission
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Guard</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  Loading permissions…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((permission) => (
                <tr key={permission.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{permission.name}</td>
                  <td className="px-6 py-3">{permission.guard_name}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm mr-3"
                      onClick={() => navigate(`/permissions/${permission.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(permission.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  No permissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="mt-6">
          <Pagination
            page={pagination.current_page}
            pageSize={pagination.per_page}
            total={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            showRange={true}
            showFirstLast={true}
            disabled={loading}
            className="bg-white"
          />
        </div>
      )}
    </div>
  );
}