import { useNavigate } from "react-router-dom";

export default function LeadHeader({ lead }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-800">{lead.lead_name}</h1>
        <button
          onClick={() => navigate("/lead-list")} // 🔹 update this route if your list path is different
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-800 transition-colors hover:bg-gray-300"
        >
          ← Back to List
        </button>
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
    </div>
  );
}
