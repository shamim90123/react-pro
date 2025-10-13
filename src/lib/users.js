// src/lib/users.js
import api from "@/lib/api";
const BASE = "/api/v1/users";

export const UsersApi = {
  create: async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data; // { id, name, email, role, ... }
  },
  get: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`${BASE}/${id}`, payload);
    return data;
  },
  list: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data;
  },
  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },
};
