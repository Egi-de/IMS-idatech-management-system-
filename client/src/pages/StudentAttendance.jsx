import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { API_BASE_URL } from "../services/api";
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { getStudents, markAttendance } from "../services/api";

const StudentAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedProgram, setSelectedProgram] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await getStudents();
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load students data");
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAttendanceChange = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    filteredStudents.forEach((student) => {
      newAttendance[student.id] = true;
    });
    setAttendance(newAttendance);
  };

  const handleClearAll = () => {
    setAttendance({});
  };

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);

    try {
      // Get selected students (those marked as present)
      const selectedStudentIds = Object.keys(attendance).filter(
        (id) => attendance[id]
      );

      if (selectedStudentIds.length === 0) {
        alert("Please mark at least one student as present.");
        setIsSubmitting(false);
        return;
      }

      // Prepare attendance data for API
      const attendanceData = {
        date: selectedDate,
        status: "present",
        student_ids: selectedStudentIds,
      };

      // Make API call to mark attendance
      await markAttendance(attendanceData);

      // Reset attendance state
      setAttendance({});

      // Show success message
      alert(
        `Attendance marked successfully for ${selectedStudentIds.length} students!`
      );
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.idNumber.includes(searchQuery);
    const matchesProgram =
      !selectedProgram || student.program === selectedProgram;
    return matchesSearch && matchesProgram;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading students data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 mx-auto mb-4">Error</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Students Data
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance & Participation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Mark student attendance for the selected date
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Programs</option>
              <option value="Software Development">Software Development</option>
              <option value="IoT Development">IoT Development</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleMarkAllPresent}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              Mark All Present
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex-1"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student) => (
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
                          alt={student.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {student.idNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {student.program}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {selectedDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={attendance[student.id] || false}
                    onChange={() => handleAttendanceChange(student.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmitAttendance}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            "Submit Attendance"
          )}
        </Button>
      </div>
    </div>
  );
};

export default StudentAttendance;
