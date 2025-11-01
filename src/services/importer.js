// src/lib/leads.js
import api from "./api";

export const LeadsApi = {

  // bulkUpsert: (rows) => api.post("/api/v1/leads/bulk-upsert", { leads: rows }),
  bulkUpsert: async (rows) => {
    const res = await api.post("/api/v1/leads/bulk-importer", { leads: rows });
    return res.data; // { message, data: [...] }
  },

  // commentBulkUpsert
  commentBulkUpsert: async (rows) => {
    const res = await api.post("/api/v1/leads/bulk-comment-importer", { comments: rows });
    return res.data;
  }

};
