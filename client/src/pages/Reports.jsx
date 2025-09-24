import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import Button from "../components/Button";

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    totalExpenses: 0,
    iotStudents: 0,
    sodStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data since we're focusing on frontend only
    const mockData = {
      totalStudents: 150,
      totalEmployees: 25,
      totalExpenses: 125000,
      iotStudents: 85,
      sodStudents: 65,
    };

    // Simulate loading delay
    setTimeout(() => {
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            Total Expenses: ${reportData.totalExpenses}
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
              <Link
                to="/reports/student-detail"
                className="text-blue-500 hover:underline"
              >
                Student Detail Reports
              </Link>
            </li>
            <li>
              <Link
                to="/reports/employee-detail"
                className="text-blue-500 hover:underline"
              >
                Employee Detail Reports
              </Link>
            </li>
            <li>
              <Link
                to="/reports/financial-detail"
                className="text-blue-500 hover:underline"
              >
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
              <button
                className="text-blue-500 hover:underline"
                onClick={() =>
                  alert("Export functionality will be implemented later")
                }
              >
                Export Financial Report (PDF)
              </button>
            </li>
            <li>
              <button
                className="text-blue-500 hover:underline"
                onClick={() =>
                  alert("Export functionality will be implemented later")
                }
              >
                Export Financial Report (Excel)
              </button>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
