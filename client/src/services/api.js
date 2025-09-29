import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transactions API
export const getTransactions = () => api.get("finance/api/transactions/");
export const createTransaction = (data) => api.post("finance/api/transactions/", data);
export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}/`, data);
export const deleteTransaction = (id) => api.delete(`finance/api/transactions/${id}/`);

// Summary API
export const getSummary = () => api.get("/api/summary/");

// Reports API
export const getReports = (params) => api.get("/api/reports/", { params });

export const generatePDFReport = (params) =>
  api.post("/api/reports/pdf/", params, {
    responseType: "blob",
  });

// Auth API
export const login = (username, password) =>
  api.post("/api-token-auth/", { username, password });

// Settings API
export const getSettings = () => api.get("/api/settings/");
export const updateSettings = (data) => api.patch("/api/settings/", data);

export const getUserProfile = () => api.get("/api/settings/user/");
export const updateUserProfile = (data) => api.patch("/api/settings/user/", data);

export default api;
