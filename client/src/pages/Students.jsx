import React, { useState } from "react";
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

const Students = () => {
  const [students] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@idatech.com",
      phone: "+1-234-567-8901",
      program: "IoT Development",
      year: "2023",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "123 Main Street, City, State 12345",
      emergencyContact: "John Johnson (+1-234-567-8902)",
      gpa: 3.8,
      enrollmentDate: "2023-01-15",
      courses: ["IoT Fundamentals", "Embedded Systems", "Wireless Networks"],
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@idatech.com",
      phone: "+1-234-567-8903",
      program: "Software Development",
      year: "2023",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "456 Oak Avenue, City, State 12345",
      emergencyContact: "Jane Smith (+1-234-567-8904)",
      gpa: 3.6,
      enrollmentDate: "2023-02-10",
      courses: ["Data Structures", "Algorithms", "Web Development"],
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie.brown@idatech.com",
      phone: "+1-234-567-8905",
      program: "IoT Development",
      year: "2022",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "789 Pine Road, City, State 12345",
      emergencyContact: "Lucy Brown (+1-234-567-8906)",
      gpa: 3.9,
      enrollmentDate: "2022-09-01",
      courses: ["IoT Security", "Cloud Computing", "Machine Learning"],
    },
    {
      id: 4,
      name: "Diana Prince",
      email: "diana.prince@idatech.com",
      phone: "+1-234-567-8907",
      program: "Software Development",
      year: "2022",
      status: "On Leave",
      avatar: "/api/placeholder/40/40",
      address: "321 Elm Street, City, State 12345",
      emergencyContact: "Steve Prince (+1-234-567-8908)",
      gpa: 3.7,
      enrollmentDate: "2022-08-15",
      courses: ["Mobile Development", "Database Design", "UI/UX Design"],
    },
  ]);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");

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
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteStudent = (studentId) => {
    const studentToDelete = students.find((stu) => stu.id === studentId);
    if (studentToDelete) {
      // addToTrash removed because it's undefined
      // Implement actual deletion logic here (e.g., API call)
      console.log("Delete student:", studentId);
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

  const renderStudentProfile = () => (
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
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={student.avatar}
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
                  <span className="text-sm font-medium">{student.program}</span>
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
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Enter full name" />
              <Input label="Email" type="email" placeholder="Enter email" />
              <Input label="Phone" placeholder="Enter phone number" />
              <Input label="Program" placeholder="Select program" />
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

export default Students;
