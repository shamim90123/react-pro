// src/lib/leads.js
import { comment } from "postcss";
import api from "./api";

const BASE = "/api/v1/leads";
const CONTACT_BASE = "/api/v1/leads/{leadId}/contacts";
const COMMENT_BASE = "/api/v1/leads/{leadId}/comments";

// flat contact endpoints
const CONTACTS_FLAT = "/api/v1/contacts";

export const LeadsApi = {
  // list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
  //   const res = await api.get(BASE, { params: { page, per_page: perPage, ...(q ? { q } : {}) } });
  //   return res.data; // Laravel paginator (data, meta, links)
  // },
  // list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
  //   const res = await api.get(BASE, {
  //     params: { page, per_page: perPage, ...(q ? { q } : {}) },
  //   });

  //   const raw = res.data || {};
  //   const items = raw.data ?? raw.items ?? [];
  //   const meta = raw.meta ?? {
  //     current_page: raw.current_page ?? 1,
  //     per_page: raw.per_page ?? perPage,
  //     total: raw.total ?? items.length,
  //     last_page: raw.last_page ?? Math.max(1, Math.ceil((raw.total ?? items.length) / (raw.per_page ?? perPage))),
  //   };

  //   return { data: items, meta };
  // },

  list: async ({
    page = 1,
    perPage = 10,
    q = "",
    leadName = "",
    city = "",
    status = "",
    destinationId = "",
  } = {}) => {
    const params = {
      page,
      per_page: perPage,
      ...(q ? { q } : {}),
      ...(leadName ? { lead_name: leadName } : {}),
      ...(city ? { city } : {}),
      ...(status !== "" && status !== null && status !== undefined ? { status } : {}),
      ...(destinationId ? { destination: destinationId } : {}),
    };

    const res = await api.get(BASE, { params });

    const raw = res.data || {};
    const items = raw.data ?? raw.items ?? [];
    const meta = raw.meta ?? {
      current_page: raw.current_page ?? 1,
      per_page: raw.per_page ?? perPage,
      total: raw.total ?? items.length,
      last_page:
        raw.last_page ??
        Math.max(1, Math.ceil((raw.total ?? items.length) / (raw.per_page ?? perPage))),
    };

    return { data: items, meta };
  },

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
  listContacts: async (leadId, { page = 1, perPage = 10 } = {}) => {
    const url = `/api/v1/leads/${leadId}/contacts`;
    const res = await api.get(url, { params: { page, per_page: perPage } });
    const raw = res.data || {};
    const items = raw.data ?? raw.items ?? [];
    const meta  = raw.meta ?? {
      current_page: raw.current_page ?? 1,
      last_page:    raw.last_page ?? 1,
      per_page:     raw.per_page ?? perPage,
      total:        raw.total ?? items.length,
    };
    return { data: items, meta };
  },

  createContact: async (leadId, payload) => {
    const res = await api.post(CONTACT_BASE.replace("{leadId}", leadId), payload);
    return res.data; // array of contacts returned
  },

  removeContact: async (contactId) => {
    await api.delete(`${CONTACTS_FLAT}/${contactId}`);
    return null; // 204
  },

  setPrimaryContact: async (contactId) => {
    const res = await api.post(`${CONTACTS_FLAT}/${contactId}/primary`);
    return res.data;
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

    // Laravel usually: { data: [...], meta: {...}, links: {...} }
    // But sometimes meta can be at root or camelCased via resources.
    const raw = res.data || {};
    const items = raw.data ?? raw.items ?? [];
    const meta  = raw.meta ?? {
      current_page: raw.current_page ?? 1,
      last_page:    raw.last_page ?? 1,
      per_page:     raw.per_page ?? perPage,
      total:        raw.total ?? items.length,
    };

    return { data: items, meta };
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

  updateComment: async (leadId, commentId, payload) => {
    const url = `${COMMENT_BASE.replace("{leadId}", leadId)}/${commentId}`;
    const res = await api.patch?.(url, payload).catch(async () => api.put(url, payload));
    return res.data; // updated comment object or { comment: {...} }
  },

  // ----- Products -----
  assignProducts: async (leadId, productIds = []) => {
    const res = await api.put(`${BASE}/${leadId}/products`, {
      product_ids: productIds,
    });
    return res.data; // { message, data: [...] }
  },

  getProducts: async (leadId) => {
    const res = await api.get(`${BASE}/${leadId}/products`);
    return res.data; // { data: [{ id, name, pivot: { sales_stage_id, account_manager_id }}, ...] }
  },

  bulkUpdateProductLinks: async (leadId, items) => {
    // items: [{ product_id, sales_stage_id, account_manager_id }]
    const res = await api.put(`${BASE}/${leadId}/products/bulk`, { items });
    return res.data; // { message, data: [...] }
  },

  // ----- Account Manager -----
  async assignAccountManager(leadId, userId) {
    // Axios: await the call, use .status/.data, and send JSON directly
    const res = await api.post(`${BASE}/account-manager/${leadId}`, {
      user_ids: { user_id: userId ?? null },
    });
    return res.data; // <-- Axios response body
  },

  // ----- Countries -----
  getCountries: async () => {
    const res = await api.get(`/api/v1/countries`);
    return res.data; // { data: [...] }
  },

  // bulkUpsert: (rows) => api.post("/api/v1/leads/bulk-upsert", { leads: rows }),
  bulkUpsert: async (rows) => {
    const res = await api.post("/api/v1/leads/bulk-importer", { leads: rows });
    return res.data; // { message, data: [...] }
  },

  // commentBulkUpsert
  commentBulkUpsert: async (rows) => {
    const res = await api.post("/api/v1/leads/bulk-comment-importer", { comments: rows });
    return res.data;
  },

   // ✅ add this generic updater (your LeadList already calls LeadsApi.update)
  update: async (id, payload) => {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },

    // ✅ convenience method to change status only
  updateStatus: async (id, status) => {
    const res = await api.patch(`${BASE}/${id}/status`, { status }); // <-- changed to PATCH + /status
    return res.data;
  },


};
