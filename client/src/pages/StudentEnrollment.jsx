import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  DocumentTextIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const StudentEnrollment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

  // Enhanced mock enrollment data
  const [enrollments] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "STU001",
      email: "john.doe@email.com",
      program: "IoT Development",
      enrollmentDate: "2024-01-15",
      status: "Active",
      studentType: "Internee",
      interneeType: "University",
      studyStatus: "Still Studying",
      paymentStatus: "Paid",
      totalFees: 15000,
      paidAmount: 15000,
      remainingAmount: 0,
      enrollmentType: "Full-time",
      startDate: "2024-01-15",
      endDate: "2025-06-15",
      documents: ["Application Form", "ID Proof", "Certificates"],
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "STU002",
      email: "jane.smith@email.com",
      program: "Software Development",
      enrollmentDate: "2024-01-10",
      status: "Active",
      studentType: "Internee",
      interneeType: "High School",
      studyStatus: "Graduated",
      paymentStatus: "Pending",
      totalFees: 15000,
      paidAmount: 10000,
      remainingAmount: 5000,
      enrollmentType: "Full-time",
      startDate: "2024-01-10",
      endDate: "2025-06-10",
      documents: ["Application Form", "ID Proof", "Transcripts"],
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      studentId: "STU003",
      email: "mike.johnson@email.com",
      program: "IoT Development",
      enrollmentDate: "2024-01-05",
      status: "Inactive",
      studentType: "Trainee",
      enrollmentType: "Part-time",
      startDate: "2024-01-05",
      endDate: "2025-12-05",
      documents: ["Application Form", "ID Proof"],
    },
  ]);

  const handleViewEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddEnrollment = () => {
    setSelectedEnrollment(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEditEnrollment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteEnrollment = (enrollmentId) => {
    toast.success("Enrollment deleted successfully!");
    console.log("Delete enrollment:", enrollmentId);
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
          <option value="data">Data Science</option>
        </select>

        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Enrollment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <Card
            key={enrollment.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {enrollment.studentName}
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
                    {enrollment.studentId}
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
                    Type:
                  </span>
                  <span className="text-sm font-medium">
                    {enrollment.enrollmentType}
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
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Remaining:
                      </span>
                      <span className="text-sm font-medium">
                        ${enrollment.remainingAmount.toLocaleString()}
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

      {/* Enrollment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "add"
            ? "New Enrollment"
            : modalType === "edit"
            ? "Edit Enrollment"
            : "Enrollment Details"
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
                  {selectedEnrollment.studentName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedEnrollment.email}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedEnrollment.studentId}
                </p>
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
                      <span className="text-sm">Enrollment Type:</span>
                      <span className="text-sm font-medium">
                        {selectedEnrollment.enrollmentType}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documents Submitted
                  </label>
                  <div className="mt-2 space-y-1">
                    {selectedEnrollment.documents.map((doc, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (modalType === "add") {
                toast.success("Enrollment created successfully!");
              } else {
                toast.success("Enrollment updated successfully!");
              }
              setShowModal(false);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input label="Student Name" placeholder="Enter student name" />
              <Input label="Student ID" placeholder="Enter student ID" />
              <Input label="Email" type="email" placeholder="Enter email" />
              <Input label="Program" placeholder="Select program" />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Student Type</option>
                <option value="Internee">Internee</option>
                <option value="Trainee">Trainee</option>
              </select>
              <Input
                label="Enrollment Type"
                placeholder="Full-time/Part-time"
              />
              <Input label="Enrollment Date" type="date" />
              <Input label="Start Date" type="date" />
              <Input label="End Date" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Internee Type</option>
                <option value="University">University</option>
                <option value="High School">High School</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Study Status</option>
                <option value="Still Studying">Still Studying</option>
                <option value="Graduated">Graduated</option>
              </select>
              <Input
                label="Total Fees"
                type="number"
                placeholder="Enter total fees"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Not Paid">Not Paid</option>
              </select>
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
