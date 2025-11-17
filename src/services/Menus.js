// src/lib/menus.js
import api from "./api";

const BASE = "/api/v1/menus";

export const MenuApi = {
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, {
      params: { page, per_page: perPage, ...(q ? { q } : {}) }
    });
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  show: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },

  toggleStatus: async (id) => {
    const res = await api.patch(`${BASE}/${id}/status`);
    return res.data;
  },

  // load only active parent menus (for dropdown)
  parents: async () => {
    const res = await api.get(`${BASE}/parents`);
    return res.data;
  }
};
