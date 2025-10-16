function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-3 py-2"
    />
  );
}

export default function ContactForm({ form, submitting, onFieldChange, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input value={form.name} onChange={(v) => onFieldChange("name", v)} placeholder="Contact Name" />
        <Input value={form.email} onChange={(v) => onFieldChange("email", v)} placeholder="Contact Email" />
        <Input value={form.phone} onChange={(v) => onFieldChange("phone", v)} placeholder="Phone" />
        <Input value={form.job_title} onChange={(v) => onFieldChange("job_title", v)} placeholder="Job Title" />
        <Input value={form.department} onChange={(v) => onFieldChange("department", v)} placeholder="Department" />
        <Input value={form.primary_status} onChange={(v) => onFieldChange("primary_status", v)} placeholder="Primary Status" />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
