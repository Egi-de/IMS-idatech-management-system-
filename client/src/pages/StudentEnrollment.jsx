import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";

const StudentEnrollment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    address: "",
    program: "",
    studentType: "",
    enrollmentDate: "",
    startDate: "",
    endDate: "",
    interneeType: "",
    studyStatus: "",
    totalFees: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentStatus: "Pending",
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await getStudents();
        setEnrollments(response.data);
        setLoading(false);
      } catch {
        setError("Failed to load enrollments");
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };

      // Auto-calculate remaining amount when totalFees or paidAmount changes and studentType is Internee
      if (
        newFormData.studentType === "Internee" &&
        (name === "totalFees" || name === "paidAmount")
      ) {
        const total = parseFloat(newFormData.totalFees) || 0;
        const paid = parseFloat(newFormData.paidAmount) || 0;
        newFormData.remainingAmount = Math.max(0, total - paid);
      }

      return newFormData;
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      idNumber: "",
      email: "",
      phone: "",
      address: "",
      program: "",
      studentType: "",
      enrollmentDate: "",
      startDate: "",
      endDate: "",
      interneeType: "",
      studyStatus: "",
      totalFees: 0,
      paidAmount: 0,
      remainingAmount: 0,
      paymentStatus: "Pending",
    });
  };

  const handleAddEnrollment = () => {
    resetForm();
    setSelectedEnrollment(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEditEnrollment = (enrollment) => {
    const total = enrollment.totalFees || 0;
    const paid = enrollment.paidAmount || 0;
    const remaining = Math.max(0, total - paid);

    setFormData({
      name: enrollment.name,
      idNumber: enrollment.idNumber,
      email: enrollment.email,
      phone: enrollment.phone || "",
      address: enrollment.address || "",
      program: enrollment.program,
      studentType: enrollment.studentType || "",
      enrollmentDate: enrollment.enrollmentDate
        ? new Date(enrollment.enrollmentDate).toISOString().split("T")[0]
        : "",
      startDate: enrollment.startDate
        ? new Date(enrollment.startDate).toISOString().split("T")[0]
        : "",
      endDate: enrollment.endDate
        ? new Date(enrollment.endDate).toISOString().split("T")[0]
        : "",
      interneeType:
        enrollment.studentType === "Internee"
          ? enrollment.interneeType || ""
          : "",
      studyStatus:
        enrollment.studentType === "Internee"
          ? enrollment.studyStatus || ""
          : "",
      totalFees: enrollment.studentType === "Internee" ? total : 0,
      paidAmount: enrollment.studentType === "Internee" ? paid : 0,
      remainingAmount: enrollment.studentType === "Internee" ? remaining : 0,
      paymentStatus:
        enrollment.studentType === "Internee"
          ? enrollment.paymentStatus || "Pending"
          : "Pending",
    });
    setSelectedEnrollment(enrollment);
    setModalType("edit");
    setShowModal(true);
  };

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType("view");
    setShowModal(true);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      try {
        await deleteStudent(enrollmentId);
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        toast.success("Enrollment deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete enrollment.");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalFeesValue = parseFloat(formData.totalFees) || 0;
      const paidAmountValue = parseFloat(formData.paidAmount) || 0;
      const remainingAmountValue = Math.max(
        0,
        totalFeesValue - paidAmountValue
      );

      let paymentStatusValue = formData.paymentStatus;
      if (formData.studentType === "Internee") {
        if (remainingAmountValue === 0) {
          paymentStatusValue = "Paid";
        } else if (paidAmountValue > 0) {
          paymentStatusValue = "Partial";
        } else {
          paymentStatusValue = "Pending";
        }
      }

      const baseStudentData = {
        name: formData.name,
        idNumber: formData.idNumber,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        program: formData.program,
        year: new Date().getFullYear().toString(),
        status: "Active",
        avatar: null,
        emergencyContact: "",
        gpa: null,
        enrollmentDate: formData.enrollmentDate,
        courses: [],
        dateOfBirth: null,
        credits: 0,
        expectedGraduation: null,
        studentType: formData.studentType,
        interneeType:
          formData.studentType === "Internee"
            ? formData.interneeType || null
            : null,
        studyStatus:
          formData.studentType === "Internee"
            ? formData.studyStatus || null
            : null,
        paymentStatus:
          formData.studentType === "Internee" ? paymentStatusValue : null,
        totalFees: formData.studentType === "Internee" ? totalFeesValue : 0,
        paidAmount: formData.studentType === "Internee" ? paidAmountValue : 0,
        remainingAmount:
          formData.studentType === "Internee" ? remainingAmountValue : 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        attendance: 0,
        performance: null,
        cumulative_gpa: null,
        completed_credits: 0,
        grades: {},
        assignments: {},
        current_semester: "Spring 2024",
        academic_standing: null,
        achievements: [],
        projects: [],
        extracurricular: [],
        totalPoints: 0,
        totalProjects: 0,
        certifications: 0,
        overallAttendance: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        excusedAbsences: 0,
        currentStreak: 0,
        lastAttendance: null,
        monthlyData: {},
        feedback: [],
      };

      let savedData;
      if (modalType === "add") {
        savedData = await createStudent(baseStudentData);
        setEnrollments((prev) => [...prev, savedData.data]);
        toast.success("Enrollment created successfully!");
      } else {
        savedData = await updateStudent(selectedEnrollment.id, baseStudentData);
        setEnrollments((prev) =>
          prev.map((e) => (e.id === savedData.data.id ? savedData.data : e))
        );
        toast.success("Enrollment updated successfully!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("API Error Response:", err.response?.data || err.message);
      let errorMessage =
        "Failed to save enrollment. Please check the data and try again.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(", ");
        } else {
          // Field errors
          const fieldErrors = Object.values(err.response.data).flat();
          errorMessage = fieldErrors.join(", ");
        }
      }
      toast.error(errorMessage);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Enrollment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage student enrollment details and records
          </p>
        </div>
        <Button onClick={handleAddEnrollment}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search enrollments..."
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
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading enrollments...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {/* Enrollment Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments
            .filter(
              (enrollment) =>
                enrollment.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                enrollment.email
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                enrollment.program
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
            .map((enrollment) => (
              <Card
                key={enrollment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {enrollment.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        enrollment.status
                      )}`}
                    >
                      {enrollment.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Student ID:
                      </span>
                      <span className="text-sm font-medium">
                        {enrollment.idNumber}
                      </span>
                    </div>
                    {enrollment.address && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Address:
                        </span>
                        <span className="text-sm font-medium">
                          {enrollment.address}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="text-sm font-medium">
                        {enrollment.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Phone:
                      </span>
                      <span className="text-sm font-medium">
                        {enrollment.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Program:
                      </span>
                      <span className="text-sm font-medium">
                        {enrollment.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Student Type:
                      </span>
                      <span className="text-sm font-medium">
                        {enrollment.studentType}
                      </span>
                    </div>
                    {enrollment.studentType === "Internee" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Payment:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              enrollment.paymentStatus
                            )}`}
                          >
                            {enrollment.paymentStatus}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleViewEnrollment(enrollment)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditEnrollment(enrollment)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleDeleteEnrollment(enrollment.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "add"
            ? "New Enrollment"
            : modalType === "edit"
            ? "Edit Enrollment"
            : "Student Enrollment "
        }
        size="large"
      >
        {selectedEnrollment && modalType === "view" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedEnrollment.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedEnrollment.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedEnrollment.phone}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedEnrollment.idNumber}
                </p>
                {selectedEnrollment.address && (
                  <p className="text-sm text-gray-500">
                    Address: {selectedEnrollment.address}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Program Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Program:</span>
                      <span className="text-sm font-medium">
                        {selectedEnrollment.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Enrollment Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(
                          selectedEnrollment.enrollmentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Duration:</span>
                      <span className="text-sm font-medium">
                        {new Date(
                          selectedEnrollment.startDate
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          selectedEnrollment.endDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Enrollment Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedEnrollment.status
                        )}`}
                      >
                        {selectedEnrollment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Student Type:</span>
                      <span className="text-sm font-medium">
                        {selectedEnrollment.studentType}
                      </span>
                    </div>
                    {selectedEnrollment.studentType === "Internee" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Internee Type:</span>
                          <span className="text-sm font-medium">
                            {selectedEnrollment.interneeType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Study Status:</span>
                          <span className="text-sm font-medium">
                            {selectedEnrollment.studyStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Payment Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              selectedEnrollment.paymentStatus
                            )}`}
                          >
                            {selectedEnrollment.paymentStatus}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Financial Information
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Fees:</span>
                      <span className="text-sm font-medium">
                        ${selectedEnrollment.totalFees.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Paid Amount:</span>
                      <span className="text-sm font-medium">
                        ${selectedEnrollment.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Remaining:</span>
                      <span className="text-sm font-medium">
                        ${selectedEnrollment.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter student name"
                required
              />
              <Input
                label="Student ID"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Enter student ID"
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                required
              />
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
              <select
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Program</option>
                <option value="IoT Development">IoT Development</option>
                <option value="Software Development">
                  Software Development
                </option>
                <option value="Data Science">Data Science</option>
              </select>
              <select
                name="studentType"
                value={formData.studentType}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student Type</option>
                <option value="Internee">Internee</option>
                <option value="Trainee">Trainee</option>
              </select>

              <Input
                label="Enrollment Date"
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {formData.studentType === "Internee" && (
                <>
                  <select
                    name="interneeType"
                    value={formData.interneeType}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Internee Type</option>
                    <option value="University">University</option>
                    <option value="High School">High School</option>
                  </select>
                  <select
                    name="studyStatus"
                    value={formData.studyStatus}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Study Status</option>
                    <option value="Still Studying">Still Studying</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </>
              )}
              {formData.studentType === "Internee" && (
                <>
                  <Input
                    label="Total Fees"
                    type="number"
                    name="totalFees"
                    value={formData.totalFees}
                    onChange={handleInputChange}
                    placeholder="Enter total fees"
                    step="0.01"
                  />
                  <Input
                    label="Paid Amount"
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleInputChange}
                    placeholder="Enter paid amount"
                    step="0.01"
                  />
                  <Input
                    label="Remaining Amount"
                    type="number"
                    name="remainingAmount"
                    value={formData.remainingAmount}
                    onChange={handleInputChange}
                    placeholder="Enter remaining amount"
                    step="0.01"
                    readOnly
                  />
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {modalType === "add"
                  ? "Create Enrollment"
                  : "Update Enrollment"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StudentEnrollment;
