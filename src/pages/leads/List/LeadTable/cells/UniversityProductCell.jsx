// components/leads/table/InlineLeadProductMatrix.jsx
import { useEffect, useMemo, useState } from "react";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { LeadsApi } from "../../../api/leadsApi";
import { SaleStageApi } from "@/services/SaleStages";
import { DemoBookApi } from "@/services/DemoBook";

/**
 * InlineLeadProductMatrix
 * Shows editable rows of product links with Sales Stage, AM, Contact, and optional Demo Book Date
 */
export default function InlineLeadProductMatrix({ lead, users = [], onClose, onSaveAll }) {
  const leadId = lead?.id;

  const [rows, setRows] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [demoBooks, setDemoBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes, sRes, demoRes] = await Promise.all([
          LeadsApi.getProducts(leadId),
          LeadsApi.get(leadId),
          SaleStageApi.list(),
          DemoBookApi.list(),
        ]);
        setRows(normalizeProducts(pRes?.data || []));
        setStages(sRes || []);
        setContacts(cRes.contacts || []);
        setDemoBooks(demoRes || []);
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

  const getTodayLocal = () => {
    // Local yyyy-mm-dd (avoids timezone shift issues)
    return new Date().toLocaleDateString("en-CA");
  };

  // Note: demoBooks have `date_require`, not `demo_book_date`
  const demoBookOptions = useMemo(
    () =>
      demoBooks.map((s) => ({
        value: String(s.id),
        label: s.name || s.title || `#${s.id}`,
        requiresDate: !!s.date_require, // true if date required
      })),
    [demoBooks]
  );

  const updateRow = (productId, patch) => {
    setRows((rs) => rs.map((r) => (String(r.id) === String(productId) ? { ...r, ...patch } : r)));
  };

  const handleSaveAll = async () => {
    if (!rows.length) return onClose?.();

    setSavingAll(true);
    try {
      const items = rows.map((r) => ({
        product_id: r.id,
        sales_stage_id: r.sales_stage_id || null,
        account_manager_id: r.account_manager_id || null,
        contact_id: r.contact_id || null,
        notes: r.notes || null,
        demo_book_id: r.demo_book_id || null,
        demo_book_date: r.demo_book_date || null,
      }));

      if (onSaveAll) {
        await onSaveAll({ leadId, items });
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

  const rowNeedsDemoDate = (row) => {
    if (!row.demo_book_id) return false;
    const opt = demoBookOptions.find((o) => o.value === String(row.demo_book_id));
    return !!opt?.requiresDate;
  };

  return (
    <div className="w-full">
      <div className="overflow-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full table-fixed text-sm">
          {/* Consistent column widths for clean alignment */}
          <colgroup>
            <col className="w-[18%]" /> {/* AM */}
            <col className="w-[20%]" /> {/* Product */}
            <col className="w-[16%]" /> {/* Stage */}
            <col className="w-[22%]" /> {/* Book Demo */}
            <col className="w-[14%]" /> {/* Contact */}
            <col className="w-[10%]" /> {/* Note */}
          </colgroup>

          <thead className="bg-gray-50 text-xs uppercase text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold align-middle">Account Manager</th>
              <th className="px-3 py-2 text-left font-semibold align-middle">Product</th>
              <th className="px-3 py-2 text-left font-semibold align-middle">Stage</th>
              <th className="px-3 py-2 text-left font-semibold align-middle">Book Demo</th>
              <th className="px-3 py-2 text-left font-semibold align-middle">Contact</th>
              <th className="px-3 py-2 text-left font-semibold align-middle">Note</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={`sk-${i}`} className="bg-white">
                  <td className="px-3 py-2 align-middle">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((r, idx) => (
                <tr key={r.id ?? idx} className="bg-white">
                  {/* Account Manager */}
                  <td className="px-3 py-2 align-middle">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.account_manager_id ?? ""}
                      onChange={(e) => updateRow(r.id, { account_manager_id: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select manager</option>
                      {userOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Product */}
                  <td className="px-3 py-2 align-middle text-gray-800">
                    <div className="truncate" title={r.name || r.title || `#${r.id}`}>
                      {r.name || r.title || `#${r.id}`}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="px-3 py-2 align-middle">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.sales_stage_id ?? ""}
                      onChange={(e) => updateRow(r.id, { sales_stage_id: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select stage</option>
                      {stageOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Book Demo */}
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col gap-2">
                      <select
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        value={r.demo_book_id ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const requiresDate =
                            demoBookOptions.find((o) => o.value === String(value))?.requiresDate ?? false;

                          updateRow(r.id, {
                            demo_book_id: value,
                            demo_book_date: requiresDate ? (r.demo_book_date || getTodayLocal()) : "",
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Select option</option>
                        {demoBookOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                            {opt.requiresDate ? " (date required)" : ""}
                          </option>
                        ))}
                      </select>

                      {rowNeedsDemoDate(r) && (
                        <div
                          className="flex items-center gap-2"
                          style={{ position: "relative", zIndex: 40 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="text-xs text-gray-600 whitespace-nowrap">Demo date</label>

                          {(() => {
                            const inputId = `demo-date-${r.id}`;
                            return (
                              <input
                                id={inputId}
                                type="date"
                                className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                                value={r.demo_book_date || ""}
                                onChange={(e) => updateRow(r.id, { demo_book_date: e.target.value })}
                                // IMPORTANT: open only on user click to avoid NotAllowedError
                                onClick={(e) => {
                                  if (typeof e.target.showPicker === "function") {
                                    e.target.showPicker();
                                  }
                                }}
                                style={{ position: "relative", zIndex: 50 }}
                              />
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-3 py-2 align-middle">
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.contact_id ?? ""}
                      onChange={(e) => updateRow(r.id, { contact_id: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select Contact</option>
                      {contactOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Notes */}
                  <td className="px-3 py-2 align-middle">
                    <textarea
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={r.notes || ""}
                      onChange={(e) => updateRow(r.id, { notes: e.target.value })}
                      rows={2}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-gray-400" colSpan={6}>
                  No products found for this University
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom actions */}
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
  // Accepts Date | string | null and returns 'YYYY-MM-DD' or ''
  const toYMD = (val) => {
    if (!val) return "";
    if (val instanceof Date)
      return new Date(val.getFullYear(), val.getMonth(), val.getDate()).toLocaleDateString("en-CA");

    const s = String(val).trim();

    // already correct
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // handle 'YYYY-MM-DD HH:MM:SS' (MySQL) or 'YYYY/MM/DD ...'
    const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;

    // try generic parse (ISO etc.)
    const d = new Date(s.replace(" ", "T"));
    if (!isNaN(d)) return d.toLocaleDateString("en-CA");

    return "";
  };

  return items.map((p) => {
    const stage = p.sales_stage_id ?? p.stage_id ?? p?.pivot?.sales_stage_id ?? null;
    const am = p.account_manager_id ?? p?.pivot?.account_manager_id ?? null;
    const contact = p.contact_id ?? p?.pivot?.contact_id ?? null;
    const bookDemo = p.demo_book_id ?? p?.pivot?.demo_book_id ?? null;
    const demoDateRaw = p.demo_book_date ?? p?.pivot?.demo_book_date ?? null;
    const notes = p.notes ?? p?.pivot?.notes ?? null;

    return {
      id: p.id,
      name: p.name || p.title,
      sales_stage_id: stage ? String(stage) : "",
      account_manager_id: am ? String(am) : "",
      contact_id: contact ? String(contact) : "",
      demo_book_id: bookDemo ? String(bookDemo) : "",
      demo_book_date: toYMD(demoDateRaw),
      notes: notes || "",
    };
  });
}
