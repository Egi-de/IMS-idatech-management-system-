import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { API_BASE_URL } from "../services/api";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { updateStudent, getStudents } from "../services/api";

const StudentActivities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    date: "",
    type: "award",
    category: "Project",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({
    studentId: "",
    title: "",
    description: "",
    date: "",
    type: "award",
    category: "Project",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  // Fetch activities data on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getStudents();
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

  const handleDeleteAchievement = (achievement, studentId) => {
    // Handle delete achievement
    const updatedAchievements = activitiesData
      .find((s) => s.id === studentId)
      .achievements.filter((a) => a.id !== achievement.id);

    updateStudent(studentId, { achievements: updatedAchievements })
      .then(() => {
        // Refetch data
        getStudents().then((response) => {
          setActivitiesData(response.data);
        });
      })
      .catch((err) => {
        console.error("Error deleting achievement:", err);
      });
  };

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setEditData({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      type: achievement.type,
      category: achievement.category,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      const student = activitiesData.find(
        (s) => s.id === editingAchievement.studentId
      );
      const updatedAchievements = student.achievements.map((a) =>
        a.id === editingAchievement.id ? { ...a, ...editData } : a
      );

      await updateStudent(editingAchievement.studentId, {
        achievements: updatedAchievements,
      });

      // Refetch data
      const response = await getStudents();
      setActivitiesData(response.data);

      setShowEditModal(false);
      setEditingAchievement(null);
    } catch (err) {
      console.error("Error editing achievement:", err);
      setEditError("Failed to update achievement. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const student = activitiesData.find(
        (s) => s.id === parseInt(addData.studentId)
      );
      const newAchievement = {
        id: Date.now(),
        title: addData.title,
        description: addData.description,
        date: addData.date,
        type: addData.type,
        category: addData.category,
      };
      const updatedAchievements = [
        ...(student.achievements || []),
        newAchievement,
      ];

      await updateStudent(addData.studentId, {
        achievements: updatedAchievements,
      });

      // Refetch data
      const response = await getStudents();
      setActivitiesData(response.data);

      setShowAddModal(false);
      setAddData({
        studentId: "",
        title: "",
        description: "",
        date: "",
        type: "award",
        category: "Project",
      });
    } catch (err) {
      console.error("Error adding achievement:", err);
      setAddError("Failed to add achievement. Please try again.");
    } finally {
      setAddLoading(false);
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

      {/* Achievements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                  Achievement Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(() => {
                const allAchievements = [];
                activitiesData.forEach((student) => {
                  if (student.achievements && student.achievements.length > 0) {
                    student.achievements.forEach((achievement) => {
                      allAchievements.push({
                        ...achievement,
                        studentId: student.id,
                        studentName: student.name,
                        program: student.program,
                        avatar: student.avatar,
                        idNumber: student.idNumber,
                      });
                    });
                  }
                });

                if (allAchievements.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
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
                      </td>
                    </tr>
                  );
                }

                return allAchievements.map((achievement) => (
                  <tr key={achievement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              achievement.avatar.startsWith("http")
                                ? achievement.avatar
                                : `${API_BASE_URL}/${achievement.avatar}`
                            }
                            alt={achievement.studentName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {achievement.studentName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {achievement.idNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {achievement.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {achievement.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate hover:max-w-none hover:whitespace-normal hover:bg-gray-100 dark:hover:bg-gray-700 hover:p-2 hover:rounded hover:z-10 hover:relative hover:shadow-lg">
                        {achievement.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEditAchievement(achievement)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() =>
                            handleDeleteAchievement(
                              achievement,
                              achievement.studentId
                            )
                          }
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Achievement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditError(null);
          setEditingAchievement(null);
        }}
        title="Edit Achievement"
        size="medium"
      >
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <Input
            label="Achievement Title"
            name="title"
            value={editData.title}
            onChange={handleEditInputChange}
            placeholder="e.g. Best Student Award"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditInputChange}
              placeholder="Enter achievement description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <Input
            label="Date"
            type="date"
            name="date"
            value={editData.date}
            onChange={handleEditInputChange}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={editData.type}
                onChange={handleEditInputChange}
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
                value={editData.category}
                onChange={handleEditInputChange}
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
                setEditingAchievement(null);
              }}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editLoading}>
              {editLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Achievement"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError(null);
          setAddData({
            studentId: "",
            title: "",
            description: "",
            date: "",
            type: "award",
            category: "Project",
          });
        }}
        title="Add Achievement"
        size="medium"
      >
        <form className="space-y-4" onSubmit={handleAddSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Student
            </label>
            <select
              name="studentId"
              value={addData.studentId}
              onChange={handleAddInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a student</option>
              {activitiesData.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Achievement Title"
            name="title"
            value={addData.title}
            onChange={handleAddInputChange}
            placeholder="e.g. Best Student Award"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={addData.description}
              onChange={handleAddInputChange}
              placeholder="Enter achievement description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <Input
            label="Date"
            type="date"
            name="date"
            value={addData.date}
            onChange={handleAddInputChange}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={addData.type}
                onChange={handleAddInputChange}
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
                value={addData.category}
                onChange={handleAddInputChange}
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
                setAddData({
                  studentId: "",
                  title: "",
                  description: "",
                  date: "",
                  type: "award",
                  category: "Project",
                });
              }}
              disabled={addLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addLoading}>
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
        </form>
      </Modal>
    </div>
  );
};

export default StudentActivities;
