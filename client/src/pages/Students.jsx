import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import {
  AcademicCapIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { useTrashBin } from "../contexts/TrashBinContext";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";

const Students = () => {
  const { addToTrash } = useTrashBin();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    enrollmentDate: "",
    status: "Active",
    avatar: "",
    idNumber: "",
  });
  const [submitError, setSubmitError] = useState(null);

  const tabs = [
    { id: "profile", name: "Student Profile", icon: AcademicCapIcon },
    { id: "enrollment", name: "Enrollment Details", icon: DocumentTextIcon },
    { id: "activities", name: "Activities & Achievements", icon: StarIcon },
    {
      id: "feedback",
      name: "Feedback & Evaluation",
      icon: ClipboardDocumentCheckIcon,
    },
    { id: "status", name: "Status & Recommendations", icon: CheckCircleIcon },
  ];

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setModalType("add");
    setFormData({
      name: "",
      email: "",
      phone: "",
      program: "",
      enrollmentDate: "",
      status: "Active",
      avatar: "",
      idNumber: "",
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalType("edit");
    setFormData({
      ...student,
      enrollmentDate: student.enrollmentDate
        ? new Date(student.enrollmentDate).toISOString().split("T")[0]
        : "",
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId);
      setStudents(students.filter((student) => student.id !== studentId));
      const studentToDelete = students.find((stu) => stu.id === studentId);
      if (studentToDelete) {
        addToTrash({
          name: `Deleted Student: ${studentToDelete.name}`,
          details: `Program: ${studentToDelete.program}, Year: ${studentToDelete.year}`,
        });
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      if (modalType === "add") {
        const newStudent = await createStudent(formData);
        setStudents((prev) => [...prev, newStudent.data]);
        setShowModal(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          program: "",
          enrollmentDate: "",
          status: "Active",
          avatar: "",
          idNumber: "",
        });
      } else if (modalType === "edit") {
        const updatedStudent = await updateStudent(
          selectedStudent.id,
          formData
        );
        setStudents((prev) =>
          prev.map((student) =>
            student.id === selectedStudent.id ? updatedStudent.data : student
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to save student:", err);
      setSubmitError(err.response?.data?.detail || "Failed to save student");
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

  const renderStudentProfile = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading students...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
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
          <Button onClick={handleAddStudent}>
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Students Grid */}
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
                      src={student.avatar || "https://via.placeholder.com/48"}
                      alt={student.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Program:</span>
                      <span className="text-sm font-medium">
                        {student.program}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </div>
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
      </div>
    );
  };

  const renderEnrollmentDetails = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Enrollment Details</h2>
        <Button>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Student Name</th>
                  <th className="text-left py-3 px-4">Program</th>
                  <th className="text-left py-3 px-4">Enrollment Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.program}</td>
                    <td className="py-3 px-4">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="small">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Activities & Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <StarIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Total Achievements</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Certifications</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.program}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Best Project Award - IoT Smart Home System</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>Completed Python Certification</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Published Research Paper on AI</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Feedback & Evaluation</h2>

      <Card>
        <CardContent>
          <div className="space-y-6">
            {students.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.program}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Performance Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-5 w-5 ${
                            star <= 4 ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        4.0/5.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Comments
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter feedback comments..."
                      defaultValue="Excellent performance in IoT projects. Shows great initiative and problem-solving skills."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendations
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter recommendations..."
                      defaultValue="Consider advanced IoT specialization courses. Would benefit from leadership training."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Status & Recommendations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">28</div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.program}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      student.status
                    )}`}
                  >
                    {student.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Current Status
                    </h4>
                    <p className="text-sm">Active enrollment, good standing</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Recommendations
                    </h4>
                    <p className="text-sm">
                      Consider advanced IoT courses, leadership training
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return renderStudentProfile();
      case "enrollment":
        return renderEnrollmentDetails();
      case "activities":
        return renderActivities();
      case "feedback":
        return renderFeedback();
      case "status":
        return renderStatus();
      default:
        return renderStudentProfile();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>

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
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedStudent.name}
                </h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
                <p className="text-sm text-gray-500">{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program
                </label>
                <p className="mt-1">{selectedStudent.program}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Date
                </label>
                <p className="mt-1">
                  {new Date(
                    selectedStudent.enrollmentDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedStudent.status
                    )}`}
                  >
                    {selectedStudent.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attendance
                </label>
                <p className="mt-1">{selectedStudent.attendance}%</p>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <Input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter ID number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program *
                </label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select program</option>
                  <option value="IoT Development">IoT Development</option>
                  <option value="Software Development">
                    Software Development
                  </option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date *
                </label>
                <Input
                  name="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <Input
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="Enter avatar URL"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
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

export default Students;
