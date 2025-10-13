import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { UsersApi } from "@/lib/users"; // make sure this has list/remove
import Pagination from "@/components/Pagination";

export default function UserList() {
  const navigate = useNavigate();

  // table state
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UsersApi.list({
        page,
        per_page: pageSize,
        q: debouncedQ || "",
      });
      // Laravel paginator shape: { data: [], meta: { total, per_page, current_page } }
      const items = Array.isArray(data?.data) ? data.data : data || [];
      setRows(items);
      const meta = data?.meta;
      setTotal(meta?.total ?? items.length);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete user?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await UsersApi.remove(id);
      SweetAlert.success("User deleted");
      // reload current page (handles last-item deletion edge-case)
      fetchUsers();
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // compute current page if server didn’t return meta (client-side fallback)
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#282560]"
          />
          <button
            onClick={() => navigate("/user/new")}
            className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Roles</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-gray-500" colSpan={5}>
                  Loading users…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((u) => {
                const roles = Array.isArray(u.roles)
                  ? u.roles
                  : Array.isArray(u?.role_names)
                  ? u.role_names
                  : [];
                return (
                  <tr key={u.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {roles.length ? (
                          roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        className="text-blue-600 hover:underline text-sm mr-3"
                        onClick={() => navigate(`/user/${u.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={5}>
                  No users found.
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
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
