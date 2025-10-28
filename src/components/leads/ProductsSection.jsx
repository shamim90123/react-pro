// src/components/leads/ProductsSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function ProductsSection({
  products = [],
  loading = false,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  onSave,
  // per-product settings
  stages = [],
  users = [],
  edits = {},
  onEditField,
}) {
  const [q, setQ] = useState("");

  // search
  const filtered = useMemo(() => {
    if (!q?.trim()) return products;
    const needle = q.toLowerCase();
    return products.filter((p) =>
      String(p.name || p.title || p.id).toLowerCase().includes(needle)
    );
  }, [products, q]);

  const total = products.length || 0;
  const selectedCount = selectedIds?.size || 0;

  // select-all (indeterminate)
  const selectAllRef = useRef(null);
  const isIndeterminate = selectedCount > 0 && selectedCount < filtered.length;
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const canSave = selectedCount > 0;

  const stageOptions = useMemo(
    () => stages.map((s) => ({ value: String(s.id), label: s.name || s.title || `#${s.id}` })),
    [stages]
  );
  const userOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: u.name })),
    [users]
  );

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

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="w-10 px-3 py-2 text-left"></th>
              <th className="px-3 py-2 text-left font-semibold">Product</th>
              <th className="px-3 py-2 text-left font-semibold">Sales Stage</th>
              <th className="px-3 py-2 text-left font-semibold">Account Manager</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="px-3 py-3">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              : filtered.length > 0
              ? filtered.map((p) => {
                  const pid = String(p.id);
                  const checked = selectedIds.has(pid);
                  const row = edits[pid] || {};
                  const stageVal = row.sales_stage_id ?? "";
                  const amVal = row.account_manager_id ?? "";

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
                          onChange={(e) =>
                            onEditField(pid, { sales_stage_id: e.target.value })
                          }
                          disabled={!checked}
                        >
                          <option value="">Select stage</option>
                          {stageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Account Manager */}
                      <td className="px-3 py-2 align-top">
                        <select
                          className="w-56 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          value={amVal}
                          onChange={(e) =>
                            onEditField(pid, {
                              account_manager_id: e.target.value,
                            })
                          }
                          disabled={!checked}
                        >
                          <option value="">Select manager</option>
                          {userOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              : (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
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
            onClick={onSave}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSave || loading}
          >
            Save Selected Products ({selectedCount})
          </button>
        </div>
      </div>
    </section>
  );
}
