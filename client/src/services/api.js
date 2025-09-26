import axios from "axios";

const API_BASE_URL = "http://localhost:8000/finance";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Transactions API
export const getTransactions = () => api.get("/api/transactions/");
export const createTransaction = (data) => api.post("/api/transactions/", data);
export const updateTransaction = (id, data) =>
  api.put(`/api/transactions/${id}/`, data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}/`);

// Summary API
export const getSummary = () => api.get("/api/summary/");

// Reports API
export const getReports = (params) => api.get("/api/reports/", { params });

export const generatePDFReport = (params) =>
  api.post("/api/reports/pdf/", params, {
    responseType: "blob",
  });

export default api;
