import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import {
  StarIcon,
  TrophyIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  PlusIcon,
  CalendarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  getStudentActivities,
  updateStudent,
  deleteStudent,
} from "../services/api";

const StudentActivities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAchievement, setNewAchievement] = useState({
    studentId: "",
    title: "",
    description: "",
    date: "",
    type: "award",
    category: "Project",
    points: 0,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editData, setEditData] = useState({
    totalPoints: 0,
    totalProjects: 0,
    certifications: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch activities data on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getStudentActivities();
        setActivitiesData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load student activities");
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditData({
      totalPoints: student.totalPoints,
      totalProjects: student.totalProjects,
      certifications: student.certifications,
    });
    setShowEditModal(true);
  };

  const handleAddAchievement = async () => {
    if (
      !newAchievement.studentId ||
      !newAchievement.title ||
      !newAchievement.description
    ) {
      setAddError("Please fill in all required fields.");
      return;
    }

    const selectedStudentId = parseInt(newAchievement.studentId);
    const selectedStudent = activitiesData.find(
      (s) => s.id === selectedStudentId
    );
    if (!selectedStudent) {
      setAddError("Selected student not found.");
      return;
    }

    const newId =
      Math.max(...selectedStudent.achievements.map((a) => a.id || 0), 0) + 1;
    const achievement = {
      id: newId,
      title: newAchievement.title,
      description: newAchievement.description,
      date: newAchievement.date,
      type: newAchievement.type,
      category: newAchievement.category,
      points: parseInt(newAchievement.points) || 0,
    };

    const updatedAchievements = [...selectedStudent.achievements, achievement];
    const updatedTotalPoints =
      selectedStudent.totalPoints + (parseInt(newAchievement.points) || 0);

    setAddLoading(true);
    setAddError(null);

    try {
      await updateStudent(selectedStudentId, {
        achievements: updatedAchievements,
        totalPoints: updatedTotalPoints,
      });

      // Refetch data
      const response = await getStudentActivities();
      setActivitiesData(response.data);

      // Reset form
      setNewAchievement({
        studentId: "",
        title: "",
        description: "",
        date: "",
        type: "award",
        category: "Project",
        points: 0,
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding achievement:", err);
      console.error("Error response:", err.response?.data || err.message);
      setAddError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to add achievement. Please try again."
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAchievement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!editingStudent) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await updateStudent(editingStudent.id, {
        totalPoints: parseInt(editData.totalPoints) || 0,
        totalProjects: parseInt(editData.totalProjects) || 0,
        certifications: parseInt(editData.certifications) || 0,
      });

      // Refetch data
      const response = await getStudentActivities();
      setActivitiesData(response.data);

      setShowEditModal(false);
      setEditingStudent(null);
    } catch (err) {
      console.error("Error updating student:", err);
      setEditError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update student. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteStudent(studentToDelete.id);

      // Refetch data
      const response = await getStudentActivities();
      setActivitiesData(response.data);

      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error("Error deleting student:", err);
      setDeleteError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to delete student. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "award":
        return TrophyIcon;
      case "certification":
        return StarIcon;
      case "publication":
        return DocumentTextIcon;
      case "academic":
        return StarIcon;
      case "workshop":
        return UserGroupIcon;
      default:
        return StarIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "award":
        return "text-yellow-600 bg-yellow-100";
      case "certification":
        return "text-blue-600 bg-blue-100";
      case "publication":
        return "text-green-600 bg-green-100";
      case "academic":
        return "text-purple-600 bg-purple-100";
      case "workshop":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activities & Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track student activities, projects, and achievements
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {activitiesData.reduce(
                  (acc, student) => acc + student.totalPoints,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">
                Total Achievement Points
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {activitiesData.reduce(
                  (acc, student) => acc + student.totalProjects,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {activitiesData.reduce(
                  (acc, student) => acc + student.certifications,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Certifications Earned</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {activitiesData.reduce(
                  (acc, student) => acc + student.achievements.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Achievements</div>
            </div>
          </CardContent>
        </Card>
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
          <option value="">All Categories</option>
          <option value="award">Awards</option>
          <option value="certification">Certifications</option>
          <option value="publication">Publications</option>
          <option value="academic">Academic</option>
          <option value="workshop">Workshops</option>
        </select>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Activities & Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const studentsWithAchievements = activitiesData.filter(
                (student) =>
                  student.achievements && student.achievements.length > 0
              );
              if (studentsWithAchievements.length === 0) {
                return (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No achievements yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Get started by adding a student's first achievement.
                    </p>
                    <Button onClick={() => setShowAddModal(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add First Achievement
                    </Button>
                  </div>
                );
              }
              return studentsWithAchievements.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.studentId} • {student.program}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.achievements.length} achievements •{" "}
                        {student.totalProjects} projects
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {student.totalPoints}
                      </div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {student.totalProjects}
                      </div>
                      <div className="text-xs text-gray-600">Projects</div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {student.certifications}
                      </div>
                      <div className="text-xs text-gray-600">Certs</div>
                    </div>

                    <div className="flex space-x-2">
                      {student.achievements.slice(0, 3).map((achievement) => {
                        const IconComponent = getActivityIcon(achievement.type);
                        return (
                          <div
                            key={achievement.id}
                            className={`p-2 rounded-full ${getActivityColor(
                              achievement.type
                            )}`}
                            title={achievement.title}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                        );
                      })}
                      {student.achievements.length > 3 && (
                        <div className="p-2 rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                          +{student.achievements.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEdit(student)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleViewDetails(student)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Activities Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Activities & Achievements Details"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Achievements & Awards
                  </label>
                  <div className="mt-2 space-y-3">
                    {selectedStudent.achievements.map((achievement) => {
                      const IconComponent = getActivityIcon(achievement.type);
                      return (
                        <div
                          key={achievement.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div
                            className={`p-2 rounded-full ${getActivityColor(
                              achievement.type
                            )}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {achievement.description}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  achievement.date
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-xs font-medium text-blue-600">
                                {achievement.points} points
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Extracurricular Activities
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedStudent.extracurricular.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <h4 className="text-sm font-medium">
                          {activity.activity}
                        </h4>
                        <p className="text-xs text-gray-600">{activity.role}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {activity.period}
                          </span>
                          <span className="text-xs font-medium">
                            {activity.hours} hours
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Projects Completed
                  </label>
                  <div className="mt-2 space-y-3">
                    {selectedStudent.projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <h4 className="text-sm font-medium">{project.name}</h4>
                        <p className="text-xs text-gray-600">
                          {project.description}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === "Completed"
                                  ? "text-green-600 bg-green-100"
                                  : "text-yellow-600 bg-yellow-100"
                              }`}
                            >
                              {project.status}
                            </span>
                            {project.grade !== "N/A" && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                                Grade: {project.grade}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Summary Statistics
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedStudent.totalPoints}
                      </div>
                      <div className="text-sm text-yellow-600">
                        Total Points
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStudent.totalProjects}
                      </div>
                      <div className="text-sm text-blue-600">Projects</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedStudent.certifications}
                      </div>
                      <div className="text-sm text-green-600">
                        Certifications
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedStudent.achievements.length}
                      </div>
                      <div className="text-sm text-purple-600">
                        Achievements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Achievement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError(null);
        }}
        title="Add New Achievement"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Student
            </label>
            <Select
              value={newAchievement.studentId}
              onChange={(e) =>
                setNewAchievement((prev) => ({
                  ...prev,
                  studentId: e.target.value,
                }))
              }
              placeholder="Choose a student"
              options={activitiesData.map((student) => ({
                value: student.id,
                label: `${student.studentName} - ${student.program}`,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Achievement Title
            </label>
            <Input
              name="title"
              value={newAchievement.title}
              onChange={handleInputChange}
              placeholder="Enter achievement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={newAchievement.description}
              onChange={handleInputChange}
              placeholder="Enter achievement description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <Input
                name="date"
                type="date"
                value={newAchievement.date}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points
              </label>
              <Input
                name="points"
                type="number"
                value={newAchievement.points}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={newAchievement.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="award">Award</option>
                <option value="certification">Certification</option>
                <option value="publication">Publication</option>
                <option value="academic">Academic</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={newAchievement.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Project">Project</option>
                <option value="Technical">Technical</option>
                <option value="Research">Research</option>
                <option value="Academic">Academic</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{addError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setAddError(null);
              }}
              disabled={addLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAchievement}
              disabled={
                addLoading ||
                !newAchievement.studentId ||
                !newAchievement.title ||
                !newAchievement.description
              }
            >
              {addLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Achievement"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditError(null);
          setEditingStudent(null);
        }}
        title="Edit Student Statistics"
        size="medium"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Points
            </label>
            <Input
              name="totalPoints"
              type="number"
              value={editData.totalPoints}
              onChange={handleEditInputChange}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Projects
            </label>
            <Input
              name="totalProjects"
              type="number"
              value={editData.totalProjects}
              onChange={handleEditInputChange}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Certifications
            </label>
            <Input
              name="certifications"
              type="number"
              value={editData.certifications}
              onChange={handleEditInputChange}
              placeholder="0"
            />
          </div>

          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{editError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditError(null);
                setEditingStudent(null);
              }}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError(null);
          setStudentToDelete(null);
        }}
        title="Confirm Delete"
        size="small"
      >
        <div className="space-y-4">
          <div className="text-center">
            <TrashIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Delete Student?
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {studentToDelete?.studentName}
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{deleteError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteError(null);
                setStudentToDelete(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentActivities;
