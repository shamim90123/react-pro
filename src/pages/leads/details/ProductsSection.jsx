// src/components/leads/ProductsSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function ProductsSection({
  products = [],
  loading = false,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  onSave,          // parent save handler
  stages = [],
  users = [],
  edits = {},      // per-product draft edits: { [productId]: {...} }
  onEditField,     // (pid, patch) => void
  contacts = [],
  demoBooks = [],
}) {
  const [q, setQ] = useState("");
  const [dateErrors, setDateErrors] = useState(() => new Set()); // productIds missing required date

  // --- search ---
  const filtered = useMemo(() => {
    if (!q?.trim()) return products;
    const needle = q.toLowerCase();
    return products.filter((p) =>
      String(p.name || p.title || p.id).toLowerCase().includes(needle)
    );
  }, [products, q]);

  const total = products.length || 0;
  const selectedCount = selectedIds?.size || 0;

  // --- select-all (indeterminate) ---
  const selectAllRef = useRef(null);
  const isIndeterminate = selectedCount > 0 && selectedCount < filtered.length;
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // --- options ---
  const stageOptions = useMemo(
    () => stages.map((s) => ({ value: String(s.id), label: s.name || s.title || `#${s.id}` })),
    [stages]
  );
  const userOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: u.name })),
    [users]
  );

  // Accepts Date | string | null and returns 'YYYY-MM-DD' or ''
  const toYMD = (val) => {
    if (!val) return "";
    if (val instanceof Date) {
      return new Date(val.getFullYear(), val.getMonth(), val.getDate()).toLocaleDateString("en-CA");
    }
    const s = String(val).trim();

    // 'YYYY-MM-DD'
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // 'YYYY-MM-DD HH:MM:SS' or 'YYYY/MM/DD ...'
    const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;

    // Fallback ISO parse
    const d = new Date(s.replace(" ", "T"));
    if (!isNaN(d)) return d.toLocaleDateString("en-CA");

    return "";
  };

  // Demo book options (status=active only) with "requiresDate" derived from date_require
  const demoBookOptions = useMemo(
    () =>
      demoBooks
        .filter((d) => (d?.status || "").toLowerCase() === "active")
        .map((d) => ({
          value: String(d.id),
          label: d.name || d.title || `#${d.id}`,
          requiresDate: !!d.date_require,
        })),
    [demoBooks]
  );

  const findDemoOpt = (id) => demoBookOptions.find((o) => o.value === String(id));

  // One-time normalisation for any preloaded datetimes in edits
  useEffect(() => {
    if (!filtered.length) return;
    filtered.forEach((p) => {
      const pid = String(p.id);
      const row = edits[pid];
      if (!row) return;
      const norm = toYMD(row.demo_book_date);
      if (row.demo_book_date && norm !== row.demo_book_date) {
        onEditField(pid, { demo_book_date: norm });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // --- validation helpers ---
  const isRowMissingRequiredDate = (pid) => {
    const row = edits[pid] || {};
    const opt = findDemoOpt(row.demo_book_id);
    if (!opt?.requiresDate) return false;
    const val = toYMD(row.demo_book_date);
    return !val;
  };

  // recompute dateErrors when inputs change (lightweight sync)
  useEffect(() => {
    const next = new Set();
    selectedIds.forEach((pidRaw) => {
      const pid = String(pidRaw);
      if (isRowMissingRequiredDate(pid)) next.add(pid);
    });
    setDateErrors(next);
  }, [selectedIds, edits, demoBookOptions]);

  const hasMissingRequiredDates = dateErrors.size > 0;
  const canSave = selectedCount > 0 && !hasMissingRequiredDates && !loading;

  // --- save with validation ---
  const handleSave = () => {
    // final guard before delegating to parent onSave
    const offenders = [];
    selectedIds.forEach((pidRaw) => {
      const pid = String(pidRaw);
      if (isRowMissingRequiredDate(pid)) offenders.push(pid);
    });

    if (offenders.length) {
      setDateErrors(new Set(offenders));
      // You can also show a toast here, if you have a global alert system in this component.
      return;
    }
    onSave?.(); // pass through if valid
  };

  return (
    <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {q && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setQ("")}
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Count */}
          <span className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700">
            {loading ? "Loading…" : `${filtered.length}/${total}`}
          </span>

          {/* Select All (for filtered rows) */}
          <label className="inline-flex items-center gap-2 select-none">
            <input
              ref={selectAllRef}
              type="checkbox"
              className="h-4 w-4 accent-indigo-600"
              checked={filtered.length > 0 && allSelected}
              onChange={onToggleAll}
              disabled={loading || filtered.length === 0}
            />
            <span className="text-sm font-medium text-gray-700">Select All</span>
          </label>
        </div>
      </div>

      {/* Validation banner */}
      {hasMissingRequiredDates && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Some selected products require a <span className="font-medium">Demo date</span>. Please select the date to continue.
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="w-10 px-3 py-2 text-left"></th>
              <th className="px-3 py-2 text-left font-semibold">Account Manager</th>
              <th className="px-3 py-2 text-left font-semibold">Product</th>
              <th className="px-3 py-2 text-left font-semibold">Stage</th>
              <th className="px-3 py-2 text-left font-semibold">Demo Book</th>
              <th className="px-3 py-2 text-left font-semibold">Contact</th>
              <th className="px-3 py-2 text-left font-semibold">Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="px-3 py-3"><div className="h-4 w-4 animate-pulse rounded bg-gray-200" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-48 animate-pulse rounded bg-gray-200" /></td>
                    <td className="px-3 py-3"><div className="h-8 w-48 animate-pulse rounded bg-gray-200" /></td>
                    <td className="px-3 py-3"><div className="h-8 w-48 animate-pulse rounded bg-gray-200" /></td>
                  </tr>
                ))
              : filtered.length > 0
              ? filtered.map((p) => {
                  const pid = String(p.id);
                  const checked = selectedIds.has(pid);
                  const row = edits[pid] || {};
                  const stageVal = row.sales_stage_id ?? "";
                  const amVal = row.account_manager_id ?? "";
                  const contactVal = row.contact_id ?? "";
                  const demoBookVal = row.demo_book_id ?? "";
                  const selectedDemoOpt = findDemoOpt(demoBookVal);
                  const requiresDate = !!selectedDemoOpt?.requiresDate;
                  const dateVal = toYMD(row.demo_book_date);
                  const showDateError = checked && requiresDate && dateErrors.has(pid);

                  return (
                    <tr key={pid} className={checked ? "bg-indigo-50/40" : "bg-white"}>
                      {/* Select */}
                      <td className="px-3 py-2 align-top">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-indigo-600"
                          checked={checked}
                          onChange={() => onToggle(pid)}
                        />
                      </td>

                      {/* Account Manager */}
                      <td className="px-3 py-2 align-top">
                        <select
                          className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          value={amVal}
                          onChange={(e) => onEditField(pid, { account_manager_id: e.target.value })}
                          disabled={!checked}
                        >
                          <option value="">Select manager</option>
                          {userOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Product info */}
                      <td className="px-3 py-2 align-top">
                        <div className="max-w-[380px]">
                          <div className="truncate font-medium text-gray-900">
                            {p.name || p.title || `#${p.id}`}
                          </div>
                          {(p.code || p.sku) && (
                            <div className="truncate text-xs text-gray-500 mt-0.5">
                              {p.code || p.sku}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="px-3 py-2 align-top">
                        <select
                          className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          value={stageVal}
                          onChange={(e) => onEditField(pid, { sales_stage_id: e.target.value })}
                          disabled={!checked}
                        >
                          <option value="">Select stage</option>
                          {stageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Demo Book (with conditional date) */}
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-2">
                          <select
                            className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                            value={demoBookVal}
                            onChange={(e) => {
                              const value = e.target.value;
                              // don't auto-set any date; just clear error state recalculated by effect
                              onEditField(pid, {
                                demo_book_id: value,
                                // if the newly selected demo book doesn't require date, clear any existing date
                                demo_book_date: findDemoOpt(value)?.requiresDate ? toYMD(row.demo_book_date) : "",
                              });
                            }}
                            disabled={!checked}
                          >
                            <option value="">Select Demo Book</option>
                            {demoBookOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}{opt.requiresDate ? " (date required)" : ""}
                              </option>
                            ))}
                          </select>

                          {requiresDate && (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600 whitespace-nowrap">Demo date</label>
                              <div className="flex flex-col">
                                <input
                                  type="date"
                                  className={
                                    "w-40 rounded-md border bg-white px-2 py-1 text-sm outline-none focus:ring-2 disabled:opacity-60 cursor-pointer " +
                                    (showDateError
                                      ? "border-red-400 focus:ring-red-100"
                                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-100")
                                  }
                                  value={dateVal}
                                  onChange={(e) =>
                                    onEditField(pid, { demo_book_date: toYMD(e.target.value) })
                                  }
                                  onClick={(e) => {
                                    if (typeof e.target.showPicker === "function") e.target.showPicker();
                                  }}
                                  disabled={!checked}
                                  aria-invalid={showDateError || undefined}
                                />
                                {showDateError && (
                                  <span className="mt-1 text-xs text-red-600">Date is required.</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-2 align-top">
                        <select
                          className="w-48 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          value={contactVal}
                          onChange={(e) => onEditField(pid, { contact_id: e.target.value })}
                          disabled={!checked}
                        >
                          <option value="">Select contact</option>
                          {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>{contact.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="px-3 py-2 align-top">
                        <textarea
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          value={row.notes || ""}
                          onChange={(e) => onEditField(pid, { notes: e.target.value })}
                          disabled={!checked}
                          rows={2}
                        />
                      </td>
                    </tr>
                  );
                })
              : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-3 py-3">
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSave}
            title={hasMissingRequiredDates ? "Please fill required demo dates" : undefined}
          >
            Save Selected Products ({selectedCount})
          </button>
        </div>
      </div>
    </section>
  );
}
