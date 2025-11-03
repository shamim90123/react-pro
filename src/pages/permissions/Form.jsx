// src/pages/permissions/Form.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PermissionApi } from "@/services/PermissionApi";

const initialForm = { name: "", guard_name: "sanctum" };

export default function PermissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = id ? "Edit Permission" : "Add Permission";
  const canSave = useMemo(() => form.name.trim().length > 0 && !saving, [form.name, saving]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await PermissionApi.show(id);
        setForm({
          name: data?.name ?? "",
          guard_name: data?.guard_name ?? "sanctum",
        });
      } catch (e) {
        console.error(e);
        setError("Failed to load permission. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setSaving(true);
      setError("");
      const payload = { ...form, name: form.name.trim() };

      if (id) {
        await PermissionApi.update(id, payload);
      } else {
        await PermissionApi.create(payload);
      }
      navigate("/permissions");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Error saving permission. Please try again.");
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/permissions");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {id ? "Update permission details" : "Create a new system permission"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-medium text-gray-900">Permission Details</h2>
        </div>

        <div className="px-5 py-6">
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            // Skeleton loader
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    Permission Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. users.create, leads.view"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use dot notation for better organization (module.action)
                  </p>
                </div>

                {/* Guard Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Guard Name</label>
                  <select
                    name="guard_name"
                    value={form.guard_name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="sanctum">Sanctum</option>
                    <option value="web">Web</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Authentication guard for this permission</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Saving…
                    </>
                  ) : id ? (
                    "Update Permission"
                  ) : (
                    "Create Permission"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}