// src/lib/leads.js
import api from "./api";

const BASE = "/api/v1/leads";
const CONTACT_BASE = "/api/v1/leads/{leadId}/contacts"; // Contact API endpoint

export const LeadsApi = {
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, { params: { page, per_page: perPage, ...(q ? { q } : {}) } });
    return res.data; // Laravel paginator (data, meta, links)
  },


    // Add method to fetch a specific lead by ID
  get: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },

  createContact: async (leadId, payload) => {
    const res = await api.post(CONTACT_BASE.replace("{leadId}", leadId), payload);
    return res.data;
  },

  removeContact: async (leadId, contactId) => {
    const res = await api.delete(`${CONTACT_BASE.replace("{leadId}", leadId)}/${contactId}`);
    return res.status === 204 ? null : res.data;
  },
};

