// src/pages/leads/LeadSearchPanel.jsx
import UniversitySelect from "@/components/ui/UniversitySelect";
import DestinationSelect from "@/components/ui/DestinationSelect";

/**
 * Compact, one-line search panel for LeadList
 */
export default function LeadSearchPanel({
  uniOptions = [],
  countries = [],
  leadName,
  setLeadName,
  status,
  setStatus,
  destinationId,
  setDestinationId,
  onApply,
  onReset,
}) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        {/* University */}
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            University
          </label>
          <UniversitySelect
            universities={uniOptions}
            valueName={leadName}
            onChangeName={(v) => setLeadName(v ?? "")}
            placeholder="Select University"
          />
        </div>

        {/* Destination */}
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Country
          </label>
          <DestinationSelect
            countries={countries}
            valueId={destinationId || null}
            onChangeId={(v) => setDestinationId(v ?? "")}
          />
        </div>

        {/* Status */}
        <div className="w-[150px]">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-[9px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="2">On Hold</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="ml-auto flex items-center gap-2 pb-[2px]">
          <button
            onClick={onApply}
            className="btn-filter"
          >
            Filter
          </button>
          <button
            onClick={onReset}
            className="btn-reset"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
