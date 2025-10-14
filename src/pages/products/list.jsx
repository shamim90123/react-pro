import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { ProductsApi } from "@/lib/products"; // Import Products API

export default function ProductList() {
  const navigate = useNavigate();

  // Table state
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState(""); // Search query
  const [debouncedQ, setDebouncedQ] = useState(""); // Debounced search query
  const [loading, setLoading] = useState(true); // Loading state

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch products with search query
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await ProductsApi.list({
          q: debouncedQ || "",
        });

        const items = Array.isArray(data?.data) ? data.data : data || [];
        setRows(items);
      } catch (e) {
        SweetAlert.error(e?.data?.message || e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedQ]);

  // Handle delete product
  const handleDelete = async (id) => {
    const res = await SweetAlert.confirm({
      title: "Delete product?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await ProductsApi.remove(id);
      SweetAlert.success("Product deleted");
      // Reload the products list
      const updatedRows = rows.filter((product) => product.id !== id);
      setRows(updatedRows);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Product List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="w-full sm:w-72 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#282560]"
          />
          <button
            onClick={() => navigate("/product/new")}
            className="px-4 py-2 text-sm text-white bg-[#282560] hover:bg-[#1f1c4d] rounded-lg"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  Loading products…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((product) => (
                <tr key={product.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-3">{product.status}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      className="text-blue-600 hover:underline text-sm mr-3"
                      onClick={() => navigate(`/product/${product.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={3}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
