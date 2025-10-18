// src/pages/UserList.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { UsersApi } from "@/services/users"; // must expose list({page, per_page, q}) and remove(id)

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

  // debounce search (mobile-friendly typing)
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
      // Laravel paginator shape: { data: [], meta: { total } }
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

      // If last item on page deleted, go to previous page if possible (mobile-safe UX)
      const isLastItem = rows.length === 1 && page > 1;
      const newPage = isLastItem ? page - 1 : page;
      setPage(newPage);
      await fetchUsers();
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
  const hasRows = useMemo(() => rows && rows.length > 0, [rows]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Users</h1>

        <div className="flex w-full sm:w-auto items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <input
              type="text"
              placeholder="Search by name, email, or role…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-[#282560] outline-none"
              aria-label="Search users"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </div>

          <button
            onClick={() => navigate("/user/new")}
            className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg active:scale-[.99]"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Desktop Table / Mobile Cards container */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Table (md and up) */}
        <div className="hidden md:block overflow-x-auto">
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
                <RowLoading colSpan={5} />
              ) : hasRows ? (
                rows.map((u) => {
                  const roles = Array.isArray(u.roles)
                    ? u.roles
                    : Array.isArray(u?.role_names)
                    ? u.role_names
                    : [];
                  return (
                    <tr
                      key={u.id}
                      className="bg-white border-b border-gray-100 hover:bg-gray-50"
                    >
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
                      <td className="px-6 py-3 text-right whitespace-nowrap">
                        <button
                          className="inline-flex items-center justify-center h-8 px-3 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md mr-2"
                          onClick={() => navigate(`/user/${u.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center h-8 px-3 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                          onClick={() => handleDelete(u.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <RowEmpty colSpan={5} />
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : hasRows ? (
            rows.map((u) => {
              const roles = Array.isArray(u.roles)
                ? u.roles
                : Array.isArray(u?.role_names)
                ? u.role_names
                : [];
              return (
                <MobileUserCard
                  key={u.id}
                  user={u}
                  roles={roles}
                  onEdit={() => navigate(`/user/${u.id}/edit`)}
                  onDelete={() => handleDelete(u.id)}
                  formatDate={formatDate}
                />
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-500">No users found.</div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#282560]"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-sm text-gray-700">
              {current} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Mobile/Card & helpers ==================== */

function MobileUserCard({ user, roles, onEdit, onDelete, formatDate }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="mt-1 text-sm text-gray-700">{user.email}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {roles?.length ? (
              roles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No roles</span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Created: {formatDate(user.created_at)}
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
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

function RowEmpty({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-6 text-center text-gray-500">
        No users found.
      </td>
    </tr>
  );
}
