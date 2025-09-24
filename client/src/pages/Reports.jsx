import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import FinancialChart from "../components/FinancialChart";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

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
  // Initial overview cards data (before generating any report)
  const totalStudents = students.length;
  const totalEmployees = employees.length;
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const [formData, setFormData] = useState({
    reportType: "students",
    fromDate: "",
    toDate: "",
    exportFormat: "csv",
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "",
    message: "",
  });
  const [toast, setToast] = useState(null);

  const isDateInRange = (dateStr, from, to) => {
    if (!from || !to) return false;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const fromD = new Date(from);
    const toD = new Date(to);
    return date >= fromD && date <= toD;
  };

  const generateReport = async () => {
    setIsLoading(true);
    // Simulate processing time for large reports
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { reportType, fromDate, toDate } = formData;
    let data = [];
    let dateField = "";
    if (reportType === "students") {
      data = students;
      dateField = "enrollmentDate";
    } else if (reportType === "employees") {
      data = employees;
      dateField = "hireDate";
    } else if (reportType === "financial") {
      data = transactions;
      dateField = "date";
    }

    // Group by month
    const monthlyData = {};
    data.forEach((item) => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
      monthlyData[monthKey].push(item);
    });

    const report = Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        items: monthlyData[month],
        count: monthlyData[month].length,
      }));

    setGeneratedReport({ type: reportType, data: report, fromDate, toDate });
    setIsLoading(false);
  };

  const applyQuickFilter = (filterType) => {
    const today = new Date();
    let fromDate = "";
    let toDate = today.toISOString().split("T")[0]; // Today's date

    switch (filterType) {
      case "thisMonth": {
        const firstDayThisMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        fromDate = firstDayThisMonth.toISOString().split("T")[0];
        break;
      }
      case "last7Days": {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        fromDate = sevenDaysAgo.toISOString().split("T")[0];
        break;
      }
      case "last30Days": {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        fromDate = thirtyDaysAgo.toISOString().split("T")[0];
        break;
      }
      case "thisYear": {
        const firstDayThisYear = new Date(today.getFullYear(), 0, 1);
        fromDate = firstDayThisYear.toISOString().split("T")[0];
        break;
      }
      default:
        break;
    }

    setFormData({ ...formData, fromDate, toDate });
  };

  const sendEmail = () => {
    if (!generatedReport) return;

    // Simulate email sending
    setToast({
      message: `Report emailed successfully to ${emailData.recipient}`,
      type: "success",
    });

    setShowEmailModal(false);
    setEmailData({ recipient: "", subject: "", message: "" });
  };

  const exportReport = () => {
    if (!generatedReport) return;
    const { type, data, fromDate, toDate } = generatedReport;
    let csvData = [];
    if (type === "students") {
      csvData = [
        [
          "Month",
          "Enrollments",
          "Name",
          "Program",
          "Status",
          "Enrollment Date",
          "GPA",
        ],
      ];
      data.forEach((monthData) => {
        monthData.items.forEach((student) => {
          csvData.push([
            monthData.month,
            monthData.count,
            student.name,
            student.program,
            student.status,
            student.enrollmentDate,
            student.gpa,
          ]);
        });
      });
    } else if (type === "employees") {
      csvData = [
        [
          "Month",
          "Hires",
          "Name",
          "Position",
          "Department",
          "Salary",
          "Hire Date",
          "Status",
        ],
      ];
      data.forEach((monthData) => {
        monthData.items.forEach((employee) => {
          csvData.push([
            monthData.month,
            monthData.count,
            employee.name,
            employee.position,
            employee.department,
            employee.salary,
            employee.hireDate,
            employee.status,
          ]);
        });
      });
    } else if (type === "financial") {
      csvData = [
        [
          "Month",
          "Transactions",
          "Type",
          "Category",
          "Description",
          "Amount",
          "Date",
          "Status",
        ],
      ];
      data.forEach((monthData) => {
        monthData.items.forEach((transaction) => {
          csvData.push([
            monthData.month,
            monthData.count,
            transaction.type,
            transaction.category,
            transaction.description,
            transaction.amount,
            transaction.date,
            transaction.status,
          ]);
        });
      });
    }

    if (formData.exportFormat === "csv") {
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (formData.exportFormat === "excel") {
      const ws = XLSX.utils.aoa_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${type}_report.xlsx`);
    } else if (formData.exportFormat === "pdf") {
      const doc = new jsPDF();
      doc.text(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        10,
        10
      );
      doc.text(`From: ${fromDate} To: ${toDate}`, 10, 20);
      let y = 30;
      data.forEach((monthData) => {
        doc.text(
          `Month: ${monthData.month} - Count: ${monthData.count}`,
          10,
          y
        );
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });
      doc.save(`${type}_report.pdf`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Reports
      </h1>

      {!generatedReport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Students
            </h3>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {totalStudents}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Employees
            </h3>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {totalEmployees}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Financial
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Income: ${totalIncome.toLocaleString()}
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              Expense: ${totalExpenses.toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Generate Custom Report
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Select
            label="Report Type"
            value={formData.reportType}
            onChange={(e) =>
              setFormData({ ...formData, reportType: e.target.value })
            }
            options={[
              { value: "students", label: "Students" },
              { value: "employees", label: "Employees" },
              { value: "financial", label: "Financial" },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <Input
              type="date"
              value={formData.fromDate}
              onChange={(e) =>
                setFormData({ ...formData, fromDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <Input
              type="date"
              value={formData.toDate}
              onChange={(e) =>
                setFormData({ ...formData, toDate: e.target.value })
              }
            />
          </div>
          <Select
            label="Export Format"
            value={formData.exportFormat}
            onChange={(e) =>
              setFormData({ ...formData, exportFormat: e.target.value })
            }
            options={[
              { value: "csv", label: "CSV" },
              { value: "excel", label: "Excel" },
              { value: "pdf", label: "PDF" },
            ]}
          />
        </div>
        <div className="flex flex-col  gap-4">
          <div className="flex  gap-4">
            <Button onClick={generateReport} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
            {generatedReport && (
              <>
                <Button onClick={exportReport}>
                  Export as {formData.exportFormat.toUpperCase()}
                </Button>
                <Button
                  onClick={() => setShowEmailModal(true)}
                  variant="secondary"
                >
                  Email Report
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-4  items-center flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              Quick Filters:
            </span>
            <Button
              onClick={() => applyQuickFilter("thisMonth")}
              variant="outline"
              size="sm"
              className="transition-colors duration-300 p-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
            >
              This Month
            </Button>
            <Button
              onClick={() => applyQuickFilter("last7Days")}
              variant="outline"
              size="sm"
              className="transition-colors duration-300 p-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => applyQuickFilter("last30Days")}
              variant="outline"
              size="sm"
              className="transition-colors duration-300 p-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
            >
              Last 30 Days
            </Button>
            <Button
              onClick={() => applyQuickFilter("thisYear")}
              variant="outline"
              size="sm"
              className="transition-colors duration-300 p-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500"
            >
              This Year
            </Button>
          </div>
        </div>
      </Card>

      {generatedReport && (
        <>
          {/* Summary Cards for Generated Report */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {generatedReport.type === "students" && (
              <>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Total Enrollments
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter((item) =>
                          isDateInRange(
                            item.enrollmentDate,
                            generatedReport.fromDate,
                            generatedReport.toDate
                          )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Active Students
                  </h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter(
                          (s) =>
                            s.status === "Active" &&
                            isDateInRange(
                              s.enrollmentDate,
                              generatedReport.fromDate,
                              generatedReport.toDate
                            )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Average GPA
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {(
                      generatedReport.data.reduce(
                        (sum, month) =>
                          sum +
                          month.items.reduce(
                            (gpaSum, s) =>
                              isDateInRange(
                                s.enrollmentDate,
                                generatedReport.fromDate,
                                generatedReport.toDate
                              )
                                ? gpaSum + s.gpa
                                : gpaSum,
                            0
                          ),
                        0
                      ) /
                      generatedReport.data.reduce(
                        (sum, month) =>
                          sum +
                          month.items.filter((item) =>
                            isDateInRange(
                              item.enrollmentDate,
                              generatedReport.fromDate,
                              generatedReport.toDate
                            )
                          ).length,
                        0
                      )
                    ).toFixed(2)}
                  </p>
                </Card>
              </>
            )}
            {generatedReport.type === "employees" && (
              <>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Total Hires
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter((item) =>
                          isDateInRange(
                            item.hireDate,
                            generatedReport.fromDate,
                            generatedReport.toDate
                          )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Active Employees
                  </h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter(
                          (e) =>
                            e.status === "Active" &&
                            isDateInRange(
                              e.hireDate,
                              generatedReport.fromDate,
                              generatedReport.toDate
                            )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Average Salary
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    $
                    {Math.round(
                      generatedReport.data.reduce(
                        (sum, month) =>
                          sum +
                          month.items.reduce(
                            (salarySum, e) =>
                              isDateInRange(
                                e.hireDate,
                                generatedReport.fromDate,
                                generatedReport.toDate
                              )
                                ? salarySum + e.salary
                                : salarySum,
                            0
                          ),
                        0
                      ) /
                        generatedReport.data.reduce(
                          (sum, month) =>
                            sum +
                            month.items.filter((item) =>
                              isDateInRange(
                                item.hireDate,
                                generatedReport.fromDate,
                                generatedReport.toDate
                              )
                            ).length,
                          0
                        )
                    ).toLocaleString()}
                  </p>
                </Card>
              </>
            )}
            {generatedReport.type === "financial" && (
              <>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Total Transactions
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter((item) =>
                          isDateInRange(
                            item.date,
                            generatedReport.fromDate,
                            generatedReport.toDate
                          )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Net Income
                  </h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    $
                    {generatedReport.data
                      .reduce(
                        (sum, month) =>
                          sum +
                          month.items.reduce(
                            (net, t) =>
                              isDateInRange(
                                t.date,
                                generatedReport.fromDate,
                                generatedReport.toDate
                              )
                                ? net + t.amount
                                : net,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Completed Transactions
                  </h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {generatedReport.data.reduce(
                      (sum, month) =>
                        sum +
                        month.items.filter(
                          (t) =>
                            t.status === "Completed" &&
                            isDateInRange(
                              t.date,
                              generatedReport.fromDate,
                              generatedReport.toDate
                            )
                        ).length,
                      0
                    )}
                  </p>
                </Card>
              </>
            )}
          </div>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generated{" "}
              {generatedReport.type.charAt(0).toUpperCase() +
                generatedReport.type.slice(1)}{" "}
              Report
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              From: {generatedReport.fromDate} To: {generatedReport.toDate}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Month</th>
                    <th className="px-4 py-2 border">Count</th>
                    {generatedReport.type === "students" && (
                      <>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Program</th>
                        <th className="px-4 py-2 border">Status</th>
                        <th className="px-4 py-2 border">Enrollment Date</th>
                        <th className="px-4 py-2 border">GPA</th>
                      </>
                    )}
                    {generatedReport.type === "employees" && (
                      <>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Position</th>
                        <th className="px-4 py-2 border">Department</th>
                        <th className="px-4 py-2 border">Salary</th>
                        <th className="px-4 py-2 border">Hire Date</th>
                        <th className="px-4 py-2 border">Status</th>
                      </>
                    )}
                    {generatedReport.type === "financial" && (
                      <>
                        <th className="px-4 py-2 border">Type</th>
                        <th className="px-4 py-2 border">Category</th>
                        <th className="px-4 py-2 border">Description</th>
                        <th className="px-4 py-2 border">Amount</th>
                        <th className="px-4 py-2 border">Date</th>
                        <th className="px-4 py-2 border">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.data.map((monthData, index) => (
                    <React.Fragment key={index}>
                      {monthData.items.map((item, idx) => {
                        const isHighlighted = isDateInRange(
                          generatedReport.type === "students"
                            ? item.enrollmentDate
                            : generatedReport.type === "employees"
                            ? item.hireDate
                            : item.date,
                          generatedReport.fromDate,
                          generatedReport.toDate
                        );
                        return (
                          <tr
                            key={idx}
                            className={
                              isHighlighted
                                ? "bg-yellow-200 dark:bg-yellow-800"
                                : idx % 2 === 0
                                ? "bg-gray-50 dark:bg-gray-700"
                                : "bg-white dark:bg-gray-800"
                            }
                          >
                            {idx === 0 && (
                              <td
                                className="px-4 py-2 border"
                                rowSpan={monthData.items.length}
                              >
                                {monthData.month}
                              </td>
                            )}
                            {idx === 0 && (
                              <td
                                className="px-4 py-2 border"
                                rowSpan={monthData.items.length}
                              >
                                {monthData.items.filter((item) =>
                                  isDateInRange(
                                    generatedReport.type === "students"
                                      ? item.enrollmentDate
                                      : generatedReport.type === "employees"
                                      ? item.hireDate
                                      : item.date,
                                    generatedReport.fromDate,
                                    generatedReport.toDate
                                  )
                                ).length || monthData.items.length}
                              </td>
                            )}
                            {generatedReport.type === "students" && (
                              <>
                                <td className="px-4 py-2 border">
                                  {item.name}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.program}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.status}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.enrollmentDate}
                                </td>
                                <td className="px-4 py-2 border">{item.gpa}</td>
                              </>
                            )}
                            {generatedReport.type === "employees" && (
                              <>
                                <td className="px-4 py-2 border">
                                  {item.name}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.position}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.department}
                                </td>
                                <td className="px-4 py-2 border">
                                  ${item.salary}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.hireDate}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.status}
                                </td>
                              </>
                            )}
                            {generatedReport.type === "financial" && (
                              <>
                                <td className="px-4 py-2 border">
                                  {item.type}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.category}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.description}
                                </td>
                                <td className="px-4 py-2 border">
                                  ${item.amount}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.date}
                                </td>
                                <td className="px-4 py-2 border">
                                  {item.status}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Email Report"
      >
        <div className="space-y-4">
          <Input
            label="Recipient Email"
            type="email"
            value={emailData.recipient}
            onChange={(e) =>
              setEmailData({ ...emailData, recipient: e.target.value })
            }
            placeholder="Enter recipient email"
          />
          <Input
            label="Subject"
            value={emailData.subject}
            onChange={(e) =>
              setEmailData({ ...emailData, subject: e.target.value })
            }
            placeholder="Enter email subject"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={4}
              value={emailData.message}
              onChange={(e) =>
                setEmailData({ ...emailData, message: e.target.value })
              }
              placeholder="Enter your message"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => setShowEmailModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={sendEmail}>Send Email</Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Restoring summary cards to show numbers based on filtered data */}

      {/* Removed Overview Chart as per user request */}
    </div>
  );
};

export default Reports;
