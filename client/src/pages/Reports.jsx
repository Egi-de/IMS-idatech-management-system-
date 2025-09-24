import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import Button from "../components/Button";
import FinancialChart from "../components/FinancialChart";

const employees = [
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
];

const students = [
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
];

const transactions = [
  {
    id: 1,
    type: "Income",
    category: "Student Fees",
    description: "IoT Program - January Batch",
    amount: 25000,
    date: "2024-01-15",
    status: "Completed",
    reference: "TXN-2024-001",
    method: "Bank Transfer",
  },
  {
    id: 2,
    type: "Expense",
    category: "Equipment",
    description: "Raspberry Pi 4 - 50 units",
    amount: -8500,
    date: "2024-01-14",
    status: "Completed",
    reference: "TXN-2024-002",
    method: "Credit Card",
  },
  {
    id: 3,
    type: "Income",
    category: "Workshop Revenue",
    description: "AI Workshop - 30 participants",
    amount: 15000,
    date: "2024-01-13",
    status: "Completed",
    reference: "TXN-2024-003",
    method: "Online Payment",
  },
  {
    id: 4,
    type: "Expense",
    category: "Salary",
    description: "Employee salaries - January",
    amount: -45000,
    date: "2024-01-12",
    status: "Completed",
    reference: "TXN-2024-004",
    method: "Bank Transfer",
  },
  {
    id: 5,
    type: "Expense",
    category: "Utilities",
    description: "Electricity & Internet - January",
    amount: -2500,
    date: "2024-01-11",
    status: "Pending",
    reference: "TXN-2024-005",
    method: "Direct Debit",
  },
];

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    totalExpenses: 0,
    iotStudents: 0,
    sodStudents: 0,
  });

  useEffect(() => {
    // Calculate totals from imported data
    const totalStudents = students.length;
    const iotStudents = students.filter(
      (s) => s.program === "IoT Development"
    ).length;
    const sodStudents = students.filter(
      (s) => s.program === "Software Development"
    ).length;
    const totalEmployees = employees.length;
    const totalExpenses =
      employees.reduce((sum, emp) => sum + emp.salary, 0) +
      transactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    setReportData({
      totalStudents,
      totalEmployees,
      totalExpenses,
      iotStudents,
      sodStudents,
    });
  }, []);

  const handleExportPDF = () => {
    // Simple PDF export using browser print
    window.print();
  };

  const handleExportExcel = () => {
    // Simple CSV export
    const csvData = [
      ["Category", "Value"],
      ["Total Students", reportData.totalStudents],
      ["IoT Students", reportData.iotStudents],
      ["SoD Students", reportData.sodStudents],
      ["Total Employees", reportData.totalEmployees],
      ["Total Expenses", reportData.totalExpenses],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Student Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Total Students: {reportData.totalStudents}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            IoT Students: {reportData.iotStudents}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            SoD Students: {reportData.sodStudents}
          </p>
          <Link to="/students">
            <Button className="mt-4">View Students</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Employee Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Total Employees: {reportData.totalEmployees}
          </p>
          <Link to="/employees">
            <Button className="mt-4">View Employees</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Financial Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Total Expenses: ${reportData.totalExpenses.toLocaleString()}
          </p>
          <Link to="/financial">
            <Button className="mt-4">View Financial</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Detailed Reports
          </h2>
          <ul className="space-y-2">
            <li>
              <Link to="/students" className="text-blue-500 hover:underline">
                Student Detail Reports
              </Link>
            </li>
            <li>
              <Link to="/employees" className="text-blue-500 hover:underline">
                Employee Detail Reports
              </Link>
            </li>
            <li>
              <Link to="/financial" className="text-blue-500 hover:underline">
                Financial Detail Reports
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Export Options
          </h2>
          <ul className="space-y-2">
            <li>
              <Button
                className="text-blue-500 hover:underline"
                onClick={handleExportPDF}
              >
                Export Financial Report (PDF)
              </Button>
            </li>
            <li>
              <Button
                className="text-blue-500 hover:underline"
                onClick={handleExportExcel}
              >
                Export Financial Report (Excel)
              </Button>
            </li>
          </ul>
        </Card>
      </div>

      {/* Removed Overview Chart as per user request */}
    </div>
  );
};

export default Reports;
