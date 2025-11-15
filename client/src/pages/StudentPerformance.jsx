import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import { toast } from "react-toastify";
import { getStudents, updateStudent } from "../services/api.js";
import { API_BASE_URL } from "../services/api";
import { UserIcon } from "@heroicons/react/24/outline";

// Grading scale constants
const GRADING_SCALE = {
  A: { min: 90, max: 100, gpa: 4.0 },
  B: { min: 80, max: 89, gpa: 3.0 },
  C: { min: 70, max: 79, gpa: 2.0 },
  D: { min: 60, max: 69, gpa: 1.0 },
  F: { min: 0, max: 59, gpa: 0.0 },
};

// Calculate grade from marks
const getGrade = (marks) => {
  const avg =
    marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
  for (const [grade, range] of Object.entries(GRADING_SCALE)) {
    if (avg >= range.min && avg <= range.max) return grade;
  }
  return "F";
};

// Calculate GPA from grade
const getGPA = (grade) => GRADING_SCALE[grade]?.gpa || 0;

const StudentPerformance = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("All");
  const [marks, setMarks] = useState({});

  // Available programs
  const programs = [
    "All",
    "IoT (Internet of Things)",
    "SOD (Software Development)",
  ];

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStudents();
        let mappedStudents = response.data.map((student) => ({
          id: student.id,
          studentName: student.name,
          studentId: student.idNumber || "N/A",
          program: student.program || "N/A",
          grades: student.grades || {},
          avatar: student.avatar,
        }));

        setStudents(mappedStudents);
        setFilteredStudents(mappedStudents);
      } catch (err) {
        setError("Failed to fetch students. Please try again.");
        toast.error("Failed to fetch students.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students by program
  useEffect(() => {
    if (selectedProgram === "All") {
      setFilteredStudents(students);
    } else {
      // More flexible filtering - check if program contains key terms
      const filtered = students.filter((student) => {
        const studentProgram = (student.program || "").toLowerCase();
        if (selectedProgram === "IoT (Internet of Things)") {
          return (
            studentProgram.includes("iot") ||
            studentProgram.includes("internet of things")
          );
        } else if (selectedProgram === "SOD (Software Development)") {
          return (
            studentProgram.includes("sod") ||
            studentProgram.includes("software development") ||
            studentProgram.includes("software dev")
          );
        }
        return studentProgram === selectedProgram.toLowerCase();
      });
      setFilteredStudents(filtered);
    }
  }, [students, selectedProgram]);

  // Handle mark input change
  const handleMarkChange = (studentId, value) => {
    const mark = parseFloat(value) || 0;
    if (mark < 0 || mark > 100) {
      toast.error("Mark must be between 0 and 100.");
      return;
    }
    setMarks((prev) => ({
      ...prev,
      [studentId]: mark,
    }));
  };

  // Calculate grade and GPA for a student
  const calculateGradeAndGPA = (studentId) => {
    const mark = marks[studentId] || 0;
    const grade = getGrade([mark]);
    const gpa = getGPA(grade);
    return { grade, gpa };
  };

  // Handle save marks
  const handleSaveMarks = async () => {
    if (!selectedSubject || !assignmentDate) {
      toast.error("Please select a subject and assignment date.");
      return;
    }

    try {
      setLoading(true);
      const savePromises = filteredStudents.map(async (student) => {
        const mark = marks[student.id] || 0;
        const grade = getGrade([mark]);
        const updatedGrades = {
          ...student.grades,
          [selectedSubject]: grade,
        };

        // Send grades as JSON string since FormData converts objects to strings
        return updateStudent(student.id, {
          grades: JSON.stringify(updatedGrades),
          gpa: getGPA(grade),
        });
      });

      await Promise.all(savePromises);
      toast.success("Marks saved successfully!");
    } catch (err) {
      toast.error("Failed to save marks.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance & Grades
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Record student marks manually
        </p>
      </div>

      {/* Top Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border sticky top-0 z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Program Filter
            </label>
            <Select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              options={programs.map((program) => ({
                value: program,
                label: program,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <Input
              type="text"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Date
            </label>
            <Input
              type="date"
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              onClick={handleSaveMarks}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Saving..." : "Save Marks"}
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  GPA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => {
                const { grade, gpa } = calculateGradeAndGPA(student.id);
                const mark = marks[student.id] || 0;
                return (
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
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.studentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {selectedSubject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={marks[student.id] || ""}
                        onChange={(e) =>
                          handleMarkChange(student.id, e.target.value)
                        }
                        className="w-20"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mark >= 80
                            ? "bg-green-100 text-green-800"
                            : mark < 50
                            ? "bg-red-100 text-red-800"
                            : grade === "A"
                            ? "bg-green-100 text-green-800"
                            : grade === "B"
                            ? "bg-blue-100 text-blue-800"
                            : grade === "C"
                            ? "bg-yellow-100 text-yellow-800"
                            : grade === "D"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {gpa.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Students Displayed */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Students Displayed: {filteredStudents.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
