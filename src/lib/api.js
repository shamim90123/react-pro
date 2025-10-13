// src/lib/api.js
import axios from "axios";
import { tokenStore } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  withCredentials: false,
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
  (res) => res,
  (err) => {
    const status = err?.response?.status ?? 0;
    const data = err?.response?.data;
    const message =
      data?.message || err?.message || `HTTP ${status || "Error"}`;
    const e = new Error(message);
    e.status = status;
    e.data = data;
    e.original = err;
    return Promise.reject(e);
  }
);


export default api;
