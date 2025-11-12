import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import { API_BASE_URL } from "../services/api";

import {
  UsersIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

import { useTrashBin } from "../contexts/TrashBinContext";

const API_BASE = "http://127.0.0.1:8000/api";

const Employees = () => {
  const { addToTrash } = useTrashBin();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    idNumber: "",
    name: "",
    email: "",
    phone: undefined,
    position: "",
    department_id: "",
    salary: "",
    address: "",
    status: "active",
    avatar: null,
  });

  const statuses = [
    { value: "active", label: "Active" },
    { value: "on_leave", label: "On Leave" },
    { value: "resigned", label: "Resigned" },
    { value: "terminated", label: "Terminated" },
  ];

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE}/departments/`);
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees/`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setModalType("add");
    setFormData({
      employeeId: "",
      idNumber: "",
      name: "",
      email: "",
      phone: undefined,
      position: "",
      department_id: "",
      salary: "",
      address: "",
      status: "active",
      avatar: null,
    });
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalType("edit");
    setFormData({
      employeeId: employee.employeeId,
      idNumber: employee.idNumber || "",
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department_id: employee.department.id.toString(),
      salary: employee.salary.toString(),
      address: employee.address,
      status: employee.status,
      avatar: null,
    });
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE}/employees/${employeeId}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete employee");

      await addToTrash({
        type: "employee",
        id: employeeId,
        name: employee.name,
        position: employee.position,
        department: employee.department.name,
        email: employee.email,
        canRestore: true,
      });

      fetchEmployees(); // Refetch after delete
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Client-side validation (optional fields)
    if (formData.name.trim() && !formData.email.trim()) {
      setError("Email is required if name is provided");
      return;
    }
    if (formData.email.trim() && !formData.name.trim()) {
      setError("Name is required if email is provided");
      return;
    }
    if (formData.position.trim() && !formData.department_id) {
      setError("Department is required if position is provided");
      return;
    }
    if (
      formData.salary &&
      (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) <= 0)
    ) {
      setError("Valid salary is required if provided");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("position", formData.position);
    formDataToSend.append("department_id", formData.department_id);
    formDataToSend.append("salary", formData.salary);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("idNumber", formData.idNumber);
    if (formData.avatar) {
      formDataToSend.append("avatar", formData.avatar);
    }

    try {
      let response;
      if (modalType === "add") {
        response = await fetch(`${API_BASE}/employees/`, {
          method: "POST",
          body: formDataToSend,
        });
      } else if (modalType === "edit") {
        response = await fetch(
          `${API_BASE}/employees/${selectedEmployee.id}/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
      }
      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(`Failed to save: ${JSON.stringify(errorData)}`);
        } catch {
          setError("Failed to save employee");
        }
        return;
      }
      fetchEmployees(); // Refetch after add/edit
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      employeeId: "",
      idNumber: "",
      name: "",
      email: "",
      phone: undefined,
      position: "",
      department_id: "",
      salary: "",
      address: "",
      status: "active",
      avatar: null,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "on_leave":
        return "text-yellow-600 bg-yellow-100";
      case "resigned":
        return "text-blue-600 bg-blue-100";
      case "terminated":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      filterDepartment === "" ||
      filterDepartment === "All" ||
      employee.department.name === filterDepartment;
    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "All" ||
      employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalSalary = employees.reduce(
    (sum, emp) => sum + parseFloat(emp.salary),
    0
  );
  const departmentsCount = new Set(employees.map((emp) => emp.department.name))
    .size;

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Employee Management
        </h1>
        <Button onClick={handleAddEmployee}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Employees
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {employees.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Salary
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ${totalSalary.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Departments
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {departmentsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.display_name || dept.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterDepartment("");
                setFilterStatus("");
              }}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Employee</th>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">Salary</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            employee.avatar
                              ? API_BASE_URL + "/media/" + employee.avatar
                              : "/api/placeholder/40/40"
                          }
                          alt={employee.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.name}{" "}
                            {employee.idNumber && `(${employee.idNumber})`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {employee.idNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{employee.position}</div>
                      <div className="text-sm text-gray-600">
                        Since{" "}
                        {new Date(employee.date_joined).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {employee.department.display_name ||
                          employee.department.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className="text-sm text-gray-600 max-w-xs truncate"
                        title={employee.address}
                      >
                        {employee.address}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">
                        ${parseFloat(employee.salary).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          employee.status
                        )}`}
                      >
                        {statuses.find((s) => s.value === employee.status)
                          ?.label || employee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleViewEmployee(employee)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleDeleteEmployee(employee.id)}
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
        </CardContent>
      </Card>

      {/* Employee Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "add"
            ? "Add New Employee"
            : modalType === "edit"
            ? "Edit Employee"
            : "Employee Details"
        }
        size="large"
      >
        {selectedEmployee && modalType === "view" && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="flex items-center space-x-4">
              <img
                src={
                  selectedEmployee.avatar
                    ? API_BASE_URL + "/media/" + selectedEmployee.avatar
                    : "/api/placeholder/40/40"
                }
                alt={selectedEmployee.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h3 className="text-2xl font-semibold">
                  {selectedEmployee.name}
                </h3>
                <p className="text-gray-600">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500">
                  {selectedEmployee.department.display_name ||
                    selectedEmployee.department.name}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{selectedEmployee.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Employment Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">ID Number:</span>
                    <span className="ml-2 font-medium">
                      {selectedEmployee.idNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(
                        selectedEmployee.date_joined
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Salary:</span>
                    <span className="ml-2 font-medium">
                      ${parseFloat(selectedEmployee.salary).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedEmployee.status
                      )}`}
                    >
                      {statuses.find((s) => s.value === selectedEmployee.status)
                        ?.label || selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
              <Input
                label="ID Number"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="Enter ID number"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
              <Input
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Enter position"
              />
              <Select
                label="Department"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                options={departments.map((dept) => ({
                  value: dept.id.toString(),
                  label: dept.display_name || dept.name,
                }))}
                placeholder="Select Department"
              />
              <Input
                label="Salary"
                name="salary"
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="Enter salary"
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statuses}
                placeholder="Select Status"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Avatar
                </label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {modalType === "add" ? "Add Employee" : "Update Employee"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
