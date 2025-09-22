import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
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
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployees: 0,
    iotStudents: 0,
    sodStudents: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    user: "",
    sortBy: "timestamp_desc",
  });

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setStats({
      totalStudents: 1250,
      totalEmployees: 45,
      iotStudents: 680,
      sodStudents: 570,
    });

    setRecentActivities([
      {
        id: 1,
        action: "New student enrolled in IoT program",
        user: "Admin User",
        timestamp: "2024-01-15 14:30:00",
        icon: "fas fa-user-plus text-green-600",
      },
      {
        id: 2,
        action: "Employee salary updated",
        user: "HR Manager",
        timestamp: "2024-01-15 13:45:00",
        icon: "fas fa-dollar-sign text-blue-600",
      },
      {
        id: 3,
        action: "Student attendance marked",
        user: "Teacher",
        timestamp: "2024-01-15 12:15:00",
        icon: "fas fa-check-circle text-green-600",
      },
      {
        id: 4,
        action: "New expense added",
        user: "Finance Manager",
        timestamp: "2024-01-15 11:30:00",
        icon: "fas fa-credit-card text-red-600",
      },
      {
        id: 5,
        action: "Report generated",
        user: "Admin User",
        timestamp: "2024-01-15 10:45:00",
        icon: "fas fa-chart-bar text-purple-600",
      },
    ]);

    setFilteredActivities(recentActivities);
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

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      icon: AcademicCapIcon,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Employees",
      value: stats.totalEmployees.toLocaleString(),
      icon: UsersIcon,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "IoT Students",
      value: stats.iotStudents.toLocaleString(),
      icon: CpuChipIcon,
      color: "yellow",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      title: "SoD Students",
      value: stats.sodStudents.toLocaleString(),
      icon: CodeBracketIcon,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex space-x-3">
          <Button variant="outline" size="small">
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="small">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
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
                  <h3 className="text-lg font-semibold text-gray-900">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.user}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, user: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="Admin User">Admin User</option>
              <option value="HR Manager">HR Manager</option>
              <option value="Teacher">Teacher</option>
              <option value="Finance Manager">Finance Manager</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <i className={activity.icon}></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {activity.user} •{" "}
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                    title="Delete activity"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
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
