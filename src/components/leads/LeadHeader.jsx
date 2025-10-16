export default function LeadHeader({ lead, onAddContact }) {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">{lead.lead_name}</h1>
      </div>

      <table className="min-w-full table-auto">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">City</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">{lead.city || "—"}</td>
            <td className="px-4 py-2">{lead.email || "—"}</td>
            <td className="px-4 py-2">{lead.phone || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onAddContact}
          className="rounded-lg bg-[#282560] px-4 py-2 text-sm text-white transition-colors hover:opacity-90"
        >
          + Add Contact
        </button>
      </div>
    </div>
  );
}
