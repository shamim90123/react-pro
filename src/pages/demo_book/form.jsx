// src/pages/products/form.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SaleStageApi } from "@/services/SaleStages";

const initialForm = { name: "", status: "active", date_require: false };

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = id ? "Edit Demo Book" : "Add Demo Book";
  const canSave = useMemo(() => form.name.trim().length > 0 && !saving, [form.name, saving]);

  // fetch on edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await SaleStageApi.show(id);
        // ensure defaults so the form is always controlled
        setForm({
          name: data?.name ?? "",
          status: data?.status ?? "active",
          date_require: Boolean(data?.date_require),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load the item. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      setSaving(true);
      setError("");

      // trim name before submit
      const payload = { ...form, name: form.name.trim() };

      if (id) {
        await SaleStageApi.update(id, payload);
      } else {
        await SaleStageApi.create(payload);
      }

      navigate("/demo-book");
    } catch (err) {
      console.error(err);
      setError("Error saving data. Please try again.");
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/demo-book");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below, then save to continue.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          type="button"
        >
          Cancel
        </button>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-medium">Basic Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6">
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            // Skeleton loader
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Demo Book Name */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Demo Book Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Keep it short and descriptive.</p>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Inactive items won’t appear in lists.</p>
              </div>

              {/* Date Require (checkbox presented as a tidy switch-like row) */}
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Options</label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    id="date_require"
                    type="checkbox"
                    name="date_require"
                    checked={form.date_require || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="date_require" className="ml-2 text-sm text-gray-700">
                    Date Require
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={`inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`}
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
                "Save Changes"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
