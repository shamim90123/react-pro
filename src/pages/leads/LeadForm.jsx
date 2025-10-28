import CountrySelect from "@/components/ui/CountrySelect";

export default function LeadForm({
  form,
  submitting,
  onChange,
  onCancel,
  onSubmit,
  countries,
}) {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-wrap items-center gap-4 bg-white p-6 shadow-md">
      <div className="min-w-[200px] flex-1">
        <input
          value={form.lead_name}
          onChange={(e) => onChange("lead_name", e.target.value)}
          placeholder="University Name"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <input
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="City"
          className="h-10 w-full rounded-lg border border-gray-300 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <CountrySelect
          countries={countries}
          valueId={form.destination_id}
          onChangeId={(v) => onChange("destination_id", v)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`duration-200 ${
            submitting
              ? "cursor-not-allowed"
              : ""
          }`}
        >
          {submitting ? "Saving…" : form.lead_id ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
