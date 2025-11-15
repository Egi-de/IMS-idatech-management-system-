import React, { useState, useEffect } from "react";
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
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { getStudents, getEmployees, getTransactions } from "../services/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement
);

const Reports = () => {
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

  // Data states
  const [studentsData, setStudentsData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const [studentsRes, employeesRes, transactionsRes] = await Promise.all([
          getStudents(),
          getEmployees(),
          getTransactions(),
        ]);
        setStudentsData(studentsRes.data);
        setEmployeesData(employeesRes.data);
        setTransactionsData(transactionsRes.data);
        setDataError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDataError("Failed to load data. Please try again.");
        setToast({
          message: "Failed to load data. Please refresh the page.",
          type: "error",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const isDateInRange = (dateStr, from, to) => {
    if (!from || !to) return false;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const fromD = new Date(from);
    const toD = new Date(to);
    return date >= fromD && date <= toD;
  };

  const generateReport = async () => {
    if (dataLoading) {
      setToast({
        message: "Data is still loading. Please wait.",
        type: "warning",
      });
      return;
    }

    if (dataError) {
      setToast({
        message: "Data loading failed. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    // Simulate processing time for large reports
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { reportType, fromDate, toDate } = formData;
    let data = [];
    let dateField = "";
    if (reportType === "students") {
      data = studentsData;
      dateField = "enrollment_date";
    } else if (reportType === "employees") {
      data = employeesData;
      dateField = "hire_date";
    } else if (reportType === "financial") {
      data = transactionsData;
      dateField = "date";
    }

    // Filter data by date range if dates are provided
    if (fromDate && toDate) {
      data = data.filter((item) =>
        isDateInRange(item[dateField], fromDate, toDate)
      );
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
            student.enrollment_date,
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
            employee.hire_date,
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

      {generatedReport && generatedReport.type === "students" && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Program Distribution Pie Chart */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Program Distribution
              </h3>
              <div className="h-80">
                <Pie
                  data={{
                    labels: [
                      "IoT Development",
                      "Software Development",
                      "Data Science",
                    ],
                    datasets: [
                      {
                        data: [
                          studentsData.filter(
                            (s) => s.program === "IoT Development"
                          ).length,
                          studentsData.filter(
                            (s) => s.program === "Software Development"
                          ).length,
                          studentsData.filter(
                            (s) => s.program === "Data Science"
                          ).length,
                        ],
                        backgroundColor: [
                          "rgba(54, 162, 235, 0.8)",
                          "rgba(255, 99, 132, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                        ],
                        borderColor: [
                          "rgba(54, 162, 235, 1)",
                          "rgba(255, 99, 132, 1)",
                          "rgba(75, 192, 192, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </Card>

            {/* Gender Distribution Pie Chart */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Gender Distribution
              </h3>
              <div className="h-80">
                <Pie
                  data={{
                    labels: ["Male", "Female", "Other"],
                    datasets: [
                      {
                        data: [
                          studentsData.filter((s) => s.gender === "Male")
                            .length,
                          studentsData.filter((s) => s.gender === "Female")
                            .length,
                          studentsData.filter((s) => s.gender === "Other")
                            .length,
                        ],
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.8)",
                          "rgba(236, 72, 153, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                        ],
                        borderColor: [
                          "rgba(59, 130, 246, 1)",
                          "rgba(236, 72, 153, 1)",
                          "rgba(75, 192, 192, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Quiz Performance Comparison Bar Chart */}
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quiz Performance by Program
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: [
                    "IoT Development",
                    "Software Development",
                    "Data Science",
                  ],
                  datasets: [
                    {
                      label: "Quizzes Taken",
                      data: [
                        studentsData
                          .filter((s) => s.program === "IoT Development")
                          .reduce(
                            (sum, s) =>
                              sum + Object.keys(s.grades || {}).length,
                            0
                          ),
                        studentsData
                          .filter((s) => s.program === "Software Development")
                          .reduce(
                            (sum, s) =>
                              sum + Object.keys(s.grades || {}).length,
                            0
                          ),
                        studentsData
                          .filter((s) => s.program === "Data Science")
                          .reduce(
                            (sum, s) =>
                              sum + Object.keys(s.grades || {}).length,
                            0
                          ),
                      ],
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderColor: "rgba(59, 130, 246, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Students Passed",
                      data: [
                        studentsData.filter(
                          (s) =>
                            s.program === "IoT Development" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) >= 60
                            )
                        ).length,
                        studentsData.filter(
                          (s) =>
                            s.program === "Software Development" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) >= 60
                            )
                        ).length,
                        studentsData.filter(
                          (s) =>
                            s.program === "Data Science" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) >= 60
                            )
                        ).length,
                      ],
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderColor: "rgba(34, 197, 94, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Students Failed",
                      data: [
                        studentsData.filter(
                          (s) =>
                            s.program === "IoT Development" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) < 60
                            )
                        ).length,
                        studentsData.filter(
                          (s) =>
                            s.program === "Software Development" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) < 60
                            )
                        ).length,
                        studentsData.filter(
                          (s) =>
                            s.program === "Data Science" &&
                            Object.values(s.grades || {}).some(
                              (grade) => parseFloat(grade) < 60
                            )
                        ).length,
                      ],
                      backgroundColor: "rgba(239, 68, 68, 0.8)",
                      borderColor: "rgba(239, 68, 68, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Top Performers Table */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Performers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Rank</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Program</th>
                    <th className="px-4 py-2 border">GPA</th>
                    <th className="px-4 py-2 border">Attendance</th>
                    <th className="px-4 py-2 border">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData
                    .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
                    .slice(0, 10)
                    .map((student, index) => (
                      <tr
                        key={student.id}
                        className={
                          index % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-700"
                            : "bg-white dark:bg-gray-800"
                        }
                      >
                        <td className="px-4 py-2 border font-bold">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 border">{student.name}</td>
                        <td className="px-4 py-2 border">{student.program}</td>
                        <td className="px-4 py-2 border">
                          {student.gpa || "N/A"}
                        </td>
                        <td className="px-4 py-2 border">
                          {student.overallAttendance || 0}%
                        </td>
                        <td className="px-4 py-2 border">
                          {student.totalProjects || 0}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Students Needing Improvement */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Students Needing Improvement
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Program</th>
                    <th className="px-4 py-2 border">GPA</th>
                    <th className="px-4 py-2 border">Attendance</th>
                    <th className="px-4 py-2 border">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData
                    .filter(
                      (s) =>
                        (s.gpa || 0) < 2.0 || (s.overallAttendance || 0) < 70
                    )
                    .map((student) => (
                      <tr
                        key={student.id}
                        className="bg-red-50 dark:bg-red-900/20"
                      >
                        <td className="px-4 py-2 border">{student.name}</td>
                        <td className="px-4 py-2 border">{student.program}</td>
                        <td className="px-4 py-2 border">
                          {student.gpa || "N/A"}
                        </td>
                        <td className="px-4 py-2 border">
                          {student.overallAttendance || 0}%
                        </td>
                        <td className="px-4 py-2 border">
                          {(student.gpa || 0) < 2.0 &&
                          (student.overallAttendance || 0) < 70
                            ? "Low GPA & Attendance"
                            : (student.gpa || 0) < 2.0
                            ? "Low GPA"
                            : "Low Attendance"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Feedback Summary */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Feedback Summary
            </h3>
            <div className="space-y-4">
              {studentsData.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest feedback:{" "}
                    {student.feedback?.[student.feedback.length - 1]
                      ?.comments || "No feedback yet"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.feedback?.[
                      student.feedback.length - 1
                    ]?.strengths?.map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {generatedReport && generatedReport.type !== "students" && (
        <>
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
                          generatedReport.type === "employees"
                            ? item.hire_date
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
                                    generatedReport.type === "employees"
                                      ? item.hire_date
                                      : item.date,
                                    generatedReport.fromDate,
                                    generatedReport.toDate
                                  )
                                ).length || monthData.items.length}
                              </td>
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
                                  {item.hire_date}
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
