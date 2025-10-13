// src/lib/leads.js
import api from "./api";

const BASE = "/api/v1/leads";

export const LeadsApi = {
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, { params: { page, per_page: perPage, ...(q ? { q } : {}) } });
    return res.data; // Laravel paginator (data, meta, links)
  },
  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },
};
