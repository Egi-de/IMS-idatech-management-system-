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
import {
  getStudents,
  getEmployees,
  getTransactions,
  getComprehensiveStudentReport,
  getComprehensiveEmployeeReport,
  getFinancialAIReport,
} from "../services/api";

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
  const [aiReport, setAiReport] = useState(null);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [employeeAiReport, setEmployeeAiReport] = useState(null);
  const [employeeAiReportLoading, setEmployeeAiReportLoading] = useState(false);
  const [financialAiReport, setFinancialAiReport] = useState(null);
  const [financialAiReportLoading, setFinancialAiReportLoading] =
    useState(false);

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
        // Adjust transaction amounts: make expenses negative
        const adjustedTransactions = transactionsRes.data.map((t) => ({
          ...t,
          amount:
            t.type === "Expense"
              ? -Math.abs(parseFloat(t.amount))
              : parseFloat(t.amount),
        }));
        setTransactionsData(adjustedTransactions);
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

  // Clear AI reports when report type changes
  useEffect(() => {
    setAiReport(null);
    setEmployeeAiReport(null);
    setFinancialAiReport(null);
  }, [formData.reportType]);

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
      dateField = "enrollmentDate";

      // Generate AI comprehensive report for students
      try {
        setAiReportLoading(true);
        const aiResponse = await getComprehensiveStudentReport();
        setAiReport(aiResponse.data);
      } catch (error) {
        console.error("Error generating AI report:", error);
        setToast({
          message: "Failed to generate AI report. Please try again.",
          type: "error",
        });
      } finally {
        setAiReportLoading(false);
      }
    } else if (reportType === "employees") {
      data = employeesData;
      // No dateField, no filtering for employees
    } else if (reportType === "financial") {
      data = transactionsData;
      dateField = "date";

      // Generate AI comprehensive report for financial
      try {
        setFinancialAiReportLoading(true);
        const aiResponse = await getFinancialAIReport();
        setFinancialAiReport(aiResponse.data);
      } catch (error) {
        console.error("Error generating AI report:", error);
        setToast({
          message: "Failed to generate AI report. Please try again.",
          type: "error",
        });
      } finally {
        setFinancialAiReportLoading(false);
      }
    }

    // Filter data by date range if dates are provided and not employees
    if (reportType !== "employees" && fromDate && toDate) {
      data = data.filter((item) =>
        isDateInRange(item[dateField], fromDate, toDate)
      );
    }

    // Group by month if not employees
    if (reportType !== "employees") {
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
    } else {
      // For employees, set data as flat
      setGeneratedReport({ type: reportType, data: data, fromDate, toDate });
    }
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

      {/* Student Charts and Reports */}
      {formData.reportType === "students" && (
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
                    labels: ["IoT Development", "Software Development"],
                    datasets: [
                      {
                        data: [
                          studentsData.filter(
                            (s) => s.program === "IoT Development"
                          ).length,
                          studentsData.filter(
                            (s) => s.program === "Software Development"
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
                          studentsData.filter(
                            (s) => s.gender?.toLowerCase() === "male"
                          ).length,
                          studentsData.filter(
                            (s) => s.gender?.toLowerCase() === "female"
                          ).length,
                          studentsData.filter(
                            (s) => s.gender?.toLowerCase() === "other"
                          ).length,
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
                  labels: ["IoT Development", "Software Development"],
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
                      ],
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderColor: "rgba(59, 130, 246, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Students Passed",
                      data: [
                        studentsData
                          .filter((s) => s.program === "IoT Development")
                          .filter((s) => {
                            const grades = Object.values(s.grades || {});
                            if (grades.length === 0) return false;
                            const gradePoints = grades.map((grade) => {
                              const scale = {
                                A: 4.0,
                                "A-": 3.7,
                                "B+": 3.3,
                                B: 3.0,
                                "B-": 2.7,
                                "C+": 2.3,
                                C: 2.0,
                                "C-": 1.7,
                                "D+": 1.3,
                                D: 1.0,
                                F: 0.0,
                              };
                              return scale[grade] || 0;
                            });
                            const average =
                              gradePoints.reduce(
                                (sum, point) => sum + point,
                                0
                              ) / gradePoints.length;
                            return average >= 2.0;
                          }).length,
                        studentsData
                          .filter((s) => s.program === "Software Development")
                          .filter((s) => {
                            const grades = Object.values(s.grades || {});
                            if (grades.length === 0) return false;
                            const gradePoints = grades.map((grade) => {
                              const scale = {
                                A: 4.0,
                                "A-": 3.7,
                                "B+": 3.3,
                                B: 3.0,
                                "B-": 2.7,
                                "C+": 2.3,
                                C: 2.0,
                                "C-": 1.7,
                                "D+": 1.3,
                                D: 1.0,
                                F: 0.0,
                              };
                              return scale[grade] || 0;
                            });
                            const average =
                              gradePoints.reduce(
                                (sum, point) => sum + point,
                                0
                              ) / gradePoints.length;
                            return average >= 3.0;
                          }).length,
                      ],
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderColor: "rgba(34, 197, 94, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Students Failed",
                      data: [
                        studentsData
                          .filter((s) => s.program === "IoT Development")
                          .filter((s) => {
                            const grades = Object.values(s.grades || {});
                            if (grades.length === 0) return false;
                            const gradePoints = grades.map((grade) => {
                              const scale = {
                                A: 4.0,
                                "A-": 3.7,
                                "B+": 3.3,
                                B: 3.0,
                                "B-": 2.7,
                                "C+": 2.3,
                                C: 2.0,
                                "C-": 1.7,
                                "D+": 1.3,
                                D: 1.0,
                                F: 0.0,
                              };
                              return scale[grade] || 0;
                            });
                            const average =
                              gradePoints.reduce(
                                (sum, point) => sum + point,
                                0
                              ) / gradePoints.length;
                            return average < 3.0;
                          }).length,
                        studentsData
                          .filter((s) => s.program === "Software Development")
                          .filter((s) => {
                            const grades = Object.values(s.grades || {});
                            if (grades.length === 0) return false;
                            const gradePoints = grades.map((grade) => {
                              const scale = {
                                A: 4.0,
                                "A-": 3.7,
                                "B+": 3.3,
                                B: 3.0,
                                "B-": 2.7,
                                "C+": 2.3,
                                C: 2.0,
                                "C-": 1.7,
                                "D+": 1.3,
                                D: 1.0,
                                F: 0.0,
                              };
                              return scale[grade] || 0;
                            });
                            const average =
                              gradePoints.reduce(
                                (sum, point) => sum + point,
                                0
                              ) / gradePoints.length;
                            return average < 3.0;
                          }).length,
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

          {/* AI Comprehensive Report */}
          {aiReport && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Comprehensive Student Report
                </h3>
                <img
                  src="/idalogo.png"
                  alt="IDA Tech Logo"
                  className="h-12 w-auto"
                />
              </div>
              {aiReportLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Generating comprehensive AI report...
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: aiReport.report
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
                        .replace(
                          /<span style="color: green;">(.*?)<\/span>/g,
                          '<span class="text-green-600 font-semibold">$1</span>'
                        )
                        .replace(
                          /<span style="color: red;">(.*?)<\/span>/g,
                          '<span class="text-red-600 font-semibold">$1</span>'
                        )
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {generatedReport && generatedReport.type === "students" && (
        <>
          {/* Generated Student Report Table */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generated Students Report
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              From: {generatedReport.fromDate} To: {generatedReport.toDate}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Month</th>
                    <th className="px-4 py-2 border">Enrollments</th>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Program</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Enrollment Date</th>
                    <th className="px-4 py-2 border">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.data.map((monthData, index) => (
                    <React.Fragment key={index}>
                      {monthData.items.map((student, idx) => {
                        const isHighlighted = isDateInRange(
                          student.enrollmentDate,
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
                                    item.enrollmentDate,
                                    generatedReport.fromDate,
                                    generatedReport.toDate
                                  )
                                ).length || monthData.items.length}
                              </td>
                            )}
                            <td className="px-4 py-2 border">{student.name}</td>
                            <td className="px-4 py-2 border">
                              {student.program}
                            </td>
                            <td className="px-4 py-2 border">
                              {student.status}
                            </td>
                            <td className="px-4 py-2 border">
                              {student.enrollmentDate}
                            </td>
                            <td className="px-4 py-2 border">{student.gpa}</td>
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

      {/* Employee Charts and Reports */}
      {formData.reportType === "employees" && (
        <>
          {/* Department Distribution Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Department Distribution Pie Chart */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Department Distribution
              </h3>
              <div className="h-80">
                <Pie
                  data={{
                    labels: [
                      "Academic",
                      "Catering",
                      "Finance",
                      "Discipline & Welfare",
                    ],
                    datasets: [
                      {
                        data: [
                          employeesData.filter(
                            (e) => e.department?.name === "academic"
                          ).length,
                          employeesData.filter(
                            (e) => e.department?.name === "catering"
                          ).length,
                          employeesData.filter(
                            (e) => e.department?.name === "finance"
                          ).length,
                          employeesData.filter(
                            (e) => e.department?.name === "discipline_welfare"
                          ).length,
                        ],
                        backgroundColor: [
                          "rgba(54, 162, 235, 0.8)",
                          "rgba(255, 99, 132, 0.8)",
                          "rgba(75, 192, 192, 0.8)",
                          "rgba(255, 205, 86, 0.8)",
                        ],
                        borderColor: [
                          "rgba(54, 162, 235, 1)",
                          "rgba(255, 99, 132, 1)",
                          "rgba(75, 192, 192, 1)",
                          "rgba(255, 205, 86, 1)",
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
                          employeesData.filter(
                            (e) => e.gender?.toLowerCase() === "male"
                          ).length,
                          employeesData.filter(
                            (e) => e.gender?.toLowerCase() === "female"
                          ).length,
                          employeesData.filter(
                            (e) => e.gender?.toLowerCase() === "other"
                          ).length,
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

          {/* Employee Report Generation */}
          <Card className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generate AI Employee Report
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback on Employee Behavior (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  value={formData.employeeFeedback || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeFeedback: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={async () => {
                  setEmployeeAiReportLoading(true);
                  try {
                    const response = await getComprehensiveEmployeeReport(
                      formData.employeeFeedback || ""
                    );
                    setEmployeeAiReport(response.data);
                  } catch (error) {
                    console.error(
                      "Error generating employee AI report:",
                      error
                    );
                    setToast({
                      message:
                        "Failed to generate AI report. Please try again.",
                      type: "error",
                    });
                  } finally {
                    setEmployeeAiReportLoading(false);
                  }
                }}
                disabled={employeeAiReportLoading}
              >
                {employeeAiReportLoading
                  ? "Generating..."
                  : "Generate AI Employee Report"}
              </Button>
            </div>
          </Card>

          {/* AI Comprehensive Employee Report Display */}
          {employeeAiReport && employeeAiReport.report && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Comprehensive Employee Report
                </h3>
                <img
                  src="/idalogo.png"
                  alt="IDA Tech Logo"
                  className="h-12 w-auto"
                />
              </div>
              {employeeAiReportLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Generating comprehensive AI report...
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: employeeAiReport.report
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
                        .replace(
                          /<span style="color: green;">(.*?)<\/span>/g,
                          '<span class="text-green-600 font-semibold">$1</span>'
                        )
                        .replace(
                          /<span style="color: red;">(.*?)<\/span>/g,
                          '<span class="text-red-600 font-semibold">$1</span>'
                        )
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Financial Charts and Reports */}
      {formData.reportType === "financial" && (
        <>
          {dataLoading ? (
            <Card className="mb-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading financial data...
                </p>
              </div>
            </Card>
          ) : dataError ? (
            <Card className="mb-6">
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">{dataError}</p>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Please refresh the page or try again later.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Executive Summary */}
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Executive Summary
                  </h2>
                  <img
                    src="/idalogo.png"
                    alt="IDA Tech Logo"
                    className="h-12 w-auto"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      Total Revenue
                    </h3>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      $
                      {transactionsData
                        .filter((t) => t.type === "Income")
                        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Total Expenses
                    </h3>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      $
                      {transactionsData
                        .filter((t) => t.type === "Expense")
                        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Net Profit
                    </h3>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      $
                      {(
                        transactionsData
                          .filter((t) => t.type === "Income")
                          .reduce(
                            (sum, t) => sum + parseFloat(t.amount || 0),
                            0
                          ) -
                        transactionsData
                          .filter((t) => t.type === "Expense")
                          .reduce(
                            (sum, t) => sum + parseFloat(t.amount || 0),
                            0
                          )
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  This financial report provides a comprehensive overview of the
                  organization's financial performance for the selected period.
                  Key highlights include steady revenue growth and controlled
                  expenses, leading to positive net profit. Areas of focus
                  include optimizing expense categories and expanding revenue
                  streams.
                </p>
              </Card>
              {/* Financial Statement Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Income Sources */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Income Sources
                  </h3>
                  <div className="h-30">
                    <FinancialChart
                      type="income"
                      transactionsData={transactionsData}
                    />
                  </div>
                </Card>
                {/* Expense Categories */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Expense Categories
                  </h3>
                  <div className="h-30">
                    <FinancialChart
                      type="expense"
                      transactionsData={transactionsData}
                    />
                  </div>
                </Card>
                {/* Monthly Trend */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Trend
                  </h3>
                  <div className="h-30">
                    <FinancialChart
                      type="trend"
                      transactionsData={transactionsData}
                    />
                  </div>
                </Card>
              </div>
              {/* AI Financial Report */}
              {financialAiReport && (
                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      AI Comprehensive Financial Report
                    </h3>
                    <img
                      src="/idalogo.png"
                      alt="IDA Tech Logo"
                      className="h-12 w-auto"
                    />
                  </div>
                  {financialAiReportLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Generating comprehensive AI report...
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div
                        className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: financialAiReport.report
                            .replace(
                              /<h2>/g,
                              '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">'
                            )
                            .replace(
                              /<h3>/g,
                              '<h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">'
                            )
                            .replace(/<p>/g, '<p class="mb-3">')
                            .replace(
                              /<ul>/g,
                              '<ul class="list-disc list-inside mb-4 space-y-1">'
                            )
                            .replace(
                              /<li>/g,
                              '<li class="text-gray-700 dark:text-gray-300">'
                            )
                            .replace(
                              /<table>/g,
                              '<div class="overflow-x-auto mb-4"><table class="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">'
                            )
                            .replace(/<\/table>/g, "</table></div>")
                            .replace(
                              /<tr>/g,
                              '<tr class="border-b border-gray-200 dark:border-gray-600">'
                            )
                            .replace(
                              /<th/g,
                              '<th class="px-4 py-2 text-left bg-gray-50 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 last:border-r-0"'
                            )
                            .replace(
                              /<td/g,
                              '<td class="px-4 py-2 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0"'
                            )
                            .replace(
                              /<div style="border: 2px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">/g,
                              '<div class="border-2 border-gray-300 dark:border-gray-600 p-4 my-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">'
                            )
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
                            .replace(
                              /<span style="color: green;">(.*?)<\/span>/g,
                              '<span class="text-green-600 font-semibold">$1</span>'
                            )
                            .replace(
                              /<span style="color: red;">(.*?)<\/span>/g,
                              '<span class="text-red-600 font-semibold">$1</span>'
                            )
                            .replace(/\n/g, ""),
                        }}
                      />
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Email Modal */}
      {showEmailModal && (
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
            />
            <Input
              label="Subject"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData({ ...emailData, subject: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                value={emailData.message}
                onChange={(e) =>
                  setEmailData({ ...emailData, message: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={sendEmail}>Send Email</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Reports;
