// src/lib/leads.js
import api from "./api";

const BASE = "/api/v1/leads";
const CONTACT_BASE = "/api/v1/leads/{leadId}/contacts"; // Contact API endpoint
const COMMENT_BASE = "/api/v1/leads/{leadId}/comments";  // Comment API endpoint

export const LeadsApi = {
  list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    const res = await api.get(BASE, { params: { page, per_page: perPage, ...(q ? { q } : {}) } });
    return res.data; // Laravel paginator (data, meta, links)
  },

  // Fetch a specific lead by ID (includes contacts & comments if your show() loads them)
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

  // ----- Contacts -----
  createContact: async (leadId, payload) => {
    const res = await api.post(CONTACT_BASE.replace("{leadId}", leadId), payload);
    return res.data;
  },

  removeContact: async (leadId, contactId) => {
    const res = await api.delete(`${CONTACT_BASE.replace("{leadId}", leadId)}/${contactId}`);
    return res.status === 204 ? null : res.data;
  },

  // ----- Comments -----
  /**
   * List comments for a lead (paginated).
   * @param {string|number} leadId
   * @param {{ page?: number, perPage?: number }} opts
   */
  listComments: async (leadId, { page = 1, perPage = 10 } = {}) => {
    const url = COMMENT_BASE.replace("{leadId}", leadId);
    const res = await api.get(url, { params: { page, per_page: perPage } });
    return res.data; // paginator with data, meta, links
  },

  /**
   * Add a new comment to a lead.
   * @param {string|number} leadId
   * @param {{ comment: string }} payload
   */
  addComment: async (leadId, payload) => {
    const url = COMMENT_BASE.replace("{leadId}", leadId);
    const res = await api.post(url, payload); // expects { comment: "..." }
    return res.data;
  },

  /**
   * Delete a specific comment from a lead.
   * @param {string|number} leadId
   * @param {string|number} commentId
   */
  removeComment: async (leadId, commentId) => {
    const url = `${COMMENT_BASE.replace("{leadId}", leadId)}/${commentId}`;
    const res = await api.delete(url);
    return res.status === 204 ? null : res.data;
  },
};
