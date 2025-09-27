import React, { useState, useEffect, useCallback } from "react";
import { getStudents, updateStudent } from "../services/api";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    studentId: "",
    type: "instructor",
    instructor: "",
    peer: "",
    course: "",
    rating: 5,
    comments: "",
    recommendations: "",
    strengths: [],
    improvements: [],
    goals: "",
  });

  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic feedback data fetched from API

  const fetchFeedbackData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudents();
      const students = response.data.filter((s) => !s.is_deleted);
      const transformedData = students.map((student) => {
        const feedback = student.feedback || [];
        const ratings = feedback.map((f) => f.rating).filter((r) => r != null);
        const feedbackAvg =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        const performanceRating =
          getPerformanceRating(student.performance) ||
          (student.gpa ? parseFloat(student.gpa) : 0);
        const participationRating = (student.overallAttendance / 100) * 5;
        const attitudeRating =
          Math.min(
            5,
            (student.totalPoints || 0) / 20 +
              (student.achievements ? student.achievements.length : 0) * 0.5
          ) || 3.0;
        let skillRating = 0;
        if (student.gpa) {
          skillRating = parseFloat(student.gpa);
        } else if (student.grades && Object.keys(student.grades).length > 0) {
          const gradeValues = Object.values(student.grades)
            .map((g) => parseFloat(g))
            .filter((g) => !isNaN(g));
          if (gradeValues.length > 0) {
            skillRating =
              gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length;
          }
        }

        const subRatingsAvg =
          (performanceRating +
            participationRating +
            attitudeRating +
            skillRating) /
          4;
        const overallRating =
          feedbackAvg > 0 ? (feedbackAvg + subRatingsAvg) / 2 : subRatingsAvg;
        const cappedOverall = Math.min(5, Math.max(0, overallRating));

        const allStrengths = feedback.flatMap((f) => f.strengths || []);
        const allImprovements = feedback.flatMap((f) => f.improvements || []);
        const uniqueStrengths = [...new Set(allStrengths)];
        const uniqueImprovements = [...new Set(allImprovements)];
        const dates = feedback.map((f) => f.date).filter((d) => d);
        const lastFeedback =
          dates.length > 0
            ? new Date(Math.max(...dates.map((d) => new Date(d))))
                .toISOString()
                .split("T")[0]
            : null;

        return {
          id: student.id,
          studentName: student.name,
          studentId: student.idNumber,
          email: student.email,
          program: student.program,
          feedback,
          feedbackCount: feedback.length,
          lastFeedback,
          overallRating: parseFloat(cappedOverall.toFixed(1)),
          performanceRating: parseFloat(performanceRating.toFixed(1)),
          participationRating: parseFloat(participationRating.toFixed(1)),
          attitudeRating: parseFloat(attitudeRating.toFixed(1)),
          skillRating: parseFloat(skillRating.toFixed(1)),
          averageRating: parseFloat(cappedOverall.toFixed(1)),
          improvementAreas: uniqueImprovements,
          strengths: uniqueStrengths,
        };
      });
      setFeedbackData(transformedData);
    } catch (err) {
      setError(err.message || "Failed to fetch student feedback data");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbackData();
  }, [fetchFeedbackData]);

  const getPerformanceRating = (performance) => {
    const mapping = {
      Excellent: 4.5,
      Good: 4.0,
      Average: 3.0,
      Poor: 2.0,
    };
    return mapping[performance] || 0;
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.studentId || !newFeedback.comments) {
      alert("Please fill in all required fields");
      return;
    }

    // Find the student to add feedback to (studentId is now the numerical id)
    const studentIdNum = parseInt(newFeedback.studentId);
    if (isNaN(studentIdNum)) {
      alert("Invalid student ID selected");
      return;
    }
    const student = feedbackData.find((s) => s.id === studentIdNum);
    if (!student) {
      alert("Selected student not found");
      return;
    }
    const feedbackEntry = {
      id: Date.now(),
      type: newFeedback.type,
      date: new Date().toISOString().split("T")[0],
      rating: newFeedback.rating,
      comments: newFeedback.comments,
      recommendations: newFeedback.recommendations,
      strengths: newFeedback.strengths || [],
      improvements: newFeedback.improvements || [],
      goals: newFeedback.goals,
      ...(newFeedback.type === "instructor" && {
        instructor: newFeedback.instructor,
      }),
      ...(newFeedback.type === "peer" && { peer: newFeedback.peer }),
      ...(newFeedback.course && { course: newFeedback.course }),
    };

    console.log("Submitting feedback for student ID:", studentIdNum);
    console.log("Feedback entry:", feedbackEntry);

    // Append to feedback array
    const updatedFeedback = [...(student.feedback || []), feedbackEntry];

    try {
      await updateStudent(student.id, { feedback: updatedFeedback });
      // Refetch data to update UI
      await fetchFeedbackData();
      // Reset form and close modal
      setNewFeedback({
        studentId: "",
        type: "instructor",
        instructor: "",
        peer: "",
        course: "",
        rating: 5,
        comments: "",
        recommendations: "",
        strengths: [],
        improvements: [],
        goals: "",
      });
      setShowAddModal(false);
      alert("Feedback added successfully!");
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.message;
      alert(`Failed to add feedback: ${errorMsg}`);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading feedback data...
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

  const filteredData = feedbackData.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button onClick={() => setShowAddModal(true)}>
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
                      <p className="text-xs text-gray-500">
                        {student.feedbackCount} feedback • Last:{" "}
                        {student.lastFeedback
                          ? new Date(student.lastFeedback).toLocaleDateString()
                          : "No feedback yet"}
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
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No students found matching the search criteria.
              </p>
            )}
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

      {/* Add Feedback Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Feedback"
        size="large"
      >
        <form onSubmit={handleAddFeedback} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Student ID *
              </label>
              <select
                name="studentId"
                value={newFeedback.studentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Student</option>
                {feedbackData.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentId} - {student.studentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback Type
              </label>
              <select
                name="type"
                value={newFeedback.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="instructor">Instructor</option>
                <option value="peer">Peer</option>
                <option value="self">Self</option>
              </select>
            </div>

            {newFeedback.type === "instructor" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructor Name
                </label>
                <input
                  type="text"
                  name="instructor"
                  value={newFeedback.instructor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter instructor name"
                />
              </div>
            )}

            {newFeedback.type === "peer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Peer Name
                </label>
                <input
                  type="text"
                  name="peer"
                  value={newFeedback.peer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter peer name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course (Optional)
              </label>
              <input
                type="text"
                name="course"
                value={newFeedback.course}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <select
                name="rating"
                value={newFeedback.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments *
            </label>
            <textarea
              name="comments"
              value={newFeedback.comments}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed feedback comments"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommendations (Optional)
            </label>
            <textarea
              name="recommendations"
              value={newFeedback.recommendations}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recommendations for improvement"
            />
          </div>

          {newFeedback.type === "self" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goals (Optional)
              </label>
              <textarea
                name="goals"
                value={newFeedback.goals}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter personal goals"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Feedback</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentFeedback;
