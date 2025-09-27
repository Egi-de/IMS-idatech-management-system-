import axios from "axios";

const FINANCE_API_BASE_URL = "http://localhost:8000/finance";
const STUDENT_API_BASE_URL = "http://localhost:8000/student";

const financeApi = axios.create({
  baseURL: FINANCE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const studentApi = axios.create({
  baseURL: STUDENT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Transactions API
export const getTransactions = () => financeApi.get("/api/transactions/");
export const createTransaction = (data) =>
  financeApi.post("/api/transactions/", data);
export const updateTransaction = (id, data) =>
  financeApi.put(`/api/transactions/${id}/`, data);
export const deleteTransaction = (id) =>
  financeApi.delete(`/api/transactions/${id}/`);

// Summary API
export const getSummary = () => financeApi.get("/api/summary/");

// Reports API
export const getReports = (params) =>
  financeApi.get("/api/reports/", { params });

export const generatePDFReport = (params) =>
  financeApi.post("/api/reports/pdf/", params, {
    responseType: "blob",
  });

// Students API
export const getStudents = () => studentApi.get("/api/students/");
export const createStudent = (data) => studentApi.post("/api/students/", data);
export const updateStudent = (id, data) =>
  studentApi.patch(`/api/students/${id}/`, data);
export const deleteStudent = (id) => studentApi.delete(`/api/students/${id}/`);
export const getStudentById = (id) => studentApi.get(`/api/students/${id}/`);
export const getDeletedStudents = () =>
  studentApi.get("/api/students/deleted/");
export const restoreStudent = (id) =>
  studentApi.patch(`/api/students/${id}/restore/`);

// Student Summary API
export const getStudentSummary = () => studentApi.get("/api/students/summary/");

// Student Activities API
export const getStudentActivities = () =>
  studentApi.get("/api/students/activities/");

// Student Attendance API
export const getStudentAttendance = () =>
  studentApi.get("/api/students/attendance/");

export const markAttendance = (data) =>
  studentApi.post("/api/students/attendance/", data);

export const getAttendanceByDate = (date) =>
  studentApi.get(`/api/students/attendance/?date=${date}`);

export default financeApi;
