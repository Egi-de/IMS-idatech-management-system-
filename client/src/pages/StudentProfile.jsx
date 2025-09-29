import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import { toast } from "react-toastify";
import {
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { getStudents, deleteStudent, updateStudent } from "../services/api";

// Grading scale constants for GPA calculation
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

// Calculate GPA from grades object
const calculateGPAFromGrades = (grades) => {
  if (!grades || Object.keys(grades).length === 0) return 0;
  const marks = Object.values(grades);
  const grade = getGrade(marks);
  return getGPA(grade);
};

const StudentProfile = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [editFormData, setEditFormData] = useState({});
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedStudent) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await updateStudent(selectedStudent.id, formData);
      toast.success("Profile image updated successfully!");
      // Refetch students to update the list
      const response = await getStudents();
      setStudents(response.data);
    } catch (err) {
      toast.error("Failed to update profile image.");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageClick = (student) => {
    setSelectedStudent(student);
    fileInputRef.current?.click();
  };

  const handleEditStudent = (student) => {
    const computedGPA = calculateGPAFromGrades(student.grades);
    const editData = { ...student, gpa: computedGPA };
    setEditFormData(editData);
    setSelectedStudent(student);
    setModalType("edit");
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const totalFeesValue = parseFloat(editFormData.totalFees) || 0;
    const paidAmountValue = parseFloat(editFormData.paidAmount) || 0;
    const remainingAmountValue = Math.max(0, totalFeesValue - paidAmountValue);

    let paymentStatusValue = editFormData.paymentStatus;
    if (editFormData.studentType === "Internee") {
      if (remainingAmountValue === 0) {
        paymentStatusValue = "Paid";
      } else if (paidAmountValue > 0) {
        paymentStatusValue = "Partial";
      } else {
        paymentStatusValue = "Pending";
      }
    }

    // Remove gpa from data to prevent overriding computed value
    const { gpa: _gpa, ...updateData } = editFormData;
    const updatedData = {
      ...updateData,
      remainingAmount:
        editFormData.studentType === "Internee" ? remainingAmountValue : 0,
      paymentStatus:
        editFormData.studentType === "Internee" ? paymentStatusValue : null,
      totalFees: editFormData.studentType === "Internee" ? totalFeesValue : 0,
      paidAmount: editFormData.studentType === "Internee" ? paidAmountValue : 0,
    };

    try {
      await updateStudent(selectedStudent.id, updatedData);
      toast.success("Student updated successfully!");
      setShowModal(false);
      // Refetch students
      const response = await getStudents();
      setStudents(response.data);
    } catch (err) {
      toast.error("Failed to update student.");
      console.error(err);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setModalType("view");
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

  const getComputedPaymentStatus = (student) => {
    if (student.studentType !== "Internee") return null;
    const totalFees = student.totalFees || 0;
    const paidAmount = student.paidAmount || 0;
    const remaining = totalFees - paidAmount;
    if (remaining <= 0) return "Paid";
    if (paidAmount > 0) return "Partial";
    return "Pending";
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-green-600 bg-green-100";
      case "Partial":
        return "text-yellow-600 bg-yellow-100";
      case "Pending":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Program options for dropdown
  const programOptions = [
    { value: "IoT Development", label: "IoT Development" },
    { value: "Software Development", label: "Software Development" },
  ];

  const getAvatarUrl = (avatar) => {
    if (!avatar) {
      return "https://via.placeholder.com/64x64/6B7280/FFFFFF?text=Student";
    }
    // Assuming avatar is a relative path from Django media, prepend the media URL
    // Adjust the base URL based on your Django settings (e.g., MEDIA_URL)
    if (avatar.startsWith("/media/")) {
      return `http://localhost:8000${avatar}`;
    }
    return avatar;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Profiles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View enrolled student profiles and information
          </p>
        </div>
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
              <Card key={student.id} className="" hover={false}>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(student.avatar)}
                        alt={student.name}
                        className="h-16 w-16 rounded-full"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/64x64/6B7280/FFFFFF?text=Student";
                        }}
                      />
                      <div
                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(student);
                        }}
                      >
                        <CameraIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      {uploading && student.id === selectedStudent?.id && (
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                          <CameraIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
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
                      <span className="text-sm font-medium">
                        {student.gpa?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    {student.studentType === "Internee" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Payment:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              getComputedPaymentStatus(student)
                            )}`}
                          >
                            {getComputedPaymentStatus(student)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Remaining:
                          </span>
                          <span className="text-sm font-medium">
                            $
                            {Math.max(
                              0,
                              (student.totalFees || 0) -
                                (student.paidAmount || 0)
                            ).toLocaleString()}
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
              <div className="relative">
                <img
                  src={getAvatarUrl(selectedStudent.avatar)}
                  alt={selectedStudent.name}
                  className="h-20 w-20 rounded-full"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/80x80/6B7280/FFFFFF?text=Student";
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(selectedStudent);
                  }}
                >
                  <CameraIcon className="h-5 w-5 text-gray-600" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    <CameraIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
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
                        {selectedStudent.gpa?.toFixed(1) || "0.0"}
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
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              getComputedPaymentStatus(selectedStudent)
                            )}`}
                          >
                            {getComputedPaymentStatus(selectedStudent)}
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
                {selectedStudent.studentType === "Internee" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Financial Information
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Fees:</span>
                        <span className="text-sm font-medium">
                          ${(selectedStudent.totalFees || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Paid Amount:</span>
                        <span className="text-sm font-medium">
                          ${(selectedStudent.paidAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Remaining Amount:</span>
                        <span className="text-sm font-medium">
                          $
                          {Math.max(
                            0,
                            (selectedStudent.totalFees || 0) -
                              (selectedStudent.paidAmount || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {modalType === "edit" && selectedStudent && (
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={editFormData.name || ""}
                onChange={handleEditChange}
                placeholder="Enter full name"
              />
              <Input
                label="ID Number"
                name="idNumber"
                value={editFormData.idNumber || ""}
                onChange={handleEditChange}
                placeholder="Enter ID number"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={editFormData.email || ""}
                onChange={handleEditChange}
                placeholder="Enter email"
              />
              <Input
                label="Phone"
                name="phone"
                value={editFormData.phone || ""}
                onChange={handleEditChange}
                placeholder="Enter phone number"
              />
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={
                  editFormData.dateOfBirth
                    ? new Date(editFormData.dateOfBirth)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleEditChange}
              />
              <Input
                label="Address"
                name="address"
                value={editFormData.address || ""}
                onChange={handleEditChange}
                placeholder="Enter address"
              />
              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={editFormData.emergencyContact || ""}
                onChange={handleEditChange}
                placeholder="Enter emergency contact"
              />
              <Select
                label="Program"
                name="program"
                value={editFormData.program || ""}
                onChange={(value) => handleSelectChange("program", value)}
                placeholder="Select program"
                options={programOptions}
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <label className="block text-sm font-medium text-gray-700">
                  GPA
                </label>
                <span className="text-sm font-medium text-gray-900">
                  {editFormData.gpa?.toFixed(1) || "0.0"}
                </span>
              </div>
              <Select
                label="Student Type"
                name="studentType"
                value={editFormData.studentType || ""}
                onChange={(value) => handleSelectChange("studentType", value)}
                placeholder="Select student type"
                options={[
                  { value: "Internee", label: "Internee" },
                  { value: "Trainee", label: "Trainee" },
                ]}
              />
              <Select
                label="Enrollment Type"
                name="enrollmentType"
                value={editFormData.enrollmentType || ""}
                onChange={(value) =>
                  handleSelectChange("enrollmentType", value)
                }
                placeholder="Select enrollment type"
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                ]}
              />
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={
                  editFormData.startDate
                    ? new Date(editFormData.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleEditChange}
              />
              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={
                  editFormData.endDate
                    ? new Date(editFormData.endDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleEditChange}
              />
              {editFormData.studentType === "Internee" && (
                <>
                  <Input
                    label="Total Fees"
                    type="number"
                    name="totalFees"
                    value={editFormData.totalFees || ""}
                    onChange={handleEditChange}
                    placeholder="Enter total fees"
                    step="0.01"
                  />
                  <Input
                    label="Paid Amount"
                    type="number"
                    name="paidAmount"
                    value={editFormData.paidAmount || ""}
                    onChange={handleEditChange}
                    placeholder="Enter paid amount"
                    step="0.01"
                  />
                  <Input
                    label="Remaining Amount"
                    type="number"
                    name="remainingAmount"
                    value={Math.max(
                      0,
                      (editFormData.totalFees || 0) -
                        (editFormData.paidAmount || 0)
                    )}
                    placeholder="Remaining amount"
                    step="0.01"
                    readOnly
                  />
                  <Select
                    label="Payment Status"
                    name="paymentStatus"
                    value={editFormData.paymentStatus || ""}
                    onChange={(value) =>
                      handleSelectChange("paymentStatus", value)
                    }
                    placeholder="Select payment status"
                    options={[
                      { value: "Paid", label: "Paid" },
                      { value: "Pending", label: "Pending" },
                      { value: "Partial", label: "Partial" },
                    ]}
                  />
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </Modal>
    </div>
  );
};

export default StudentProfile;
