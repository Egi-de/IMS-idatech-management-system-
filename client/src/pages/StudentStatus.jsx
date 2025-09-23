import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const StudentStatus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Enhanced mock status data
  const [statusData] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "STU001",
      email: "john.doe@email.com",
      program: "IoT Development",
      currentStatus: "Active",
      enrollmentStatus: "Good Standing",
      academicStatus: "Active",
      financialStatus: "Cleared",
      completionStatus: "On Track",
      expectedGraduation: "2025-06-15",
      creditsCompleted: 42,
      totalCredits: 45,
      currentSemester: "Spring 2024",
      gpa: 3.8,
      warnings: [],
      recommendations: [
        "Consider advanced IoT specialization courses",
        "Apply for research assistant position",
        "Join IoT student club leadership",
      ],
      nextSteps: [
        "Complete remaining 3 credits",
        "Submit graduation application",
        "Attend career services workshop",
      ],
      statusHistory: [
        {
          date: "2024-01-15",
          status: "Active",
          description: "Enrollment confirmed",
        },
        {
          date: "2023-12-01",
          status: "Provisional",
          description: "Initial enrollment",
        },
        {
          date: "2023-11-15",
          status: "Pending",
          description: "Application under review",
        },
      ],
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      email: "jane.smith@email.com",
      program: "Software Development",
      currentStatus: "Active",
      enrollmentStatus: "Good Standing",
      academicStatus: "Active",
      financialStatus: "Partial Payment",
      completionStatus: "On Track",
      expectedGraduation: "2025-06-15",
      creditsCompleted: 39,
      totalCredits: 42,
      currentSemester: "Spring 2024",
      gpa: 3.6,
      warnings: [
        {
          type: "Financial",
          message: "Outstanding balance of $5,000",
          severity: "medium",
        },
      ],
      recommendations: [
        "Complete outstanding payment",
        "Consider part-time work opportunity",
        "Apply for financial aid extension",
      ],
      nextSteps: [
        "Clear financial obligations",
        "Complete remaining 3 credits",
        "Schedule academic advising",
      ],
      statusHistory: [
        {
          date: "2024-01-10",
          status: "Active",
          description: "Payment plan approved",
        },
        {
          date: "2023-12-15",
          status: "Hold",
          description: "Financial hold placed",
        },
        {
          date: "2023-11-20",
          status: "Active",
          description: "Enrollment activated",
        },
      ],
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentId: "STU003",
      email: "mike.johnson@email.com",
      program: "IoT Development",
      currentStatus: "Inactive",
      enrollmentStatus: "Academic Warning",
      academicStatus: "At Risk",
      financialStatus: "Hold",
      completionStatus: "Behind Schedule",
      expectedGraduation: "2025-12-15",
      creditsCompleted: 32,
      totalCredits: 38,
      currentSemester: "Spring 2024",
      gpa: 3.2,
      warnings: [
        {
          type: "Academic",
          message: "GPA below 3.0 requirement",
          severity: "high",
        },
        { type: "Financial", message: "All fees unpaid", severity: "high" },
        {
          type: "Attendance",
          message: "Attendance below 75%",
          severity: "medium",
        },
      ],
      recommendations: [
        "Meet with academic advisor immediately",
        "Develop improvement plan",
        "Consider tutoring services",
        "Address financial obligations",
      ],
      nextSteps: [
        "Schedule meeting with academic advisor",
        "Create academic improvement plan",
        "Clear financial holds",
        "Improve attendance record",
      ],
      statusHistory: [
        {
          date: "2024-01-05",
          status: "Inactive",
          description: "Academic and financial holds",
        },
        {
          date: "2023-12-01",
          status: "Warning",
          description: "Academic warning issued",
        },
        {
          date: "2023-11-15",
          status: "Active",
          description: "Initial enrollment",
        },
      ],
    },
  ]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Inactive":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Hold":
        return "text-red-600 bg-red-100";
      case "Warning":
        return "text-yellow-600 bg-yellow-100";
      case "Provisional":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getOverallStatusColor = (student) => {
    if (student.warnings.some((w) => w.severity === "high"))
      return "text-red-600";
    if (student.warnings.length > 0) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Status & Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor student status, progress, and recommendations
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {statusData.filter((s) => s.currentStatus === "Active").length}
              </div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {statusData.filter((s) => s.warnings.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">
                Students with Warnings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {
                  statusData.filter((s) => s.completionStatus === "On Track")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">On Track</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {
                  statusData.filter((s) => s.currentStatus === "Inactive")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Programs</option>
          <option value="iot">IoT Development</option>
          <option value="software">Software Development</option>
          <option value="data">Data Science</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="warning">Warning</option>
          <option value="hold">Hold</option>
        </select>
      </div>

      {/* Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusData.map((student) => (
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
                    <p className="text-xs text-gray-500">
                      {student.creditsCompleted}/{student.totalCredits} credits
                      • GPA: {student.gpa}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getOverallStatusColor(
                        student
                      )}`}
                    >
                      {student.currentStatus}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {student.completionStatus}
                    </div>
                    <div className="text-xs text-gray-600">Progress</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {student.warnings.length}
                    </div>
                    <div className="text-xs text-gray-600">Warnings</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {student.recommendations.length}
                    </div>
                    <div className="text-xs text-gray-600">Recommendations</div>
                  </div>

                  <div className="flex space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        student.currentStatus
                      )}`}
                    >
                      {student.currentStatus}
                    </span>
                    {student.warnings.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
                        {student.warnings.length} Warning
                        {student.warnings.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleViewDetails(student)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Student Status & Recommendations"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedStudent.studentName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedStudent.email}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedStudent.studentId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Status Overview
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div
                        className={`text-lg font-bold ${getStatusColor(
                          selectedStudent.currentStatus
                        )}`}
                      >
                        {selectedStudent.currentStatus}
                      </div>
                      <div className="text-sm text-blue-600">
                        Overall Status
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {selectedStudent.enrollmentStatus}
                      </div>
                      <div className="text-sm text-green-600">Enrollment</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {selectedStudent.academicStatus}
                      </div>
                      <div className="text-sm text-yellow-600">Academic</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {selectedStudent.financialStatus}
                      </div>
                      <div className="text-sm text-purple-600">Financial</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Credits Completed:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.creditsCompleted}/
                        {selectedStudent.totalCredits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current GPA:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.gpa}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Expected Graduation:</span>
                      <span className="text-sm font-medium">
                        {new Date(
                          selectedStudent.expectedGraduation
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Semester:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.currentSemester}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedStudent.warnings.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Warnings
                    </label>
                    <div className="mt-2 space-y-2">
                      {selectedStudent.warnings.map((warning, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ExclamationCircleIcon className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-700">
                                {warning.type} Warning
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                warning.severity
                              )}`}
                            >
                              {warning.severity} priority
                            </span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            {warning.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recommendations
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedStudent.recommendations.map(
                      (recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-2 bg-blue-50 rounded"
                        >
                          <ArrowRightIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Next Steps
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedStudent.nextSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-2 bg-green-50 rounded"
                      >
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status History
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedStudent.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              history.status
                            )}`}
                          >
                            {history.status}
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            {history.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(history.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentStatus;
