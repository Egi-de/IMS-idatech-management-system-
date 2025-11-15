import React, { useState, useEffect, useCallback } from "react";
import {
  getStudents,
  getStudentAIEvaluation,
  generateStudentAIEvaluation,
  updateStudent,
} from "../services/api";
import { API_BASE_URL } from "../services/api";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
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
  CpuChipIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const StudentFeedback = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState(null);
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

        // Check if AI evaluation data is available and use AI ratings when possible
        const aiEvaluation = student.ai_evaluation_data;
        const hasAI = aiEvaluation && aiEvaluation.result;

        const performanceRating =
          hasAI && aiEvaluation.result.performance_rating
            ? parseFloat(aiEvaluation.result.performance_rating)
            : getPerformanceRating(student.performance) ||
              (student.gpa ? parseFloat(student.gpa) : 0);

        const participationRating =
          hasAI && aiEvaluation.result.participation_rating
            ? parseFloat(aiEvaluation.result.participation_rating)
            : (student.overallAttendance / 100) * 5;

        const attitudeRating =
          hasAI && aiEvaluation.result.attitude_rating
            ? parseFloat(aiEvaluation.result.attitude_rating)
            : Math.min(
                5,
                (student.totalPoints || 0) / 20 +
                  (student.achievements ? student.achievements.length : 0) * 0.5
              );

        let skillRating =
          hasAI && aiEvaluation.result.skills_rating
            ? parseFloat(aiEvaluation.result.skills_rating)
            : 0;

        if (!hasAI || !aiEvaluation.result.skills_rating) {
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
        }

        const subRatingsAvg =
          (performanceRating +
            participationRating +
            attitudeRating +
            skillRating) /
          4;
        const overallRating =
          hasAI && aiEvaluation.result.overall_rating
            ? parseFloat(aiEvaluation.result.overall_rating)
            : feedbackAvg > 0
            ? (feedbackAvg + subRatingsAvg) / 2
            : subRatingsAvg;
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
          avatar: student.avatar,
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

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setAiEvaluation(null);
    setGeneratingAI(false);

    // Fetch AI evaluation if available
    try {
      const aiResponse = await getStudentAIEvaluation(student.id);
      if (aiResponse.data.ai_evaluation_data) {
        setAiEvaluation(aiResponse.data.ai_evaluation_data);
      }
    } catch {
      console.log("No AI evaluation available for this student");
    }

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
            AI-Powered Feedback & Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-generated unbiased evaluations and performance insights
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Manual Feedback
        </Button>
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

      {/* Feedback Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Overall Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Participation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length > 0 ? (
                filteredData.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                student.avatar.startsWith("http")
                                  ? student.avatar
                                  : `${API_BASE_URL}/${student.avatar}`
                              }
                              alt={student.studentName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            ID: {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.overallRating
                        )} ${getRatingColor(student.overallRating)}`}
                      >
                        {student.overallRating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.performanceRating
                        )} ${getRatingColor(student.performanceRating)}`}
                      >
                        {student.performanceRating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.participationRating
                        )} ${getRatingColor(student.participationRating)}`}
                      >
                        {student.participationRating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.attitudeRating
                        )} ${getRatingColor(student.attitudeRating)}`}
                      >
                        {student.attitudeRating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.skillRating
                        )} ${getRatingColor(student.skillRating)}`}
                      >
                        {student.skillRating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingBgColor(
                          student.overallRating
                        )} ${getRatingColor(student.overallRating)}`}
                      >
                        {student.overallRating >= 4.0
                          ? "Excellent"
                          : student.overallRating >= 3.0
                          ? "Good"
                          : "Needs Improvement"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleViewDetails(student)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="AI-Powered Feedback & Evaluation Details"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
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
              <Button
                onClick={async () => {
                  setGeneratingAI(true);
                  try {
                    const response = await generateStudentAIEvaluation(
                      selectedStudent.id
                    );
                    setAiEvaluation(response.data.ai_evaluation_data);
                    await fetchFeedbackData(); // Refresh data
                    alert("AI evaluation generated successfully!");
                  } catch (err) {
                    console.error("AI generation error:", err);
                    alert(
                      "Failed to generate AI evaluation. Please try again."
                    );
                  } finally {
                    setGeneratingAI(false);
                  }
                }}
                disabled={generatingAI}
                className="flex items-center space-x-2"
              >
                {generatingAI ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CpuChipIcon className="h-4 w-4" />
                )}
                <span>
                  {generatingAI ? "Generating..." : "Regenerate AI Evaluation"}
                </span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Generated Rating Summary
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {aiEvaluation ? (
                      <>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div
                            className={`text-2xl font-bold ${getRatingColor(
                              aiEvaluation.result?.overall_rating ||
                                selectedStudent.overallRating
                            )}`}
                          >
                            {aiEvaluation.result?.overall_rating ||
                              selectedStudent.overallRating}
                          </div>
                          <div className="text-sm text-blue-600">
                            Overall Rating
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div
                            className={`text-2xl font-bold ${getRatingColor(
                              aiEvaluation.result?.performance_rating ||
                                selectedStudent.performanceRating
                            )}`}
                          >
                            {aiEvaluation.result?.performance_rating ||
                              selectedStudent.performanceRating}
                          </div>
                          <div className="text-sm text-green-600">
                            Performance
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div
                            className={`text-2xl font-bold ${getRatingColor(
                              aiEvaluation.result?.participation_rating ||
                                selectedStudent.participationRating
                            )}`}
                          >
                            {aiEvaluation.result?.participation_rating ||
                              selectedStudent.participationRating}
                          </div>
                          <div className="text-sm text-yellow-600">
                            Participation
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div
                            className={`text-2xl font-bold ${getRatingColor(
                              aiEvaluation.result?.skills_rating ||
                                selectedStudent.skillRating
                            )}`}
                          >
                            {aiEvaluation.result?.skills_rating ||
                              selectedStudent.skillRating}
                          </div>
                          <div className="text-sm text-purple-600">Skills</div>
                        </div>
                      </>
                    ) : (
                      <>
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
                          <div className="text-sm text-green-600">
                            Performance
                          </div>
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
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Generated Strengths & Areas for Improvement
                  </label>
                  <div className="mt-2 space-y-3">
                    {aiEvaluation ? (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-2">
                            Strengths
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiEvaluation.result?.strengths?.map(
                              (strength, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                >
                                  {strength}
                                </span>
                              )
                            ) || (
                              <span className="text-gray-500 text-xs">
                                No AI strengths available
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-600 mb-2">
                            Areas for Improvement
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiEvaluation.result?.areas_for_improvement?.map(
                              (area, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                                >
                                  {area}
                                </span>
                              )
                            ) || (
                              <span className="text-gray-500 text-xs">
                                No AI improvements available
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-2">
                            Strengths
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.strengths.map(
                              (strength, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                >
                                  {strength}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-600 mb-2">
                            Areas for Improvement
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.improvementAreas.map(
                              (area, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                                >
                                  {area}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Recommendations
                  </label>
                  <div className="mt-2">
                    {aiEvaluation?.result?.recommendations ? (
                      <div className="space-y-2">
                        {aiEvaluation.result.recommendations.map(
                          (rec, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 rounded-lg"
                            >
                              <p className="text-sm text-blue-700">{rec}</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No AI recommendations available. Click "Regenerate AI
                        Evaluation" to generate insights.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Manual Feedback History
                  </label>
                  <div className="mt-2 space-y-3">
                    {selectedStudent.feedback.length > 0 ? (
                      selectedStudent.feedback.map((feedback) => (
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
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No manual feedback available.
                      </p>
                    )}
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
