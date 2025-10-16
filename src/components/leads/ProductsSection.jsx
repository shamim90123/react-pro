export default function ProductsSection({
  products = [],
  loading = false,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  onSave,
}) {
  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="text-sm text-gray-500">{loading ? "Loading products…" : `${products.length} total`}</div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4" checked={allSelected} onChange={onToggleAll} />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
              </th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Loading…</td>
              </tr>
            ) : products.length ? (
              products.map((p) => {
                const active = p.status === "active" || p.status === 1;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.has(p.id)}
                        onChange={() => onToggle(p.id)}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800">{p.name || p.title || `#${p.id}`}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={selectedIds.size === 0}
        >
          Save Selected Products
        </button>
      </div>
    </section>
  );
}
