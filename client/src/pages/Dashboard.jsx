import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import { toast } from "react-toastify";
import {
  AcademicCapIcon,
  UsersIcon,
  CpuChipIcon,
  CodeBracketIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getDashboardSummary } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    iotStudents: 0,
    sodStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    user: "",
    sortBy: "timestamp_desc",
  });

  // Fetch real dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardSummary();
        setStats({
          totalStudents: response.data.totalStudents,
          totalEmployees: response.data.totalEmployees,
          iotStudents: response.data.iotStudents,
          sodStudents: response.data.sodStudents,
        });
        setRecentActivities(response.data.recentActivities || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter and sort activities
  useEffect(() => {
    let filtered = [...recentActivities];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (activity) =>
          activity.action
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          activity.user.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply user filter
    if (filters.user) {
      filtered = filtered.filter((activity) => activity.user === filters.user);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "timestamp_desc":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "timestamp_asc":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "action_asc":
          return a.action.localeCompare(b.action);
        case "action_desc":
          return b.action.localeCompare(a.action);
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
  }, [filters, recentActivities]);

  const handleDeleteActivity = (id) => {
    setRecentActivities((prev) =>
      prev.filter((activity) => activity.id !== id)
    );
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      user: "",
      sortBy: "timestamp_desc",
    });
  };

  // Export dashboard data to CSV
  const handleExport = () => {
    try {
      // Prepare stats data for export
      const statsData = [
        ["Metric", "Value"],
        ["Total Students", stats.totalStudents],
        ["Total Employees", stats.totalEmployees],
        ["IoT Students", stats.iotStudents],
        ["SoD Students", stats.sodStudents],
      ];

      // Prepare activities data for export
      const activitiesData = [
        ["Action", "User", "Timestamp"],
        ...recentActivities.map((activity) => [
          activity.action,
          activity.user,
          activity.timestamp,
        ]),
      ];

      // Create CSV content
      const csvContent = [
        "=== DASHBOARD STATS ===",
        statsData.map((row) => row.join(",")).join("\n"),
        "",
        "=== RECENT ACTIVITIES ===",
        activitiesData.map((row) => row.join(",")).join("\n"),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dashboard_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Dashboard data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export dashboard data");
    }
  };

  // Refresh dashboard data
  const handleRefresh = async () => {
    try {
      toast.info("Refreshing dashboard data...");
      setLoading(true);

      const response = await getDashboardSummary();
      setStats({
        totalStudents: response.data.totalStudents,
        totalEmployees: response.data.totalEmployees,
        iotStudents: response.data.iotStudents,
        sodStudents: response.data.sodStudents,
      });
      setRecentActivities(response.data.recentActivities || []);
      setError(null);

      toast.success("Dashboard refreshed successfully!");
    } catch (error) {
      console.error("Refresh error:", error);
      setError("Failed to refresh dashboard data");
      toast.error("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "..." : stats.totalStudents.toLocaleString(),
      icon: AcademicCapIcon,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Employees",
      value: loading ? "..." : stats.totalEmployees.toLocaleString(),
      icon: UsersIcon,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "IoT Students",
      value: loading ? "..." : stats.iotStudents.toLocaleString(),
      icon: CpuChipIcon,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      title: "SoD Students",
      value: loading ? "..." : stats.sodStudents.toLocaleString(),
      icon: CodeBracketIcon,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          <Button onClick={handleRefresh} className="mt-4">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <div className="flex space-x-3">
          <Button variant="outline" size="small" onClick={handleExport}>
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="small" onClick={handleRefresh} disabled={loading}>
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stat.title}
                  </h3>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <select
              value={filters.user}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, user: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Users</option>
              <option value="System">System</option>
              <option value="HR System">HR System</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="timestamp_desc">Newest First</option>
              <option value="timestamp_asc">Oldest First</option>
              <option value="action_asc">Action A-Z</option>
              <option value="action_desc">Action Z-A</option>
            </select>

            <Button variant="outline" size="small" onClick={clearFilters}>
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <i className={activity.icon}></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {activity.user} •{" "}
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                    title="Delete activity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
                <p>No activities found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
