import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { API_BASE_URL } from "../services/api";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";

const StudentEnrollment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
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
    avatar: "",
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
    const { name, value, type, files } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === "file" ? files[0] : value,
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
      gender: "",
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
      avatar: "",
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
      avatar: enrollment.avatar || null,
    });
    setSelectedEnrollment(enrollment);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to delete this enrollment?")) {
      try {
        await deleteStudent(enrollmentId);
        setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        setSelectedEnrollments((prev) =>
          prev.filter((id) => id !== enrollmentId)
        );
        toast.success("Enrollment deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete enrollment.");
        console.error(err);
      }
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const filteredEnrollments = enrollments.filter(
        (enrollment) =>
          (enrollment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enrollment.email
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            enrollment.program
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            enrollment.idNumber.includes(searchQuery)) &&
          (programFilter === "" || enrollment.program === programFilter) &&
          (statusFilter === "" || enrollment.status === statusFilter)
      );
      setSelectedEnrollments(filteredEnrollments.map((e) => e.id));
    } else {
      setSelectedEnrollments([]);
    }
  };

  const handleSelectEnrollment = (enrollmentId, checked) => {
    if (checked) {
      setSelectedEnrollments((prev) => [...prev, enrollmentId]);
    } else {
      setSelectedEnrollments((prev) =>
        prev.filter((id) => id !== enrollmentId)
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEnrollments.length === 0) {
      toast.error("Please select enrollments to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedEnrollments.length} enrollment(s)?`
      )
    ) {
      try {
        // Delete enrollments one by one
        const deletePromises = selectedEnrollments.map((id) =>
          deleteStudent(id)
        );
        await Promise.all(deletePromises);

        setEnrollments((prev) =>
          prev.filter((e) => !selectedEnrollments.includes(e.id))
        );
        setSelectedEnrollments([]);
        toast.success(
          `${selectedEnrollments.length} enrollment(s) deleted successfully!`
        );
      } catch (err) {
        toast.error("Failed to delete some enrollments.");
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

      let dataToSend;
      if (modalType === "add") {
        dataToSend = {
          name: formData.name,
          idNumber: formData.idNumber,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          program: formData.program,
          studentType: formData.studentType || null,
          enrollmentDate: formData.enrollmentDate,
          startDate: formData.startDate,
          endDate: formData.endDate,
          ...(formData.avatar instanceof File
            ? { avatar: formData.avatar }
            : {}),
          ...(formData.studentType === "Internee"
            ? {
                interneeType: formData.interneeType || null,
                studyStatus: formData.studyStatus || null,
                totalFees: totalFeesValue,
                paidAmount: paidAmountValue,
                remainingAmount: remainingAmountValue,
                paymentStatus: paymentStatusValue,
              }
            : {}),
        };
      } else {
        // For edit, send only the fields that can be changed in the form
        dataToSend = {
          name: formData.name,
          idNumber: formData.idNumber,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          gender: formData.gender,
          program: formData.program,
          studentType: formData.studentType || null,
          enrollmentDate: formData.enrollmentDate,
          startDate: formData.startDate,
          endDate: formData.endDate,
          ...(formData.studentType === "Internee"
            ? {
                interneeType: formData.interneeType || null,
                studyStatus: formData.studyStatus || null,
                paymentStatus: paymentStatusValue,
                totalFees: totalFeesValue,
                paidAmount: paidAmountValue,
                remainingAmount: remainingAmountValue,
              }
            : {}),
          ...(formData.avatar instanceof File
            ? { avatar: formData.avatar }
            : {}),
        };
      }

      let savedData;
      if (modalType === "add") {
        savedData = await createStudent(dataToSend);
        setEnrollments((prev) => [...prev, savedData.data]);
        toast.success("Enrollment created successfully!");
      } else {
        savedData = await updateStudent(selectedEnrollment.id, dataToSend);
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

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Programs</option>
          <option value="IoT Development">IoT Development</option>
          <option value="Software Development">Software Development</option>
          <option value="Data Science">Data Science</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
          <option value="On Leave">On Leave</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="enrollmentDate">Sort by Enrollment Date</option>
          <option value="program">Sort by Program</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {selectedEnrollments.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            className="ml-4"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Selected ({selectedEnrollments.length})
          </Button>
        )}
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

      {/* Enrollment Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        enrollments.filter(
                          (enrollment) =>
                            (enrollment.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                              enrollment.email
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              enrollment.program
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              enrollment.idNumber.includes(searchQuery)) &&
                            (programFilter === "" ||
                              enrollment.program === programFilter) &&
                            (statusFilter === "" ||
                              enrollment.status === statusFilter)
                        ).length > 0 &&
                        selectedEnrollments.length ===
                          enrollments.filter(
                            (enrollment) =>
                              (enrollment.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                                enrollment.email
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                enrollment.program
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                enrollment.idNumber.includes(searchQuery)) &&
                              (programFilter === "" ||
                                enrollment.program === programFilter) &&
                              (statusFilter === "" ||
                                enrollment.status === statusFilter)
                          ).length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Fees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {enrollments
                  .filter(
                    (enrollment) =>
                      (enrollment.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                        enrollment.email
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        enrollment.program
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        enrollment.idNumber.includes(searchQuery)) &&
                      (programFilter === "" ||
                        enrollment.program === programFilter) &&
                      (statusFilter === "" ||
                        enrollment.status === statusFilter)
                  )
                  .sort((a, b) => {
                    let aValue, bValue;
                    switch (sortBy) {
                      case "name":
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                      case "enrollmentDate":
                        aValue = new Date(a.enrollmentDate);
                        bValue = new Date(b.enrollmentDate);
                        break;
                      case "program":
                        aValue = a.program.toLowerCase();
                        bValue = b.program.toLowerCase();
                        break;
                      default:
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                    }
                    if (sortOrder === "asc") {
                      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                    } else {
                      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                    }
                  })
                  .map((enrollment) => (
                    <tr
                      key={enrollment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedEnrollments.includes(enrollment.id)}
                          onChange={(e) =>
                            handleSelectEnrollment(
                              enrollment.id,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {enrollment.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  enrollment.avatar.startsWith("http")
                                    ? enrollment.avatar
                                    : `${API_BASE_URL}/${enrollment.avatar}`
                                }
                                alt={enrollment.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {enrollment.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              ID: {enrollment.idNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {enrollment.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {enrollment.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {enrollment.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {enrollment.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {enrollment.studentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            enrollment.status
                          )}`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(
                          enrollment.enrollmentDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(enrollment.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(enrollment.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {enrollment.studentType === "Internee"
                          ? `$${enrollment.totalFees?.toLocaleString() || 0}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {enrollment.studentType === "Internee"
                          ? `$${enrollment.paidAmount?.toLocaleString() || 0}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {enrollment.studentType === "Internee"
                          ? `$${
                              enrollment.remainingAmount?.toLocaleString() || 0
                            }`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enrollment.studentType === "Internee" ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              enrollment.paymentStatus
                            )}`}
                          >
                            {enrollment.paymentStatus}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
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
                            onClick={() =>
                              handleDeleteEnrollment(enrollment.id)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === "add" ? "New Enrollment" : "Edit Enrollment"}
        size="large"
      >
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
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors relative group overflow-hidden"
                    >
                      {formData.avatar && formData.avatar instanceof File ? (
                        <img
                          src={URL.createObjectURL(formData.avatar)}
                          alt="Preview"
                          className="w-16 h-16 object-cover"
                        />
                      ) : modalType === "edit" && selectedEnrollment?.avatar ? (
                        <img
                          src={
                            selectedEnrollment.avatar.startsWith("http")
                              ? selectedEnrollment.avatar
                              : `${API_BASE_URL}/${selectedEnrollment.avatar}`
                          }
                          alt="Current avatar"
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {formData.avatar
                        ? formData.avatar.name
                        : "Click to upload profile picture"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
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
