import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
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

const Employees = () => {
  const { addToTrash } = useTrashBin();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    address: "",
  });

  // Mock employee data
  const [employees] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@idatech.com",
      phone: "+1-234-567-8901",
      position: "Senior IoT Developer",
      department: "Engineering",
      salary: 85000,
      hireDate: "2023-03-15",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "123 Tech Street, Silicon Valley, CA 94025",
      emergencyContact: "John Johnson (+1-234-567-8902)",
      skills: ["Python", "IoT", "Machine Learning", "AWS"],
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@idatech.com",
      phone: "+1-234-567-8903",
      position: "HR Manager",
      department: "Human Resources",
      salary: 75000,
      hireDate: "2023-01-10",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "456 HR Avenue, San Francisco, CA 94102",
      emergencyContact: "Lisa Chen (+1-234-567-8904)",
      skills: ["HR Management", "Recruitment", "Employee Relations"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@idatech.com",
      phone: "+1-234-567-8905",
      position: "Financial Analyst",
      department: "Finance",
      salary: 70000,
      hireDate: "2023-05-20",
      status: "Active",
      avatar: "/api/placeholder/40/40",
      address: "789 Finance Blvd, New York, NY 10001",
      emergencyContact: "Carlos Rodriguez (+1-234-567-8906)",
      skills: ["Financial Analysis", "Excel", "SAP", "Budgeting"],
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@idatech.com",
      phone: "+1-234-567-8907",
      position: "Software Developer",
      department: "Engineering",
      salary: 65000,
      hireDate: "2023-08-01",
      status: "On Leave",
      avatar: "/api/placeholder/40/40",
      address: "321 Code Lane, Seattle, WA 98101",
      emergencyContact: "Susan Kim (+1-234-567-8908)",
      skills: ["JavaScript", "React", "Node.js", "Database Design"],
    },
  ]);

  const departments = [
    "All",
    "Engineering",
    "Human Resources",
    "Finance",
    "Marketing",
    "Operations",
  ];
  const statuses = ["All", "Active", "On Leave", "Terminated"];

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
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      salary: "",
      address: "",
    });
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalType("edit");
    setFormData({
      employeeId: employee.id.toString(),
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      address: employee.address,
    });
    setShowModal(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    const employeeToDelete = employees.find((emp) => emp.id === employeeId);
    if (employeeToDelete) {
      addToTrash({
        name: `Deleted Employee: ${employeeToDelete.name}`,
        details: `Position: ${employeeToDelete.position}, Department: ${employeeToDelete.department}`,
      });
      // Implement actual deletion logic here (e.g., API call)
      console.log("Delete employee:", employeeId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === "add") {
      // Add new employee
      const newEmployee = {
        id: parseInt(formData.employeeId),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        salary: parseInt(formData.salary),
        hireDate: new Date().toISOString().split("T")[0],
        status: "Active",
        avatar: "/api/placeholder/40/40",
        address: formData.address,
        emergencyContact: "",
        skills: [],
      };
      // In a real app, this would be an API call
      console.log("Adding employee:", newEmployee);
    } else if (modalType === "edit") {
      // Update existing employee
      const updatedEmployee = {
        ...selectedEmployee,
        id: parseInt(formData.employeeId),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        salary: parseInt(formData.salary),
        address: formData.address,
      };
      // In a real app, this would be an API call
      console.log("Updating employee:", updatedEmployee);
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      salary: "",
      address: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "On Leave":
        return "text-yellow-600 bg-yellow-100";
      case "Terminated":
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
      employee.department === filterDepartment;
    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "All" ||
      employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const departmentsCount = new Set(employees.map((emp) => emp.department)).size;

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
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
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
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Employee</th>
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
                      <span className="font-mono text-sm font-medium text-gray-900">
                        #{employee.id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{employee.position}</div>
                      <div className="text-sm text-gray-600">
                        Since {new Date(employee.hireDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {employee.department}
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
                        ${employee.salary.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          employee.status
                        )}`}
                      >
                        {employee.status}
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
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h3 className="text-2xl font-semibold">
                  {selectedEmployee.name}
                </h3>
                <p className="text-gray-600">{selectedEmployee.position}</p>
                <p className="text-sm text-gray-500">
                  {selectedEmployee.department}
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
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Salary:</span>
                    <span className="ml-2 font-medium">
                      ${selectedEmployee.salary.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedEmployee.status
                      )}`}
                    >
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Emergency Contact
              </h4>
              <p className="text-gray-600">
                {selectedEmployee.emergencyContact}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedEmployee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                placeholder="Enter employee ID"
              />
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
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
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select department</option>
                {departments
                  .filter((dept) => dept !== "All")
                  .map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
              </select>
              <Input
                label="Salary"
                name="salary"
                type="number"
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
