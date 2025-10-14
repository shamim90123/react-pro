// src/lib/products.js

import api from "./api";  // This imports the correct axios instance with the base URL

const BASE = "/api/v1/lead_stages";  // This is the correct endpoint, which will be appended to the base URL in api.js

export const ProductsApi = {
  // Fetch all products with pagination and search query (if any)
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, { params: { page, per_page: perPage, ...(q ? { q } : {}) } });
    return res.data; // Laravel paginator (data, meta, links)
  },

  // Create a new product
  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  // Fetch details of a specific product by ID
  show: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  // Update an existing product by ID
  update: async (id, payload) => {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  // Remove a product by ID
  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },

  // Toggle product status (active/inactive)
  toggleStatus: async (id) => {
    const res = await api.patch(`${BASE}/${id}/status`);
    return res.data;
  },
};
