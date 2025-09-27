import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { getStudentAttendance, markAttendance } from "../services/api";

const StudentAttendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Attendance marking states
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedStudents, setSelectedStudents] = useState({});
  const [bulkStatus, setBulkStatus] = useState("present");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic attendance data
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await getStudentAttendance();
        setAttendanceData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load attendance data");
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 bg-green-100";
      case "Good":
        return "text-blue-600 bg-blue-100";
      case "Average":
        return "text-yellow-600 bg-yellow-100";
      case "Needs Improvement":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Attendance marking functions
  const handleMarkAttendance = () => {
    setShowMarkAttendanceModal(true);
    // Initialize all students as not selected
    const initialSelections = {};
    attendanceData.forEach((student) => {
      initialSelections[student.id] = false;
    });
    setSelectedStudents(initialSelections);
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleBulkStatusChange = (status) => {
    setBulkStatus(status);
  };

  const handleSelectAll = () => {
    const allSelected = {};
    attendanceData.forEach((student) => {
      allSelected[student.id] = true;
    });
    setSelectedStudents(allSelected);
  };

  const handleSelectNone = () => {
    const noneSelected = {};
    attendanceData.forEach((student) => {
      noneSelected[student.id] = false;
    });
    setSelectedStudents(noneSelected);
  };

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);

    try {
      // Get selected students
      const selectedStudentIds = Object.keys(selectedStudents).filter(
        (id) => selectedStudents[id]
      );

      // Prepare attendance data for API
      const attendanceData = {
        date: attendanceDate,
        status: bulkStatus,
        student_ids: selectedStudentIds,
      };

      // Make API call to mark attendance
      await markAttendance(attendanceData);

      // Refresh attendance data
      const response = await getStudentAttendance();
      setAttendanceData(response.data);

      setIsSubmitting(false);
      setShowMarkAttendanceModal(false);

      // Reset form
      setSelectedStudents({});
      setBulkStatus("present");

      // Show success message (in a real app, you'd use a toast notification)
      alert(
        `Attendance marked successfully for ${selectedStudentIds.length} students!`
      );
    } catch (err) {
      setIsSubmitting(false);
      console.error("Error marking attendance:", err);
      alert("Failed to mark attendance. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Attendance Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance & Participation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track student attendance and participation records
          </p>
        </div>
        <Button onClick={handleMarkAttendance}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(
                  attendanceData.reduce(
                    (acc, student) => acc + student.overallAttendance,
                    0
                  ) / attendanceData.length
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {attendanceData.reduce(
                  (acc, student) => acc + student.presentDays,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Present Days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {attendanceData.reduce(
                  (acc, student) => acc + student.absentDays,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Absent Days</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {attendanceData.reduce(
                  (acc, student) => acc + student.lateDays,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Late Days</div>
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

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Programs</option>
          <option value="iot">IoT Development</option>
          <option value="software">Software Development</option>
          <option value="data">Data Science</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="average">Average</option>
          <option value="needs-improvement">Needs Improvement</option>
        </select>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((student) => (
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
                      Last attendance:{" "}
                      {new Date(student.lastAttendance).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getAttendanceColor(
                        student.overallAttendance
                      )}`}
                    >
                      {student.overallAttendance}%
                    </div>
                    <div className="text-xs text-gray-600">Overall</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {student.presentDays}
                    </div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {student.absentDays}
                    </div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">
                      {student.lateDays}
                    </div>
                    <div className="text-xs text-gray-600">Late</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {student.currentStreak}
                    </div>
                    <div className="text-xs text-gray-600">Streak</div>
                  </div>

                  <div className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        student.status
                      )}`}
                    >
                      {student.status}
                    </span>
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

      {/* Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Attendance Details"
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
                    Attendance Summary
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedStudent.presentDays}
                      </div>
                      <div className="text-sm text-green-600">Present Days</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedStudent.absentDays}
                      </div>
                      <div className="text-sm text-red-600">Absent Days</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedStudent.lateDays}
                      </div>
                      <div className="text-sm text-yellow-600">Late Days</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStudent.excusedAbsences}
                      </div>
                      <div className="text-sm text-blue-600">
                        Excused Absences
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Status
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Attendance:</span>
                      <span
                        className={`text-sm font-medium ${getAttendanceColor(
                          selectedStudent.overallAttendance
                        )}`}
                      >
                        {selectedStudent.overallAttendance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Streak:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.currentStreak} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedStudent.status
                        )}`}
                      >
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monthly Breakdown
                  </label>
                  <div className="mt-2 space-y-3">
                    {Object.entries(selectedStudent.monthlyData).map(
                      ([month, data]) => (
                        <div key={month} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              {new Date(month + "-01").toLocaleDateString(
                                "en-US",
                                { month: "long", year: "numeric" }
                              )}
                            </span>
                            <span className="text-sm text-gray-600">
                              {data.present + data.absent + data.late} days
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="flex-1 bg-green-200 h-2 rounded">
                              <div
                                className="bg-green-500 h-2 rounded"
                                style={{
                                  width: `${
                                    (data.present /
                                      (data.present +
                                        data.absent +
                                        data.late)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex-1 bg-red-200 h-2 rounded">
                              <div
                                className="bg-red-500 h-2 rounded"
                                style={{
                                  width: `${
                                    (data.absent /
                                      (data.present +
                                        data.absent +
                                        data.late)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex-1 bg-yellow-200 h-2 rounded">
                              <div
                                className="bg-yellow-500 h-2 rounded"
                                style={{
                                  width: `${
                                    (data.late /
                                      (data.present +
                                        data.absent +
                                        data.late)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>P: {data.present}</span>
                            <span>A: {data.absent}</span>
                            <span>L: {data.late}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showMarkAttendanceModal}
        onClose={() => setShowMarkAttendanceModal(false)}
        title="Mark Attendance"
        size="large"
      >
        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Bulk Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mark All Selected Students As
            </label>
            <select
              value={bulkStatus}
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused Absence</option>
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Students
              </label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={handleSelectNone}
                >
                  Select None
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {attendanceData.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    selectedStudents[student.id]
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents[student.id] || false}
                      onChange={() => handleStudentSelection(student.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {student.studentName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.studentId} • {student.program}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${getAttendanceColor(
                        student.overallAttendance
                      )}`}
                    >
                      {student.overallAttendance}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.currentStreak} day streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Students:{" "}
                {Object.values(selectedStudents).filter(Boolean).length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Will be marked as: <strong>{bulkStatus}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowMarkAttendanceModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAttendance}
              disabled={
                isSubmitting ||
                Object.values(selectedStudents).filter(Boolean).length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <DocumentCheckIcon className="h-4 w-4 mr-2" />
                  Mark Attendance
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAttendance;
