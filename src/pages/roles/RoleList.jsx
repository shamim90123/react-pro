// src/pages/roles/RoleList.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { RolesApi } from "@/services/roles";

export default function RoleList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

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
      await Swal.fire({ icon: "error", title: "Failed to load roles", text: e?.data?.message || e?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
      // reload current page (if empty and page>1, go back one page)
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Delete failed", text: e?.data?.message || e?.message });
    }
  };

  const RoleForm = () => navigate('/role-create');

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
          <p className="text-sm text-gray-500">Manage roles and permissions.</p>
        </div>
         <button onClick={RoleForm} className="btn-add">
          +  New Role
        </button>
        {/* <Link to="/roles/create" className="rounded-lg bg-[#282560] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1f1c4d]">
          + New Role
        </Link> */}
      </div>

      <form onSubmit={onSearch} className="mb-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search roles…"
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">Search</button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Permissions</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="px-4 py-6 text-gray-600" colSpan={3}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6 text-gray-600" colSpan={3}>No roles found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.permissions || []).slice(0, 6).map((p) => (
                        <span key={typeof p === "string" ? p : p.name} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          {typeof p === "string" ? p : p.name}
                        </span>
                      ))}
                      {(r.permissions?.length || 0) > 6 && (
                        <span className="text-xs text-gray-500">+{r.permissions.length - 6} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                        onClick={() => navigate(`/role-edit/${r.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        onClick={() => confirmDelete(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* simple pager */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Total: {meta.total}</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>Page {page} / {meta.last_page || 1}</span>
          <button
            className="rounded-md border px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
            disabled={page >= (meta.last_page || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
