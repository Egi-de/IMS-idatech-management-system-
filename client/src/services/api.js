import axios from "axios";
export const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ----------------------------- FINANCE API ----------------------------- */
export const getTransactions = () => api.get("/finance/api/transactions/");
export const createTransaction = (data) => {
  // Check if data contains file fields
  const hasFileFields = Object.keys(data).some(
    (key) => data[key] instanceof File || data[key] instanceof Blob
  );

  if (hasFileFields) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post("/finance/api/transactions/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    // Use JSON for non-file data
    return api.post("/finance/api/transactions/", data);
  }
};
export const updateTransaction = (id, data) => {
  // Check if data contains file fields
  const hasFileFields = Object.keys(data).some(
    (key) => data[key] instanceof File || data[key] instanceof Blob
  );

  if (hasFileFields) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.patch(`/finance/api/transactions/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    // Use JSON for non-file updates
    return api.patch(`/finance/api/transactions/${id}/`, data);
  }
};
export const deleteTransaction = (id) =>
  api.delete(`/finance/api/transactions/${id}/`);

export const getSummary = () => api.get("/finance/api/summary/");
export const getReports = (params) =>
  api.get("/finance/api/reports/", { params });
export const generatePDFReport = (params) =>
  api.post("/finance/api/reports/pdf/", params, { responseType: "blob" });

/* ----------------------------- STUDENTS API ----------------------------- */
export const getStudents = () => api.get("/student/api/students/");
export const createStudent = (data) => {
  // Check if data contains file fields
  const hasFileFields = Object.keys(data).some(
    (key) => data[key] instanceof File || data[key] instanceof Blob
  );

  if (hasFileFields) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (
          typeof data[key] === "object" &&
          !(data[key] instanceof File) &&
          !(data[key] instanceof Blob)
        ) {
          // Convert objects/arrays to JSON string for FormData
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.post("/student/api/students/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    // Use JSON for non-file data
    return api.post("/student/api/students/", data);
  }
};
export const updateStudent = (id, data) => {
  // Check if data contains file fields
  const hasFileFields = Object.keys(data).some(
    (key) => data[key] instanceof File || data[key] instanceof Blob
  );

  if (hasFileFields) {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (
          typeof data[key] === "object" &&
          !(data[key] instanceof File) &&
          !(data[key] instanceof Blob)
        ) {
          // Convert objects/arrays to JSON string for FormData
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });
    return api.patch(`/student/api/students/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } else {
    // Use JSON for non-file updates
    return api.patch(`/student/api/students/${id}/`, data);
  }
};
export const deleteStudent = (id) => api.delete(`/student/api/students/${id}/`);
export const getStudentById = (id) => api.get(`/student/api/students/${id}/`);
export const getDeletedStudents = () =>
  api.get("/student/api/students/deleted/");
export const restoreStudent = (id) =>
  api.patch(`/student/api/students/${id}/restore/`);
export const getStudentSummary = () =>
  api.get("/student/api/students/summary/");
export const getStudentActivities = () =>
  api.get("/student/api/students/activities/");
export const getStudentAttendance = () =>
  api.get("/student/api/students/attendance/");
export const markAttendance = (data) =>
  api.post("/student/api/students/attendance/", data);
export const getAttendanceByDate = (date) =>
  api.get(`/student/api/students/attendance/?date=${date}`);
export const getStudentAIEvaluation = (id) =>
  api.get(`/student/api/students/${id}/ai-evaluation/`);
export const generateStudentAIEvaluation = (id) =>
  api.post(`/student/api/students/${id}/ai-evaluation/`);

/* ----------------------------- EMPLOYEES API ----------------------------- */
export const getEmployees = () => api.get("/api/employees/");
export const createEmployee = (data) => api.post("/api/employees/", data);
export const updateEmployee = (id, data) =>
  api.put(`/api/employees/${id}/`, data);
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}/`);
export const restoreEmployee = (id) =>
  api.patch(`/api/employees/${id}/restore/`);
export const getDepartments = () => api.get("/api/departments/");

/* ----------------------------- AUTH & SETTINGS ----------------------------- */
export const login = (username, password) =>
  api.post("/api-token-auth/", { username, password });

export const getSettings = () => api.get("/api/settings/");
export const updateSettings = (data) => api.patch("/api/settings/", data);
export const getUserProfile = () => api.get("/api/settings/user/");
export const updateUserProfile = (data) =>
  api.patch("/api/settings/user/", data);

/* ----------------------------- NOTIFICATIONS ----------------------------- */
export const getNotifications = () => api.get("/api/settings/notifications/");
export const markNotificationAsRead = (id, read) =>
  api.patch(`/api/settings/notifications/${id}/`, { read });
export const markAllNotificationsAsRead = () =>
  api.put("/api/settings/notifications/", {});

/* ----------------------------- ACTIVITIES ----------------------------- */
export const getActivities = () => api.get("/api/settings/activities/");
export const logActivity = (data) =>
  api.post("/api/settings/activities/", data);

/* ----------------------------- TRASH BIN ----------------------------- */
export const getTrashItems = () => api.get("/api/settings/trash/");
export const addToTrash = (data) => api.post("/api/settings/trash/", data);
export const deleteFromTrash = (id) => api.delete(`/api/settings/trash/${id}/`);

/* ----------------------------- DASHBOARD ----------------------------- */
export const getDashboardSummary = () => api.get("/dashboard/api/summary/");

export default api;
