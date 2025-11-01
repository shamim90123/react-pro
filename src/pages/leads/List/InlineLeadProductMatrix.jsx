// components/leads/table/InlineLeadProductMatrix.jsx
import { useEffect, useMemo, useState } from "react";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { LeadsApi } from "../services/leads";
import { SaleStageApi } from "@/services/SaleStages";

/**
 * Product-wise editable matrix with a single bulk Save/Cancel at the bottom.
 * - Each product row: Sales Stage, Account Manager (editable)
 * - Buttons below the table
 *
 * Props:
 *  - lead: { id }
 *  - users: [{ id, name }]
 *  - onClose: () => void
 *  - onSaveAll?: async ({ leadId, items: [{ productId, stageId, accountManagerId }] }) => void
 */
export default function InlineLeadProductMatrix({ lead, users = [], onClose, onSaveAll }) {
  const leadId = lead?.id;

  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes, sRes] = await Promise.all([
          LeadsApi.getProducts(leadId),
          LeadsApi.get(leadId),
          SaleStageApi.list(),
        ]);
        setRows(normalizeProducts(pRes?.data || []));
        setStages(sRes || []);
        setContacts(cRes.contacts || []);
      } catch (err) {
        console.error(err);
        SweetAlert.error("Failed to load products/stages");
      } finally {
        setLoading(false);
      }
    };
    if (leadId) load();
  }, [leadId]);

  const userOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: u.name })),
    [users]
  );

  const stageOptions = useMemo(
    () => stages.map((s) => ({ value: String(s.id), label: s.name || s.title || `#${s.id}` })),
    [stages]
  );

  const contactOptions = useMemo(
    () => contacts.map((s) => ({ value: String(s.id), label: s.name || s.title || `#${s.id}` })),
    [contacts]
  );

  const updateRow = (productId, patch) => {
    setRows((rs) =>
      rs.map((r) => (String(r.id) === String(productId) ? { ...r, ...patch } : r))
    );
  };

  const handleSaveAll = async () => {
    if (!rows.length) {
      onClose?.();
      return;
    }
    setSavingAll(true);
    try {
         const items = rows.map((r) => ({
          product_id: r.id,
          sales_stage_id: r.sales_stage_id || null,
          account_manager_id: r.account_manager_id || null,
          notes: r.notes || null,
          contact_id: r.contact_id || null,
        }));

   if (onSaveAll) {
    await onSaveAll({ leadId, items }); // optional external handler
   } else {
    await LeadsApi.bulkUpdateProductLinks(leadId, items);
   }
      SweetAlert.success("Changes saved");
      onClose?.();
    } catch (err) {
      console.error(err);
      SweetAlert.error(err?.message || "Failed to save changes");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              {/* <th className="px-3 py-2 text-left font-semibold">#</th> */}
              <th className="px-3 py-2 text-left font-semibold">Account Manager</th>
              <th className="px-3 py-2 text-left font-semibold">Product</th>
              <th className="px-3 py-2 text-left font-semibold">Sales Stage</th>
              <th className="px-3 py-2 text-left font-semibold">Contact</th>
              <th className="px-3 py-2 text-left font-semibold">Note</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td className="px-3 py-2"><div className="h-4 w-6 animate-pulse rounded bg-gray-200" /></td>
                  <td className="px-3 py-2"><div className="h-4 w-40 animate-pulse rounded bg-gray-200" /></td>
                  <td className="px-3 py-2"><div className="h-8 w-40 animate-pulse rounded bg-gray-200" /></td>
                  <td className="px-3 py-2"><div className="h-8 w-40 animate-pulse rounded bg-gray-200" /></td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((r, idx) => (
                <tr key={r.id ?? idx} className="bg-white">
                  {/* <td className="px-3 py-2 text-gray-600">{idx + 1}</td> */}
                   {/* Account Manager */}
                  <td className="px-3 py-2">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.account_manager_id ?? ""}
                      onChange={(e) => updateRow(r.id, { account_manager_id: e.target.value })}
                    >
                      <option value="">Select manager</option>
                      {userOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2 text-gray-800">{r.name || r.title || `#${r.id}`}</td>

                  {/* Sales Stage */}
                  <td className="px-3 py-2">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.sales_stage_id ?? ""}
                      onChange={(e) => updateRow(r.id, { sales_stage_id: e.target.value })}
                    >
                      <option value="">Select stage</option>
                      {stageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.contact_id ?? ""}
                      onChange={(e) => updateRow(r.id, { contact_id: e.target.value })}
                    >
                      <option value="">Select Contact</option>
                      {contactOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* notes */}
                  <td className="px-3 py-2">
                   <textarea
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.notes || ""}
                      onChange={(e) => updateRow(r.id, { notes: e.target.value })}
                      rows={2}
                    />

                  </td>


                 
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-gray-400" colSpan={4}>
                  No products found for this University
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom actions (right aligned) */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-3 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary disabled:opacity-60"
            disabled={savingAll}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="btn-primary disabled:opacity-60"
            // disabled={savingAll}
            // rows.length
            disabled={savingAll || rows.length === 0}
          >
            {savingAll ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Normalize possible product link shapes from API */
function normalizeProducts(items) {
  return items.map((p) => {
    const stage = p.sales_stage_id ?? p.stage_id ?? p?.pivot?.sales_stage_id ?? null;
    const am = p.account_manager_id ?? p?.pivot?.account_manager_id ?? null;
    const contact = p.contact_id ?? p?.pivot?.contact_id ?? null;
    const notes = p.notes ?? p?.pivot?.notes ?? null;
    return {
      id: p.id,
      name: p.name || p.title,
      sales_stage_id: stage ? String(stage) : "",
      account_manager_id: am ? String(am) : "",
      contact_id: contact ? String(contact) : "",
      notes: notes || "",
    };
  });
}
