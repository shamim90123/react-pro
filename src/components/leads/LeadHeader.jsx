import { useNavigate } from "react-router-dom";

export default function LeadHeader({ lead }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          {lead.lead_name || "Unnamed Lead"}
        </h1>

        <button
          onClick={() => navigate("/leads")}
          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          ← Back to List
        </button>
      </div>

      {/* Lead Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase text-gray-500">Destination</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {lead.destination || "—"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase text-gray-500">City</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {lead.city || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
