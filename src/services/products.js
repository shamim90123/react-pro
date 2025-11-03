// src/services/products.js

import api from "./api";

const BASE = "/api/v1/products";

export const ProductsApi = {
  // Fetch all products with pagination and search query
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, { 
      params: { page, per_page: perPage, ...(q ? { q } : {}) } 
    });
    return res.data;
  },

  // Create a new product with image
  create: async (payload) => {
    const res = await api.post(BASE, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Fetch details of a specific product by ID
  show: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

// Update an existing product by ID with image
update: async (id, payload) => {
  // For file uploads, use POST with _method=PUT
  if (payload instanceof FormData) {
    payload.append('_method', 'PUT');
    const res = await api.post(`${BASE}/${id}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } else {
    // For regular JSON updates, use PUT
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  }
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