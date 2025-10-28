// src/services/roles.js
import api from "./api";

export const RolesApi = {
  list: ({ q = "", page = 1, perPage = 10 } = {}) =>
    api
      .get("/api/v1/roles", { params: { q, page, per_page: perPage } })
      .then((r) => r.data),

  get: (id) => api.get(`/api/v1/roles/${id}`).then((r) => r.data),

  create: (payload) => api.post("/api/v1/roles", payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/api/v1/roles/${id}`, payload).then((r) => r.data),

  remove: (id) => api.delete(`/api/v1/roles/${id}`).then((r) => r.data),

  listPermissions: () => api.get("/api/v1/permissions").then((r) => r.data),

  // (optional) plain role names for user form, etc.
  listNames: () => api.get("/api/v1/roles/names").then((r) => r.data),
};
