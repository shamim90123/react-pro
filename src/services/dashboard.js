// src/lib/dashboard.js
import api from "@/services/api";

const BASE = "/api/v1/stats";

export const DashboardApi = {
  getOverview: async () => {
    const { data } = await api.get(`${BASE}/overview`);
    // Expected shape: { leads: number, users: number, products: number }
    return data;
  },
};
