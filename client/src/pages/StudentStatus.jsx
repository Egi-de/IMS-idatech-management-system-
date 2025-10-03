import React, { useState, useEffect, useCallback } from "react";
import { getStudents } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";

import {
  UserIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const StudentStatus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [progressFilter, setProgressFilter] = useState("");
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStatusData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudents();
      const allStudents = response.data;
      const transformedData = allStudents.map((student) => {
        const status = student.is_deleted ? "Inactive" : "Active";

        let progress = "On Track";
        const gpa = student.gpa ? parseFloat(student.gpa) : 0;
        const performanceRating = getPerformanceRating(student.performance);
        const overallScore = gpa > 0 ? gpa : performanceRating;
        if (overallScore < 2.5) {
          progress = "Needs Attention";
        } else if (overallScore < 3.5) {
          progress = "At Risk";
        }

        const warnings = [];
        if (student.overallAttendance < 80) {
          warnings.push("Low Attendance");
        }
        if (gpa < 3.0) {
          warnings.push("Low GPA");
        }
        if (
          (student.feedback || []).some(
            (f) => (f.improvements || []).length > 0
          )
        ) {
          warnings.push("Feedback Required");
        }
        const unpaidFees = student.finance?.unpaidFees || 0;
        if (unpaidFees > 0) {
          warnings.push("Financial Pending");
        }
        const warningCount = warnings.length;

        let recommendations = "";
        const improvements = (student.feedback || [])
          .flatMap((f) => f.improvements || [])
          .filter(Boolean);
        if (improvements.length > 0) {
          recommendations = improvements.join(", ");
        } else if (warningCount > 0) {
          recommendations = `Address: ${warnings.join(", ")}`;
        } else {
          recommendations = "Continue strong performance";
        }

        return {
          id: student.id,
          studentName: student.name,
          studentId: student.idNumber,
          email: student.email,
          program: student.program,
          status,
          progress,
          warnings,
          warningCount,
          recommendations,
          gpa,
          overallAttendance: student.overallAttendance || 0,
          finance: student.finance || { unpaidFees: 0 },
          feedback: student.feedback,
        };
      });
      setStatusData(transformedData);
    } catch (err) {
      setError(err.message || "Failed to fetch student status data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusData();
  }, [fetchStatusData]);

  const getPerformanceRating = (performance) => {
    const mapping = {
      Excellent: 4.5,
      Good: 4.0,
      Average: 3.0,
      Poor: 2.0,
    };
    return mapping[performance] || 3.0;
  };

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case "On Track":
        return "bg-blue-100 text-blue-800";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800";
      case "Needs Attention":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWarningColor = (count) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count <= 1) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading status data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        Error: {error}
      </div>
    );
  }

  const filteredData = statusData.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery);
    const matchesStatus = !statusFilter || student.status === statusFilter;
    const matchesProgress =
      !progressFilter || student.progress === progressFilter;
    return matchesSearch && matchesStatus && matchesProgress;
  });

  const activeCount = statusData.filter((s) => s.status === "Active").length;
  const inactiveCount = statusData.length - activeCount;
  const onTrackCount = statusData.filter(
    (s) => s.progress === "On Track"
  ).length;
  const atRiskCount = statusData.filter((s) => s.progress === "At Risk").length;
  const totalWarnings = statusData.reduce((sum, s) => sum + s.warningCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Status & Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor student status, progress, and personalized recommendations
          </p>
        </div>
        <Button onClick={fetchStatusData}>Update Status</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {activeCount}
            </div>
            <div className="text-sm text-gray-600">Active Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {inactiveCount}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {onTrackCount}
            </div>
            <div className="text-sm text-gray-600">On Track</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {atRiskCount}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {totalWarnings}
            </div>
            <div className="text-sm text-gray-600">Total Warnings</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Progress</option>
          <option value="On Track">On Track</option>
          <option value="At Risk">At Risk</option>
          <option value="Needs Attention">Needs Attention</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.studentId} • {student.program}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        student.status
                      )}`}
                    >
                      {student.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(
                        student.progress
                      )}`}
                    >
                      {student.progress}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getWarningColor(
                          student.warningCount
                        )}`}
                      >
                        {student.warningCount} Warnings
                      </span>
                      {student.warningCount > 0 && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {student.recommendations}
                      </div>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="View full recommendations"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No students found matching the criteria.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recommendations for {selectedStudent.studentName}
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {selectedStudent.feedback &&
                selectedStudent.feedback.length > 0 ? (
                  selectedStudent.feedback.map((feedback, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Date: {feedback.date || "N/A"} | Rating:{" "}
                        {feedback.rating || "N/A"}
                      </p>
                      {feedback.improvements &&
                      feedback.improvements.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-200">
                          {feedback.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      ) : feedback.recommendations ? (
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {feedback.recommendations}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No specific recommendations.
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No feedback recommendations available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatus;
