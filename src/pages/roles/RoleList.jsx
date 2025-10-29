// src/pages/roles/RoleList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { RolesApi } from "@/services/roles";
import Pagination from "@/components/layout/Pagination";

export default function RoleList() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await RolesApi.list({ q, page, perPage });
      setRows(res.data || []);
      setMeta(res.meta || { total: 0, last_page: 1 });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Failed to load roles",
        text: e?.data?.message || e?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const onSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const confirmDelete = async (row) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: `Delete role "${row.name}"?`,
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ask.isConfirmed) return;

    try {
      await RolesApi.remove(row.id);
      await Swal.fire({ icon: "success", title: "Deleted" });
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.data?.message || e?.message,
      });
    }
  };

  const RoleForm = () => navigate("/role-create");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">Manage roles and permissions.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={onSearch} className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search roles…"
              className="w-72 rounded-xl border border-gray-300 bg-white/80 pl-10 pr-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>
          </form>

          <button onClick={RoleForm} className="btn-add">
            + New Role
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Total <span className="font-medium text-gray-900">{meta.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Rows</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div> */}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <th className="px-4 py-3 sm:px-5">Name</th>
                <th className="px-4 py-3 sm:px-5">Permissions</th>
                <th className="w-40 px-4 py-3 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-16">
                    <div className="mx-auto max-w-md text-center">
                      <div className="mb-2 text-5xl">🗂️</div>
                      <h3 className="text-base font-medium text-gray-900">No roles found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try a different search or create a new role.
                      </p>
                      <div className="mt-4">
                        <button onClick={RoleForm} className="btn-add">
                          + New Role
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60 hover:bg-gray-50"}
                  >
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                          {String(r.name || "?")
                            .trim()
                            .slice(0, 2)
                            .toUpperCase()}
                        </div> */}
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">{r.name}</div>
                          <div className="truncate text-xs text-gray-500">Role</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap gap-1.5">
                        {(r.permissions || [])
                          .slice(0, 6)
                          .map((p) => (typeof p === "string" ? p : p?.name))
                          .filter(Boolean)
                          .map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                            >
                              {name}
                            </span>
                          ))}
                        {(r.permissions?.length || 0) > 6 && (
                          <span className="text-xs text-gray-500">
                            +{r.permissions.length - 6} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                          onClick={() => navigate(`/role-edit/${r.id}`)}
                        >
                          ✏️ <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete(r)}
                        >
                          🗑️ <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <Pagination
          className="border-t border-gray-100"
          page={page}
          pageSize={perPage}
          total={meta.total || 0}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPerPage(sz);
            setPage(1);
          }}
          showRange
          showFirstLast
        />
      </div>
    </div>
  );
}
