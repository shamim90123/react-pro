// src/pages/products/form.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductsApi } from "@/lib/products"; // Import Products API

const ProductFormPage = () => {
  const { id } = useParams(); // For editing a product
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", status: "active" });

  useEffect(() => {
    if (id) {
      // Fetch the existing product data if we're editing
      const fetchProduct = async () => {
        try {
          const data = await ProductsApi.show(id); // Use ProductsApi to fetch product data
          setForm(data);
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = id ? "update" : "create";
      if (id) {
        // For edit, update the product
        await ProductsApi.update(id, form); 
      } else {
        // For add, create a new product
        await ProductsApi.create(form); 
      }

      navigate("/product-setup"); // Navigate back to the product list page
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{id ? "Edit" : "Add"} Product</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4 space-x-4">
          {/* Product Name Field */}
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Status Field */}
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-lg"
          >
            {id ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
