import { useMemo, useState } from "react";

export default function ModalContactForm({ onCreate, onCancel }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    primary_status: false,
  });

  const canSave = useMemo(
    () => form.first_name.trim().length > 0 && form.last_name.trim().length > 0,
    [form.first_name, form.last_name]
  );

  const reset = () =>
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      primary_status: false,
    });

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSave) return;

    try {
      setSaving(true);
      await onCreate({
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        job_title: form.job_title?.trim() || null,
        primary_status: !!form.primary_status,
      });
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-2"
    >
      <div>
        <label className="mb-1 block text-xs text-gray-600">First Name *</label>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600">Last Name *</label>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600">Email</label>
        <input
          type="email"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600">Phone</label>
        <input
          type="tel"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-600">Job Title</label>
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-sm"
          value={form.job_title}
          onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-2 md:col-span-2">
        <input
          id="primary_status"
          type="checkbox"
          className="h-4 w-4"
          checked={form.primary_status}
          onChange={(e) => setForm((f) => ({ ...f, primary_status: e.target.checked }))}
        />
        <label htmlFor="primary_status" className="text-sm text-gray-700">
          Select primary contact
        </label>
      </div>

      <div className="md:col-span-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn-secondary rounded-lg px-4 py-2"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={!canSave || saving}
        >
          {saving ? "Saving..." : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
