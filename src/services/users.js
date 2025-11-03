// src/services/users.js
import api from "@/services/api";
const BASE = "/api/v1/users";
const UserList = "/api/v1/user-list";

export const UsersApi = {
  create: async (payload) => {
    const { data } = await api.post(BASE, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  get: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },
  userlist: async () => {
    const { data } = await api.get(`${UserList}`);
    return data;
  },
  update: async (id, payload) => {
    // For file uploads, use POST with _method=PUT
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT');
      const { data } = await api.post(`${BASE}/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } else {
      // For regular JSON updates, use PUT
      const { data } = await api.put(`${BASE}/${id}`, payload);
      return data;
    }
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