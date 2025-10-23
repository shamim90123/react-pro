// Components/leads/ProductsSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function ProductsSection({
  products = [],
  loading = false,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  onSave,
}) {
  const [q, setQ] = useState("");

  const total = products.length || 0;
  const filtered = useMemo(() => {
    if (!q?.trim()) return products;
    const needle = q.toLowerCase();
    return products.filter((p) =>
      String(p.name || p.title || p.id).toLowerCase().includes(needle)
    );
  }, [products, q]);

  const selectedCount = selectedIds?.size || 0;
  const isIndeterminate =
    selectedCount > 0 && selectedCount < filtered.length;

  // Manage indeterminate state for "Select All"
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const canSave = useMemo(() => selectedCount > 0, [selectedCount]);

  return (
    <section className="mt-10 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      {/* Header Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Products</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-56 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
            {q && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setQ("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Count summary */}
          <span className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700">
            {loading ? "Loading…" : `${filtered.length}/${total}`}
          </span>

          {/* Select All */}
          <label className="inline-flex items-center gap-2 select-none">
            <input
              ref={selectAllRef}
              type="checkbox"
              className="h-4 w-4 accent-indigo-600"
              checked={filtered.length > 0 && allSelected}
              onChange={onToggleAll}
              disabled={loading || filtered.length === 0}
            />
            <span className="text-sm font-medium text-gray-700">
              Select All
            </span>
          </label>
        </div>
      </div>

      {/* Product Grid */}
      <div
        className="
          grid gap-3
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
        "
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 mb-3" />
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))
          : filtered.length > 0
          ? filtered.map((p) => {
              // const checked = selectedIds.has(p.id);
              const checked = selectedIds.has(String(p.id));

              return (
                <label
                  key={p.id}
                  className={[
                    "group relative flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition",
                    checked
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-indigo-600"
                    checked={checked}
                    onChange={() => onToggle(p.id)}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium text-gray-900">
                      {p.name || p.title || `#${p.id}`}
                    </span>
                    {p.code || p.sku ? (
                      <span className="truncate text-xs text-gray-500 mt-0.5">
                        {p.code || p.sku}
                      </span>
                    ) : null}
                  </div>
                </label>
              );
            })
          : (
            <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No products found.
            </div>
          )}
      </div>

      {/* Footer Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSave}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSave || loading}
        >
          Save Selected Products ({selectedCount})
        </button>
      </div>
    </section>
  );
}
