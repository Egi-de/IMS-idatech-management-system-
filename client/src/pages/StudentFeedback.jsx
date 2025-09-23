import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  ClipboardDocumentCheckIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const StudentFeedback = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Enhanced mock feedback data
  const [feedbackData] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "STU001",
      email: "john.doe@email.com",
      program: "IoT Development",
      overallRating: 4.2,
      feedbackCount: 8,
      lastFeedback: "2024-01-15",
      performanceRating: 4.5,
      participationRating: 4.0,
      attitudeRating: 4.8,
      skillRating: 4.2,
      feedback: [
        {
          id: 1,
          type: "instructor",
          instructor: "Dr. Sarah Wilson",
          course: "IoT Fundamentals",
          date: "2024-01-15",
          rating: 4.5,
          comments:
            "Excellent performance in IoT projects. Shows great initiative and problem-solving skills. Could benefit from more leadership opportunities.",
          recommendations:
            "Consider advanced IoT specialization courses. Would benefit from leadership training.",
          strengths: ["Problem Solving", "Technical Skills", "Initiative"],
          improvements: ["Leadership", "Communication"],
        },
        {
          id: 2,
          type: "peer",
          peer: "Jane Smith",
          course: "Embedded Systems",
          date: "2024-01-10",
          rating: 4.0,
          comments:
            "Great team player and always willing to help others. Very knowledgeable in embedded systems.",
          recommendations: "Keep up the excellent work!",
          strengths: ["Teamwork", "Knowledge", "Helpfulness"],
          improvements: [],
        },
        {
          id: 3,
          type: "self",
          date: "2024-01-05",
          rating: 4.0,
          comments:
            "I feel confident in my IoT skills but want to improve my presentation skills for project demonstrations.",
          goals: "Complete advanced IoT certification and lead a team project.",
          strengths: ["Technical Skills", "Dedication"],
          improvements: ["Presentation Skills", "Leadership"],
        },
      ],
      averageRating: 4.2,
      improvementAreas: ["Leadership", "Communication", "Presentation Skills"],
      strengths: [
        "Problem Solving",
        "Technical Skills",
        "Initiative",
        "Teamwork",
      ],
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      email: "jane.smith@email.com",
      program: "Software Development",
      overallRating: 4.0,
      feedbackCount: 6,
      lastFeedback: "2024-01-14",
      performanceRating: 4.2,
      participationRating: 3.8,
      attitudeRating: 4.5,
      skillRating: 4.0,
      feedback: [
        {
          id: 1,
          type: "instructor",
          instructor: "Prof. Michael Chen",
          course: "Data Structures",
          date: "2024-01-14",
          rating: 4.2,
          comments:
            "Strong analytical skills and good understanding of algorithms. Shows good progress in software development.",
          recommendations: "Focus on advanced algorithms and design patterns.",
          strengths: ["Analytical Skills", "Programming", "Progress"],
          improvements: ["Advanced Topics"],
        },
        {
          id: 2,
          type: "self",
          date: "2024-01-08",
          rating: 3.8,
          comments:
            "I need to work on time management for assignments and improve my debugging skills.",
          goals:
            "Complete all assignments on time and improve debugging efficiency.",
          strengths: ["Understanding", "Effort"],
          improvements: ["Time Management", "Debugging"],
        },
      ],
      averageRating: 4.0,
      improvementAreas: ["Time Management", "Debugging", "Advanced Topics"],
      strengths: [
        "Analytical Skills",
        "Programming",
        "Understanding",
        "Effort",
      ],
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentId: "STU003",
      email: "mike.johnson@email.com",
      program: "IoT Development",
      overallRating: 3.2,
      feedbackCount: 4,
      lastFeedback: "2024-01-10",
      performanceRating: 3.0,
      participationRating: 3.5,
      attitudeRating: 3.8,
      skillRating: 3.0,
      feedback: [
        {
          id: 1,
          type: "instructor",
          instructor: "Dr. Sarah Wilson",
          course: "IoT Fundamentals",
          date: "2024-01-10",
          rating: 3.0,
          comments:
            "Needs improvement in understanding core IoT concepts. Attendance has been inconsistent.",
          recommendations:
            "Focus on regular attendance and seek help during office hours. Consider tutoring support.",
          strengths: ["Attitude", "Effort"],
          improvements: ["Core Concepts", "Attendance", "Understanding"],
        },
        {
          id: 2,
          type: "self",
          date: "2024-01-05",
          rating: 3.5,
          comments:
            "I'm struggling with some of the technical concepts but I'm trying my best to catch up.",
          goals:
            "Improve understanding of IoT fundamentals and maintain regular attendance.",
          strengths: ["Effort", "Attitude"],
          improvements: ["Technical Understanding", "Attendance"],
        },
      ],
      averageRating: 3.2,
      improvementAreas: [
        "Core Concepts",
        "Attendance",
        "Technical Understanding",
      ],
      strengths: ["Effort", "Attitude"],
    },
  ]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.0) return "text-green-600";
    if (rating >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4.0) return "bg-green-100";
    if (rating >= 3.0) return "bg-yellow-100";
    return "bg-red-100";
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-gray-300" />
          <StarIcon
            className="absolute inset-0 h-4 w-4 text-yellow-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feedback & Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student feedback, evaluations, and performance reviews
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getRatingColor(
                  feedbackData.reduce(
                    (acc, student) => acc + student.overallRating,
                    0
                  ) / feedbackData.length
                )}`}
              >
                {(
                  feedbackData.reduce(
                    (acc, student) => acc + student.overallRating,
                    0
                  ) / feedbackData.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {feedbackData.reduce(
                  (acc, student) => acc + student.feedbackCount,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Feedback</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {feedbackData.filter((s) => s.overallRating >= 4.0).length}
              </div>
              <div className="text-sm text-gray-600">High Performers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {
                  feedbackData.filter(
                    (s) => s.overallRating >= 3.0 && s.overallRating < 4.0
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Average Performers</div>
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
          <option value="">All Ratings</option>
          <option value="4-5">4.0 - 5.0</option>
          <option value="3-4">3.0 - 3.9</option>
          <option value="2-3">2.0 - 2.9</option>
          <option value="below-2">Below 2.0</option>
        </select>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Feedback & Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackData.map((student) => (
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
                      {student.feedbackCount} feedback • Last:{" "}
                      {new Date(student.lastFeedback).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getRatingColor(
                        student.overallRating
                      )}`}
                    >
                      {student.overallRating}
                    </div>
                    <div className="text-xs text-gray-600">Overall</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        student.performanceRating
                      )}`}
                    >
                      {student.performanceRating}
                    </div>
                    <div className="text-xs text-gray-600">Performance</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        student.participationRating
                      )}`}
                    >
                      {student.participationRating}
                    </div>
                    <div className="text-xs text-gray-600">Participation</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        student.attitudeRating
                      )}`}
                    >
                      {student.attitudeRating}
                    </div>
                    <div className="text-xs text-gray-600">Attitude</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-lg font-semibold ${getRatingColor(
                        student.skillRating
                      )}`}
                    >
                      {student.skillRating}
                    </div>
                    <div className="text-xs text-gray-600">Skills</div>
                  </div>

                  <div className="flex space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingBgColor(
                        student.overallRating
                      )} ${getRatingColor(student.overallRating)}`}
                    >
                      {student.overallRating >= 4.0
                        ? "Excellent"
                        : student.overallRating >= 3.0
                        ? "Good"
                        : "Needs Improvement"}
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

      {/* Feedback Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Feedback & Evaluation Details"
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
                    Rating Summary
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getRatingColor(
                          selectedStudent.overallRating
                        )}`}
                      >
                        {selectedStudent.overallRating}
                      </div>
                      <div className="text-sm text-blue-600">
                        Overall Rating
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getRatingColor(
                          selectedStudent.performanceRating
                        )}`}
                      >
                        {selectedStudent.performanceRating}
                      </div>
                      <div className="text-sm text-green-600">Performance</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getRatingColor(
                          selectedStudent.participationRating
                        )}`}
                      >
                        {selectedStudent.participationRating}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Participation
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${getRatingColor(
                          selectedStudent.skillRating
                        )}`}
                      >
                        {selectedStudent.skillRating}
                      </div>
                      <div className="text-sm text-purple-600">Skills</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Strengths & Areas for Improvement
                  </label>
                  <div className="mt-2 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.strengths.map((strength, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-600 mb-2">
                        Areas for Improvement
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.improvementAreas.map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recent Feedback
                  </label>
                  <div className="mt-2 space-y-3">
                    {selectedStudent.feedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-sm font-medium">
                              {feedback.type === "instructor" &&
                                `Instructor: ${feedback.instructor}`}
                              {feedback.type === "peer" &&
                                `Peer: ${feedback.peer}`}
                              {feedback.type === "self" && "Self Evaluation"}
                            </h4>
                            {feedback.course && (
                              <p className="text-xs text-gray-600">
                                {feedback.course}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {renderStars(feedback.rating)}
                            </div>
                            <span className="text-sm font-medium ml-2">
                              {feedback.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {feedback.comments}
                        </p>
                        {feedback.recommendations && (
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Recommendations:</strong>{" "}
                            {feedback.recommendations}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(feedback.date).toLocaleDateString()}
                        </p>
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

export default StudentFeedback;
