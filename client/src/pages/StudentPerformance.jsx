import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  DocumentTextIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const StudentPerformance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Enhanced mock performance data
  const [performanceData] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "STU001",
      email: "john.doe@email.com",
      program: "IoT Development",
      currentGPA: 3.8,
      cumulativeGPA: 3.7,
      totalCredits: 45,
      completedCredits: 42,
      currentSemester: "Spring 2024",
      academicStanding: "Good Standing",
      grades: {
        "IoT Fundamentals": "A",
        "Embedded Systems": "A-",
        "Network Programming": "B+",
        "Database Design": "A",
        "Web Development": "B+",
      },
      assignments: {
        completed: 28,
        total: 30,
        averageScore: 92,
      },
      projects: {
        completed: 5,
        total: 5,
        averageGrade: "A-",
      },
      attendance: 95,
      participation: "Excellent",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      email: "jane.smith@email.com",
      program: "Software Development",
      currentGPA: 3.6,
      cumulativeGPA: 3.5,
      totalCredits: 42,
      completedCredits: 39,
      currentSemester: "Spring 2024",
      academicStanding: "Good Standing",
      grades: {
        "Data Structures": "B+",
        Algorithms: "A-",
        "Software Engineering": "A",
        "Database Systems": "B+",
        "Mobile Development": "A-",
      },
      assignments: {
        completed: 25,
        total: 28,
        averageScore: 88,
      },
      projects: {
        completed: 4,
        total: 5,
        averageGrade: "B+",
      },
      attendance: 88,
      participation: "Good",
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentId: "STU003",
      email: "mike.johnson@email.com",
      program: "IoT Development",
      currentGPA: 3.2,
      cumulativeGPA: 3.1,
      totalCredits: 38,
      completedCredits: 32,
      currentSemester: "Spring 2024",
      academicStanding: "Academic Warning",
      grades: {
        "IoT Fundamentals": "B",
        "Embedded Systems": "C+",
        "Network Programming": "B-",
        "Database Design": "C",
        "Web Development": "B",
      },
      assignments: {
        completed: 20,
        total: 25,
        averageScore: 78,
      },
      projects: {
        completed: 3,
        total: 4,
        averageGrade: "C+",
      },
      attendance: 75,
      participation: "Average",
    },
  ]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 3.0) return "text-blue-600";
    if (gpa >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
      case "A-":
        return "text-green-600 bg-green-100";
      case "B+":
      case "B":
      case "B-":
        return "text-blue-600 bg-blue-100";
      case "C+":
      case "C":
      case "C-":
        return "text-yellow-600 bg-yellow-100";
      case "D+":
      case "D":
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStandingColor = (standing) => {
    switch (standing) {
      case "Good Standing":
        return "text-green-600 bg-green-100";
      case "Academic Warning":
        return "text-yellow-600 bg-yellow-100";
      case "Academic Probation":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance & Grades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track student academic performance and grades
          </p>
        </div>
        <Button>
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getGPAColor(
                  performanceData.reduce(
                    (acc, student) => acc + student.currentGPA,
                    0
                  ) / performanceData.length
                )}`}
              >
                {(
                  performanceData.reduce(
                    (acc, student) => acc + student.currentGPA,
                    0
                  ) / performanceData.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average GPA</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {performanceData.reduce(
                  (acc, student) => acc + student.assignments.completed,
                  0
                )}
                /
                {performanceData.reduce(
                  (acc, student) => acc + student.assignments.total,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Assignments Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {performanceData.reduce(
                  (acc, student) => acc + student.projects.completed,
                  0
                )}
                /
                {performanceData.reduce(
                  (acc, student) => acc + student.projects.total,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(
                  performanceData.reduce(
                    (acc, student) => acc + student.completedCredits,
                    0
                  ) / performanceData.length
                )}
              </div>
              <div className="text-sm text-gray-600">Avg Credits Completed</div>
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
          <option value="">All GPA Ranges</option>
          <option value="3.5-4.0">3.5 - 4.0</option>
          <option value="3.0-3.4">3.0 - 3.4</option>
          <option value="2.5-2.9">2.5 - 2.9</option>
          <option value="below-2.5">Below 2.5</option>
        </select>
      </div>

      {/* Performance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {student.studentName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.studentId} • {student.program}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.currentSemester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getGPAColor(
                        student.currentGPA
                      )}`}
                    >
                      {student.currentGPA}
                    </div>
                    <div className="text-xs text-gray-600">Current GPA</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {student.completedCredits}/{student.totalCredits}
                    </div>
                    <div className="text-xs text-gray-600">Credits</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {student.assignments.completed}/
                      {student.assignments.total}
                    </div>
                    <div className="text-xs text-gray-600">Assignments</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {student.projects.completed}/{student.projects.total}
                    </div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>

                  <div className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStandingColor(
                        student.academicStanding
                      )}`}
                    >
                      {student.academicStanding}
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

      {/* Performance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Performance Details"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
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
                    Academic Summary
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getGPAColor(
                          selectedStudent.currentGPA
                        )}`}
                      >
                        {selectedStudent.currentGPA}
                      </div>
                      <div className="text-sm text-blue-600">Current GPA</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getGPAColor(
                          selectedStudent.cumulativeGPA
                        )}`}
                      >
                        {selectedStudent.cumulativeGPA}
                      </div>
                      <div className="text-sm text-green-600">
                        Cumulative GPA
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedStudent.completedCredits}/
                        {selectedStudent.totalCredits}
                      </div>
                      <div className="text-sm text-purple-600">Credits</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedStudent.currentSemester}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Current Semester
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Grades
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedStudent.grades).map(
                      ([course, grade]) => (
                        <div
                          key={course}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">{course}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                              grade
                            )}`}
                          >
                            {grade}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment & Project Summary
                  </label>
                  <div className="mt-2 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Assignments</span>
                        <span className="text-sm text-gray-600">
                          {selectedStudent.assignments.completed}/
                          {selectedStudent.assignments.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (selectedStudent.assignments.completed /
                                selectedStudent.assignments.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Average Score:{" "}
                        {selectedStudent.assignments.averageScore}%
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Projects</span>
                        <span className="text-sm text-gray-600">
                          {selectedStudent.projects.completed}/
                          {selectedStudent.projects.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (selectedStudent.projects.completed /
                                selectedStudent.projects.total) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Average Grade: {selectedStudent.projects.averageGrade}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Metrics
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Attendance:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Participation:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.participation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Academic Standing:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStandingColor(
                          selectedStudent.academicStanding
                        )}`}
                      >
                        {selectedStudent.academicStanding}
                      </span>
                    </div>
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

export default StudentPerformance;
