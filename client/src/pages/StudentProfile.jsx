import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import {
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { getStudents, deleteStudent } from "../services/api";

const StudentProfile = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudents();
        setStudents(response.data);
        setLoading(false);
      } catch {
        setError("Failed to load students");
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(studentId);
        setStudents(students.filter((student) => student.id !== studentId));
      } catch {
        setError("Failed to delete student");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Inactive":
        return "text-red-600 bg-red-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "Excellent":
        return "text-green-600";
      case "Good":
        return "text-blue-600";
      case "Average":
        return "text-yellow-600";
      case "Poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Program options for dropdown
  const programOptions = [
    { value: "IoT Development", label: "IoT Development" },
    { value: "Software Development", label: "Software Development" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Profiles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student information and profiles
          </p>
        </div>
        <Button onClick={handleAddStudent}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading students...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Students Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students
            .filter(
              (student) =>
                student.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                student.email
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                student.program
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
            .map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-16 w-16 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Program:
                      </span>
                      <span className="text-sm font-medium">
                        {student.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Student Type:
                      </span>
                      <span className="text-sm font-medium">
                        {student.studentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        GPA:
                      </span>
                      <span className="text-sm font-medium">{student.gpa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Credits:
                      </span>
                      <span className="text-sm font-medium">
                        {student.credits}
                      </span>
                    </div>
                    {student.studentType === "Internee" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Payment:
                          </span>
                          <span className="text-sm font-medium">
                            {student.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Remaining:
                          </span>
                          <span className="text-sm font-medium">
                            ${student.remainingAmount.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleViewStudent(student)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditStudent(student)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Student Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "add"
            ? "Add New Student"
            : modalType === "edit"
            ? "Edit Student"
            : "Student Details"
        }
        size="large"
      >
        {selectedStudent && modalType === "view" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h3 className="text-2xl font-semibold">
                  {selectedStudent.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedStudent.email}
                </p>
                <p className="text-sm text-gray-500">{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Personal Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>ID: {selectedStudent.idNumber}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        DOB:{" "}
                        {new Date(
                          selectedStudent.dateOfBirth
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedStudent.address}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Emergency: {selectedStudent.emergencyContact}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Academic Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Program:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">GPA:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.gpa}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Credits:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.credits}
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
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Enrollment Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedStudent.status
                        )}`}
                      >
                        {selectedStudent.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Student Type:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.studentType}
                      </span>
                    </div>
                    {selectedStudent.studentType === "Internee" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Internee Type:</span>
                          <span className="text-sm font-medium">
                            {selectedStudent.interneeType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Study Status:</span>
                          <span className="text-sm font-medium">
                            {selectedStudent.studyStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Payment Status:</span>
                          <span className="text-sm font-medium">
                            {selectedStudent.paymentStatus}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">Attendance:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Performance:</span>
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(
                          selectedStudent.performance
                        )}`}
                      >
                        {selectedStudent.performance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Enter full name" />
              <Input label="ID Number" placeholder="Enter ID number" />
              <Input label="Email" type="email" placeholder="Enter email" />
              <Input label="Phone" placeholder="Enter phone number" />
              <Input label="Date of Birth" type="date" />
              <Input label="Address" placeholder="Enter address" />
              <Input
                label="Emergency Contact"
                placeholder="Enter emergency contact"
              />
              <Select
                label="Program"
                placeholder="Select program"
                options={programOptions}
              />
              <Input
                label="GPA"
                type="number"
                step="0.1"
                placeholder="Enter GPA"
              />
              <Select
                label="Student Type"
                placeholder="Select student type"
                options={[
                  { value: "Internee", label: "Internee" },
                  { value: "Trainee", label: "Trainee" },
                ]}
              />
              <Select
                label="Enrollment Type"
                placeholder="Select enrollment type"
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                ]}
              />
              <Input label="Start Date" type="date" />
              <Input label="End Date" type="date" />
              <Input
                label="Total Fees"
                type="number"
                placeholder="Enter total fees"
              />
              <Input
                label="Paid Amount"
                type="number"
                placeholder="Enter paid amount"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {modalType === "add" ? "Add Student" : "Update Student"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentProfile;
