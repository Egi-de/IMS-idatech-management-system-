import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import StudentEnrollment from "./pages/StudentEnrollment";
import StudentAttendance from "./pages/StudentAttendance";
import StudentPerformance from "./pages/StudentPerformance";
import StudentActivities from "./pages/StudentActivities";
import StudentFeedback from "./pages/StudentFeedback";
import StudentStatus from "./pages/StudentStatus";
import Employees from "./pages/Employees";
import Financial from "./pages/Financial";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  // Dark mode state management at the root level
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    const initialValue = saved ? JSON.parse(saved) : false;
    console.log("Initial dark mode state:", initialValue);
    return initialValue;
  });

  // Apply dark mode class immediately on mount and when state changes
  useEffect(() => {
    console.log("Dark mode state changed to:", isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      console.log("Added dark class to document");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("Removed dark class from document");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    console.log(
      "Current document classes:",
      document.documentElement.className
    );
  }, [isDarkMode]);

  // Apply dark mode class immediately if saved in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      const savedDarkMode = JSON.parse(saved);
      if (savedDarkMode) {
        document.documentElement.classList.add("dark");
        console.log("Applied dark mode from localStorage on mount");
      }
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Student sub-routes */}
          <Route
            path="/students/profile"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/enrollment"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentEnrollment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/attendance"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentAttendance />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/performance"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentPerformance />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/activities"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentActivities />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/feedback"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentFeedback />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/status"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <StudentStatus />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Employees />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/financial"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Financial />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
