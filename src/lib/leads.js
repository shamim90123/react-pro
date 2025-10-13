// src/lib/leads.js
import api from "./api";

export const LeadsApi = {
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get("/leads", {
      params: { page, per_page: perPage, ...(q ? { q } : {}) },
    });
    // Laravel paginator usually returns an object { data, meta, links, ... }
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/leads", payload);
    return res.data; // lead object (your previous comment)
  },

  remove: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    // could be 204 No Content or a body; support both:
    return res.status === 204 ? null : res.data;
  },
};
