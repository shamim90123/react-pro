import { useEffect, useMemo, useState } from "react";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required = false,
  name,
  maxLength,
  autoComplete,
}) {
  const ariaId = useMemo(
    () => `${name || label}`.toLowerCase().replace(/\s+/g, "-"),
    [name, label]
  );

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={ariaId}
          className="block text-xs font-semibold uppercase tracking-wide text-gray-600"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={ariaId}
        name={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${ariaId}-error` : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        }`}
      />
      {error ? (
        <p id={`${ariaId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-gray-400">
          {maxLength ? `${value?.length || 0}/${maxLength}` : "\u00A0"}
        </p>
      )}
    </div>
  );
}

export default function ContactForm({
  form,
  submitting,
  onFieldChange,
  onCancel,
  onSubmit,
}) {
  const [errors, setErrors] = useState({});

  // live validate on key fields
  useEffect(() => {
    // only validate touched on submit; keeping light here
  }, [form]);

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = "Name is required.";
    if (form.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(form.email))
      e.email = "Invalid email format.";
    if (form.phone && !/^[0-9+\-() ]{6,20}$/.test(form.phone))
      e.phone = "Invalid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (validate()) onSubmit(ev);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Hidden ids for edit mode */}
      <input type="hidden" name="id" value={form.id ?? ""} />
      <input type="hidden" name="lead_id" value={form.lead_id ?? ""} />

      {/* Title row */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {form.id ? "Edit Contact" : "Contact Information"}
        </h3>

        {/* Primary toggle */}
        <label className="inline-flex select-none items-center gap-2">
          <input
            id="is_primary"
            type="checkbox"
            checked={!!form.is_primary}
            onChange={(e) => onFieldChange("is_primary", e.target.checked)}
            className="peer sr-only"
          />
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
              form.is_primary
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
            ].join(" ")}
          >
            {form.is_primary ? "Primary" : "Set as Primary"}
          </span>
        </label>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-1">
          <Field
            label="Contact Name"
            name="name"
            required
            value={form.name}
            onChange={(v) => onFieldChange("name", v)}
            placeholder="e.g., Maria Khan"
            error={errors.name}
            maxLength={120}
            autoComplete="name"
          />
        </div>

        <div className="sm:col-span-1">
          <Field
            label="Contact Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(v) => onFieldChange("email", v)}
            placeholder="name@example.com"
            error={errors.email}
            maxLength={120}
            autoComplete="email"
          />
        </div>

        <div className="sm:col-span-1">
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(v) => onFieldChange("phone", v)}
            placeholder="+61 4xx xxx xxx"
            error={errors.phone}
            maxLength={20}
            autoComplete="tel"
          />
        </div>

        <div className="sm:col-span-1">
          <Field
            label="Job Title"
            name="job_title"
            value={form.job_title}
            onChange={(v) => onFieldChange("job_title", v)}
            placeholder="e.g., Admissions Manager"
            maxLength={120}
          />
        </div>

        <div className="sm:col-span-1">
          <Field
            label="Designation"
            name="department"
            value={form.department}
            onChange={(v) => onFieldChange("department", v)}
            placeholder="e.g., International Office"
            maxLength={120}
          />
        </div>

        {/* spacer to balance grid if needed */}
        <div className="hidden lg:block" />
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : form.id ? "Update Contact" : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
