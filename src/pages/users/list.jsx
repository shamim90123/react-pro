// src/pages/UserList.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { UsersApi } from "@/services/users";

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

  const handleDelete = async (id, userName) => {
    const res = await SweetAlert.confirm({
      title: "Delete user?",
      text: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await UsersApi.remove(id);
      SweetAlert.success("User deleted successfully");

      // If last item on page deleted, go to previous page if possible
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
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return iso;
    }
  };

  // compute current page if server didn't return meta (client-side fallback)
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const hasRows = useMemo(() => rows && rows.length > 0, [rows]);

  // User Image Component
  const UserImage = ({ imageUrl, name, size = "md" }) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12"
    };

    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} rounded-full border border-gray-200 overflow-hidden bg-gray-100`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`h-full w-full flex items-center justify-center ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <span className="font-semibold text-gray-600 text-sm uppercase">
            {name?.charAt(0) || 'U'}
          </span>
        </div>
      </div>
    );
  };

  // Role Badge Component
  const RoleBadge = ({ role }) => {
    const roleConfig = {
      admin: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Admin"
      },
      manager: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Manager"
      },
      staff: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Staff"
      },
      viewer: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Viewer"
      }
    };

    const config = roleConfig[role] || roleConfig.viewer;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Users</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your team members and their permissions</p>
        </div>

        <div className="flex w-full sm:w-auto items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-[#282560] outline-none transition"
              aria-label="Search users"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            onClick={() => navigate("/users/new")}
            className="inline-flex items-center gap-2 bg-[#282560] hover:bg-[#201c4d] text-white px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-[#282560] focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Desktop Table / Mobile Cards container */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Table (md and up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading Skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : hasRows ? (
                rows.map((u) => {
                  const primaryRole = u.primary_role || (Array.isArray(u.roles) ? u.roles[0] : null);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserImage imageUrl={u.image_url} name={u.name} />
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {primaryRole ? (
                          <RoleBadge role={primaryRole} />
                        ) : (
                          <span className="text-sm text-gray-400">No role</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/users/${u.id}/edit`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900 mb-1">No users found</p>
                      <p className="text-sm mb-4">
                        {debouncedQ ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
                      </p>
                      {!debouncedQ && (
                        <button
                          onClick={() => navigate("/users/new")}
                          className="inline-flex items-center gap-2 bg-[#282560] hover:bg-[#201c4d] text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Your First User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            // Mobile Loading Skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : hasRows ? (
            rows.map((u) => {
              const primaryRole = u.primary_role || (Array.isArray(u.roles) ? u.roles[0] : null);
              return (
                <MobileUserCard
                  key={u.id}
                  user={u}
                  primaryRole={primaryRole}
                  onEdit={() => navigate(`/users/${u.id}/edit`)}
                  onDelete={() => handleDelete(u.id, u.name)}
                  formatDate={formatDate}
                  UserImage={UserImage}
                  RoleBadge={RoleBadge}
                />
              );
            })
          ) : (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <svg className="h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-sm">No users found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{(current - 1) * pageSize + 1}</span> to{" "}
          <span className="font-medium">{Math.min(current * pageSize, total)}</span> of{" "}
          <span className="font-medium">{total}</span> users
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#282560] transition"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 transition hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-700 bg-gray-50 rounded-md border border-gray-300">
              {current} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 transition hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Mobile/Card Component ==================== */

function MobileUserCard({ user, primaryRole, onEdit, onDelete, formatDate, UserImage, RoleBadge }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <UserImage imageUrl={user.image_url} name={user.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">{user.name}</div>
            <div className="mt-1 text-sm text-gray-600">{user.email}</div>
            <div className="mt-2 flex items-center gap-2">
              {primaryRole && <RoleBadge role={primaryRole} />}
              <span className="text-xs text-gray-500">
                {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}