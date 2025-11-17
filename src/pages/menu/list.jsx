import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { MenuApi } from "@/services/Menus";

export default function MenuList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Debounce Search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch Menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await MenuApi.list({ q: debouncedQ });
        const items = Array.isArray(data?.data) ? data.data : data || [];
        setRows(items);
      } catch (err) {
        SweetAlert.error(err?.data?.message || err.message || "Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQ]);

  // Delete
  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete Menu?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });

    if (!res.isConfirmed) return;

    try {
      await MenuApi.remove(id);
      SweetAlert.success("Menu deleted");

      setRows(rows.filter((menu) => menu.id !== id));
    } catch (err) {
      SweetAlert.error(err?.data?.message || err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Menu List</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search menu..."
            className="form-input w-full sm:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button onClick={() => navigate("/menus/new")} className="btn-add">
            + Add Menu
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Icon</th>
              <th className="px-6 py-3">Route</th>
              <th className="px-6 py-3">Parent</th>
              <th className="px-6 py-3">Sort</th>
              <th className="px-6 py-3">Permission</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                  Loading menus…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((menu) => (
                <tr
                  key={menu.id}
                  className="bg-white border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-3 font-medium text-gray-900">{menu.name}</td>
                  <td className="px-6 py-3">{menu.icon || "-"}</td>
                  <td className="px-6 py-3">{menu.route || "-"}</td>

                  <td className="px-6 py-3">
                    {menu.parent?.name || <span className="text-gray-400">—</span>}
                  </td>

                  <td className="px-6 py-3">{menu.sort_order}</td>

                  <td className="px-6 py-3">{menu.permission_name || "-"}</td>

                  <td className="px-6 py-3">
                    {menu.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </td>

                 <td className="px-6 py-3 text-right flex items-center justify-end gap-3">
                    {/* Edit button */}
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => navigate(`/menus/${menu.id}/edit`)}
                    >
                      Edit
                    </button>

                    {/* Delete button */}
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(menu.id)}
                    >
                      Delete
                    </button>

                    {/* Toggle active/inactive */}
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        menu.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                      onClick={async () => {
                        try {
                          await MenuApi.toggleStatus(menu.id); // Calls API to toggle is_active
                          setRows((prev) =>
                            prev.map((m) =>
                              m.id === menu.id ? { ...m, is_active: !m.is_active } : m
                            )
                          );
                        } catch (err) {
                          SweetAlert.error(err?.data?.message || err.message || "Failed to toggle status");
                        }
                      }}
                    >
                      {menu.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                  No menus found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
