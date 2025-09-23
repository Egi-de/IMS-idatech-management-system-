import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
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
  return (
    <DarkModeProvider>
      <Router>
        <div className="App">
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

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Layout>
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
                  <Layout>
                    <StudentProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/enrollment"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentEnrollment />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/attendance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentAttendance />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/performance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentPerformance />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/activities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentActivities />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/feedback"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentFeedback />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/status"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentStatus />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Employees />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/financial"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Financial />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      404
                    </h1>
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
    </DarkModeProvider>
  );
}

export default App;
