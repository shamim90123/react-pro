import { useState } from "react";
import * as XLSX from "xlsx";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { LeadsApi } from "@/services/leads"; // bulkUpsert(rows)

export default function LeadImporterSimple() {
  const [headers, setHeaders] = useState([]);      // dynamic column headers
  const [rows, setRows] = useState([]);            // array of row objects
  const [submitting, setSubmitting] = useState(false);

  // inline edit state
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftRow, setDraftRow] = useState({});

  const onFile = async (file) => {
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" }); // [{...}, {...}]

      // Build header list as union of all keys, preserving first-seen order
      const seen = new Set();
      const hdrs = [];
      json.forEach((r) => {
        Object.keys(r).forEach((k) => {
          if (!seen.has(k)) {
            seen.add(k);
            hdrs.push(k);
          }
        });
      });

      setHeaders(hdrs);
      setRows(json);
      // reset any editing state
      setEditingIndex(null);
      setDraftRow({});
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to read file. Check format and try again.");
    }
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setDraftRow({ ...rows[idx] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraftRow({});
  };

  const saveEdit = () => {
    setRows((prev) => {
      const next = [...prev];
      next[editingIndex] = { ...draftRow };
      return next;
    });
    setEditingIndex(null);
    setDraftRow({});
  };

  const handleDraftChange = (key, value) => {
    setDraftRow((d) => ({ ...d, [key]: value }));
  };

  const handleDeleteRow = (rowIndex) => {
    // if deleting currently edited row, exit edit mode
    if (editingIndex === rowIndex) cancelEdit();
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  const handleSubmit = async () => {
    if (!rows.length) return SweetAlert.error("Nothing to import.");
    if (editingIndex !== null) {
      return SweetAlert.error("Please save or cancel the row being edited first.");
    }
    setSubmitting(true);
    const toastId = SweetAlert.loading?.("Importing...")?.toastId;
    try {
      await LeadsApi.commentBulkUpsert(rows); // send exactly what is shown
      SweetAlert.success(`Imported ${rows.length} records successfully.`);
      setHeaders([]);
      setRows([]);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Import failed");
    } finally {
      setSubmitting(false);
      if (toastId) SweetAlert.dismiss?.(toastId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-lg bg-white shadow p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Comment Importer</h1>

          <a
            href={
              "data:text/csv;charset=utf-8," +
              encodeURIComponent(
                "lead_name,destination,city,notes\n" +
                "University of Essex,GB,Colchester,Sample row\n" +
                "IECC Dhaka,Bangladesh,Dhaka,Second row"
              )
            }
            download="leads-template.csv"
            className="text-sm underline text-gray-600"
          >
            Download template
          </a>
        </div>

        {/* File input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Upload CSV/XLSX</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={(e) => onFile(e.target.files?.[0])}
            className="block w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>

        {/* Preview with per-row edit/delete */}
        {rows.length > 0 && (
          <>
            <div className="text-sm text-gray-600">
              Preview ({rows.length} row{rows.length > 1 ? "s" : ""})
            </div>

            <div className="overflow-auto border rounded-md">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700">
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => {
                    const isEditing = editingIndex === rIdx;
                    return (
                      <tr key={rIdx} className="border-t align-top">
                        {headers.map((key) => (
                          <td key={key} className="px-3 py-2">
                            {isEditing ? (
                              <input
                                value={draftRow[key] ?? ""}
                                onChange={(e) => handleDraftChange(key, e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                              />
                            ) : (
                              <span className="whitespace-pre-wrap">
                                {row[key] !== undefined && row[key] !== null && row[key] !== ""
                                  ? String(row[key])
                                  : "—"}
                              </span>
                            )}
                          </td>
                        ))}

                        <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(rIdx)}
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRow(rIdx)}
                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || rows.length === 0 || editingIndex !== null}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {editingIndex !== null
                  ? "Finish editing first"
                  : submitting
                  ? "Importing..."
                  : "Import"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
