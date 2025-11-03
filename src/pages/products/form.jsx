import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductsApi } from "@/services/products";

const initialForm = { 
  name: "", 
  status: "active",
  image: null 
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const title = id ? "Edit Product" : "Add Product";
  const canSave = useMemo(() => form.name.trim().length > 0 && !saving, [form.name, saving]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ProductsApi.show(id);
        setForm({
          name: data?.name ?? "",
          status: data?.status ?? "active",
          image: null
        });
        
        // Set image preview if product has an image
        if (data?.image_url) {
          setImagePreview(data.image_url);
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setForm((prev) => ({ ...prev, image: file }));
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setSaving(true);
      setError("");
      
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('status', form.status);
      
      // Append image if selected
      if (form.image) {
        payload.append('image', form.image);
      }

      if (id) {
        await ProductsApi.update(id, payload);
      } else {
        await ProductsApi.create(payload);
      }

      navigate("/products");
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.error || "Error saving product. Please try again.");
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/products");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in the product details below.</p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-medium text-gray-900">Product Details</h2>
        </div>

        <div className="px-5 py-6">
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="col-span-2 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Product Name */}
                <div className="col-span-1">
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. English Foundation Program"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter a unique product name.</p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Inactive products will not be available in listings.
                  </p>
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-32 w-32 rounded-lg border border-gray-300 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Upload Area */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-3">
                        <label
                          htmlFor="image"
                          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            imagePreview ? 'sm:py-4' : 'py-12'
                          }`}
                        >
                          <svg
                            className="mb-2 h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {imagePreview ? 'Change image' : 'Upload image'}
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF, WebP up to 5MB
                          </span>
                        </label>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        
                        {!imagePreview && (
                          <p className="text-xs text-gray-500">
                            Optional: Add a product image for better presentation
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSave}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      {form.image ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : id ? (
                    "Save Changes"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}