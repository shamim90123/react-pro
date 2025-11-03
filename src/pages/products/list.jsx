import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { ProductsApi } from "@/services/products";

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
  const handleDelete = async (id, productName) => {
    const res = await SweetAlert.confirm({
      title: "Delete product?",
      text: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      confirmButtonText: "Delete",
    });
    if (!res.isConfirmed) return;

    try {
      await ProductsApi.remove(id);
      SweetAlert.success("Product deleted successfully");
      // Reload the products list
      const updatedRows = rows.filter((product) => product.id !== id);
      setRows(updatedRows);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Delete failed");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus, productName) => {
    try {
      await ProductsApi.toggleStatus(id);
      SweetAlert.success(`Product ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
      
      // Update local state
      const updatedRows = rows.map((product) =>
        product.id === id
          ? { ...product, status: currentStatus === 'active' ? 'inactive' : 'active' }
          : product
      );
      setRows(updatedRows);
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Failed to update status");
    }
  };

  // Product Image Component
  const ProductImage = ({ imageUrl, name }) => {
    return (
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`h-10 w-10 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center ${
            imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
        label: "Active"
      },
      inactive: {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
        label: "Inactive"
      }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => navigate("/products/new")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Product</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : rows?.length ? (
              rows.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ProductImage imageUrl={product.image_url} name={product.name} />
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleStatusToggle(product.id, product.status, product.name)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                          product.status === 'active'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {product.status === 'active' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center" colSpan={3}>
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="h-12 w-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-1">No products found</p>
                    <p className="text-sm mb-4">
                      {debouncedQ ? 'Try adjusting your search terms' : 'Get started by creating your first product'}
                    </p>
                    {!debouncedQ && (
                      <button
                        onClick={() => navigate("/products/new")}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Your First Product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}