// src/lib/api.js
import axios from "axios";
import { tokenStore } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request: inject token if present
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    // Bearer token flow
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: unwrap data and normalise errors
api.interceptors.response.use(
  (res) => res, // keep full response (sometimes you need headers, pagination)
  async (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      `HTTP ${status || "Error"}`;

    // Optional: auto-logout on 401
    // if (status === 401) {
    //   tokenStore.clear();
    //   window.location.href = "/login";
    // }

    return Promise.reject(new Error(message));
  }
);

export default api;
