// src/lib/dashboard.js (or "@/services/dashboard")
import api from "@/services/api";

const BASE = "/api/v1/stats";

export const DashboardApi = {
  getOverview: async () => {
    const { data } = await api.get(`${BASE}/overview`);
    return data;
  },
};
