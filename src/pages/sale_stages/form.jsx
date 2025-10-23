// src/pages/products/form.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SaleStageApi } from "@/services/SaleStages"; // Import Products API

const ProductFormPage = () => {
  const { id } = useParams(); // For editing a Sale stage
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", status: "active" });

  useEffect(() => {
    if (id) {
      // Fetch the existing Sale stage data if we're editing
      const fetchProduct = async () => {
        try {
          const data = await SaleStageApi.show(id); // Use SaleStageApi to fetch Sale stage data
          setForm(data);
        } catch (error) {
          console.error("Error fetching Sale stage data:", error);
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
      if (id) {
        // For edit, update the Sale stage
        await SaleStageApi.update(id, form); 
      } else {
        // For add, create a new Sale stage
        await SaleStageApi.create(form); 
      }

      navigate("/sale-stages"); // Navigate back to the Sale stage list page
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving Sale stage data. Please try again.");
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{id ? "Edit" : "Add"} Sale Stage</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4 space-x-4">
          {/* Sale Stage Name Field */}
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-2">Sale Stage Name</label>
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
            {id ? "Save Changes" : "Add Sale Stage"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
