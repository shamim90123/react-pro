// src/services/PermissionApi.js
import api from "@/services/api";

const BASE = "/api/v1/permissions";
const BASEList = "/api/v1/permissions-list";

export const PermissionApi = {
  // Get all permissions with pagination
   list: async ({ page = 1, perPage = 10, q = "" } = {}) => {
    try {
      console.log("API Call:", { page, perPage, q });
      
      const res = await api.get("/api/v1/permissions-list", {
        params: { 
          page, 
          per_page: perPage, 
          ...(q ? { q } : {}) 
        },
      });
      
      console.log("Raw API Response:", res.data);
      
      // Handle Laravel pagination response
      const responseData = res.data;
      
      return {
        data: responseData.data || [],
        total: responseData.total || 0,
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
        from: responseData.from || 0,
        to: responseData.to || 0,
        per_page: responseData.per_page || perPage,
      };
      
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  // Get grouped permissions
  grouped: async () => {
    const res = await api.get("/api/v1/permissions-grouped");
    return res.data;
  },

  // Get permission details
  show: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },

  // Create permission
  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  // Update permission
  update: async (id, payload) => {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  // Delete permission
  remove: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.status === 204 ? null : res.data;
  },

  // Sync permissions to role
  syncToRole: async (roleId, permissionIds) => {
    const res = await api.post(`/api/v1/roles/${roleId}/permissions`, {
      permissions: permissionIds
    });
    return res.data;
  }
};