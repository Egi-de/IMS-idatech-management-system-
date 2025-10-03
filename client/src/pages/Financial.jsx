import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import FinancialChart from "../components/FinancialChart";
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getReports,
  generatePDFReport,
} from "../services/api";

const Financial = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Recent Transactions states
  const [recentSearchQuery, setRecentSearchQuery] = useState("");
  const [recentFilterType, setRecentFilterType] = useState("");
  const [recentFilterStatus, setRecentFilterStatus] = useState("");
  const [recentSortBy, setRecentSortBy] = useState("date");

  // Dynamic financial data
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customFilters, setCustomFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
  });
  const [reportParams, setReportParams] = useState({});

  // Form state for modals
  const [formData, setFormData] = useState({
    type: "Income",
    category: "",
    description: "",
    amount: "",
    date: "",
    status: "Completed",
    reference: "",
    method: "",
  });

  const tabs = [
    { id: "overview", name: "Financial Overview", icon: ChartBarIcon },
    { id: "transactions", name: "Transactions", icon: CurrencyDollarIcon },
    { id: "income", name: "Income", icon: ArrowUpIcon },
    { id: "expenses", name: "Expenses", icon: ArrowDownIcon },
    { id: "reports", name: "Financial Reports", icon: ReceiptRefundIcon },
  ];

  const statuses = ["All", "Completed", "Pending", "Failed"];

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTransactions();
      // Parse amounts to numbers and adjust for expenses to be negative if positive in DB
      const adjustedTransactions = response.data.map((t) => ({
        ...t,
        amount:
          t.type === "Expense"
            ? -Math.abs(parseFloat(t.amount))
            : parseFloat(t.amount),
      }));
      setTransactions(adjustedTransactions);
      // Derive recent transactions independently (top 5 by date)
      const recent = adjustedTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentTransactions(recent);
    } catch (err) {
      setError("Failed to fetch transactions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setModalType("add");
    setFormData({
      type: "Income",
      category: "",
      description: "",
      amount: "",
      date: "",
      status: "Completed",
      reference: "",
      method: "",
    });
    setShowModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType("edit");
    setFormData({
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      date: transaction.date,
      status: transaction.status,
      reference: transaction.reference,
      method: transaction.method,
    });
    setShowModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);
        fetchTransactions(); // Refetch after delete (updates both main and recent)
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        alert("Failed to delete transaction");
      }
    }
  };

  const handleDeleteRecentTransaction = (transactionId) => {
    if (
      window.confirm(
        "Remove from recent view? This won't delete the actual transaction."
      )
    ) {
      setRecentTransactions((prev) =>
        prev.filter((t) => t.id !== transactionId)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (modalType === "add") {
        await createTransaction(data);
      } else {
        await updateTransaction(selectedTransaction.id, data);
      }
      setShowModal(false);
      fetchTransactions(); // Refetch after add/edit
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async (type) => {
    setReportLoading(true);
    setReportError(null);
    try {
      let params = { report_type: type };
      if (type === "monthly") {
        const now = new Date();
        params.month = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;
      }
      const response = await getReports(params);
      setReportData(response.data);
      setReportParams(params);
      setSelectedReport(type);
      setShowReportModal(true);
    } catch (err) {
      setReportError("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleCustomReport = () => {
    setShowCustomBuilder(true);
  };

  const handleCustomFilterChange = (e) => {
    const { name, value } = e.target;
    setCustomFilters((prev) => ({ ...prev, [name]: value }));
  };

  const generateCustom = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const params = { report_type: "custom", ...customFilters };
      if (customFilters.startDate && customFilters.endDate) {
        params.start_date = customFilters.startDate;
        params.end_date = customFilters.endDate;
      }
      if (customFilters.type) {
        params.type = customFilters.type;
      }
      const response = await getReports(params);
      setReportData(response.data);
      setReportParams(params);
      setSelectedReport("custom");
      setShowReportModal(true);
      setShowCustomBuilder(false);
    } catch (err) {
      setReportError("Failed to generate custom report. Please try again.");
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const getTypeColor = (type) => {
    return type === "Income"
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-100";
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "" ||
      filterType === "All" ||
      transaction.type === filterType;
    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "All" ||
      transaction.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Income
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  ${totalIncome.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Expenses
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  ${totalExpenses.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Net Profit
                </h3>
                <p
                  className={`text-2xl font-bold ${
                    netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${netProfit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <FinancialChart income={totalIncome} expenses={totalExpenses} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <>
              {/* Search, Filter, Sort Controls */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={recentSearchQuery}
                        onChange={(e) => setRecentSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <select
                    value={recentFilterType}
                    onChange={(e) => setRecentFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>

                  <select
                    value={recentFilterStatus}
                    onChange={(e) => setRecentFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>

                  <select
                    value={recentSortBy}
                    onChange={(e) => setRecentSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="type">Sort by Type</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setRecentSearchQuery("");
                      setRecentFilterType("");
                      setRecentFilterStatus("");
                      setRecentSortBy("date");
                    }}
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* Filtered and Sorted Recent Transactions */}
              <div className="space-y-3">
                {(() => {
                  // Filter recent transactions
                  let filtered = recentTransactions.filter((transaction) => {
                    const matchesSearch =
                      transaction.description
                        .toLowerCase()
                        .includes(recentSearchQuery.toLowerCase()) ||
                      transaction.category
                        .toLowerCase()
                        .includes(recentSearchQuery.toLowerCase()) ||
                      transaction.reference
                        .toLowerCase()
                        .includes(recentSearchQuery.toLowerCase());
                    const matchesType =
                      recentFilterType === "" ||
                      transaction.type === recentFilterType;
                    const matchesStatus =
                      recentFilterStatus === "" ||
                      transaction.status === recentFilterStatus;

                    return matchesSearch && matchesType && matchesStatus;
                  });

                  // Sort recent transactions
                  filtered.sort((a, b) => {
                    switch (recentSortBy) {
                      case "date":
                        return new Date(b.date) - new Date(a.date);
                      case "amount":
                        return Math.abs(b.amount) - Math.abs(a.amount);
                      case "type":
                        return a.type.localeCompare(b.type);
                      default:
                        return 0;
                    }
                  });

                  return filtered.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "Income"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "Income" ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.category} •{" "}
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right flex-1">
                          <p
                            className={`font-semibold ${
                              transaction.type === "Income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "Income" ? "+" : ""}$
                            {Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <p
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() =>
                            handleDeleteRecentTransaction(transaction.id)
                          }
                          className="ml-2"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Transactions</h2>
        <Button onClick={handleAddTransaction}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
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
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
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
                setFilterType("");
                setFilterStatus("");
              }}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Payment Method</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {transaction.reference}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            transaction.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "Income" ? "+" : ""}$
                          {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {transaction.method || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleViewTransaction(transaction)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
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
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderIncome = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Income Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <ArrowUpIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">
                ${totalIncome.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Income</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <BanknotesIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">
                {transactions.filter((t) => t.type === "Income").length}
              </div>
              <div className="text-sm text-gray-600">Income Transactions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">
                $
                {Math.round(
                  totalIncome /
                    transactions.filter((t) => t.type === "Income").length
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Average per Transaction
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">Income Breakdown by Category</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              [
                ...new Set(
                  transactions
                    .filter((t) => t.type === "Income")
                    .map((t) => t.category)
                ),
              ].map((category) => {
                const categoryTotal = transactions
                  .filter((t) => t.type === "Income" && t.category === category)
                  .reduce((sum, t) => sum + t.amount, 0);

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{category}</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${categoryTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Expense Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <ArrowDownIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-600">
                ${totalExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <CreditCardIcon className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-orange-600">
                {transactions.filter((t) => t.type === "Expense").length}
              </div>
              <div className="text-sm text-gray-600">Expense Transactions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <BuildingLibraryIcon className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-indigo-600">
                $
                {Math.round(
                  totalExpenses /
                    transactions.filter((t) => t.type === "Expense").length
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Average per Transaction
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">Expense Breakdown by Category</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              [
                ...new Set(
                  transactions
                    .filter((t) => t.type === "Expense")
                    .map((t) => t.category)
                ),
              ].map((category) => {
                const categoryTotal = transactions
                  .filter(
                    (t) => t.type === "Expense" && t.category === category
                  )
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{category}</span>
                    <span className="text-lg font-semibold text-red-600">
                      ${categoryTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <ReceiptRefundIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Monthly Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed monthly financial summary
              </p>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleGenerateReport("monthly")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Profit & Loss</h3>
              <p className="text-sm text-gray-600 mb-4">
                Income vs expenses analysis
              </p>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleGenerateReport("pnl")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Cash Flow</h3>
              <p className="text-sm text-gray-600 mb-4">Cash flow statement</p>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleGenerateReport("cashflow")}
              >
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-8">
            <ReceiptRefundIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Custom Reports
            </h3>
            <p className="text-gray-600 mb-4">
              Create custom financial reports based on your specific needs
            </p>
            <Button onClick={handleCustomReport}>Start Report Builder</Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder Modal */}
      <Modal
        isOpen={selectedReport === "custom" && !showReportModal}
        onClose={() => {
          setSelectedReport("");
          setCustomFilters({ startDate: "", endDate: "", type: "" });
        }}
        title="Custom Report Builder"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={customFilters.startDate}
              onChange={handleCustomFilterChange}
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={customFilters.endDate}
              onChange={handleCustomFilterChange}
            />
          </div>
          <select
            name="type"
            value={customFilters.type}
            onChange={handleCustomFilterChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Income">Income Only</option>
            <option value="Expense">Expenses Only</option>
          </select>
          <Button onClick={handleCustomReport}>Generate Custom Report</Button>
        </div>
      </Modal>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "transactions":
        return renderTransactions();
      case "income":
        return renderIncome();
      case "expenses":
        return renderExpenses();
      case "reports":
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>

      {/* Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          modalType === "add"
            ? "Add New Transaction"
            : modalType === "edit"
            ? "Edit Transaction"
            : "Transaction Details"
        }
        size="large"
      >
        {selectedTransaction && modalType === "view" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <p
                  className={`mt-1 px-3 py-2 rounded-lg text-sm font-medium ${getTypeColor(
                    selectedTransaction.type
                  )}`}
                >
                  {selectedTransaction.type}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    selectedTransaction.type === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedTransaction.type === "Income" ? "+" : ""}$
                  {Math.abs(selectedTransaction.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <p className="mt-1">{selectedTransaction.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <p className="mt-1">
                  {new Date(selectedTransaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="mt-1">{selectedTransaction.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference
                </label>
                <p className="mt-1">{selectedTransaction.reference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <p className="mt-1">{selectedTransaction.method}</p>
              </div>
            </div>
          </div>
        )}

        {(modalType === "add" || modalType === "edit") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <Input
                label="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
              />
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Select category"
              />
              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Enter reference"
              />
              <Input
                label="Payment Method"
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                placeholder="Enter payment method"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {modalType === "add" ? "Add Transaction" : "Update Transaction"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReport("");
        }}
        title={`${
          selectedReport.charAt(0).toUpperCase() +
          selectedReport.slice(1).replace(/([A-Z])/g, " $1")
        } Report`}
        size="xl"
      >
        {reportLoading ? (
          <div className="text-center py-8">Loading report...</div>
        ) : reportError ? (
          <div className="text-center py-8 text-red-600">{reportError}</div>
        ) : (
          <div className="space-y-6">
            {selectedReport === "monthly" &&
              (() => {
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Total Income</h3>
                          <p className="text-2xl font-bold text-green-600">
                            ${reportData.total_income.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Total Expenses</h3>
                          <p className="text-2xl font-bold text-red-600">
                            ${reportData.total_expenses.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Net Profit</h3>
                          <p
                            className={`text-2xl font-bold ${
                              reportData.net_profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${reportData.net_profit.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4">
                                  Description
                                </th>
                                <th className="text-left py-3 px-4">Amount</th>
                                <th className="text-left py-3 px-4">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.transactions.map((t) => (
                                <tr key={t.id} className="border-b">
                                  <td className="py-3 px-4">{t.description}</td>
                                  <td
                                    className={`py-3 px-4 font-semibold ${
                                      t.type === "Income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {t.type === "Income" ? "+" : "-"}$
                                    {Math.abs(t.amount).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    {new Date(t.date).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

            {selectedReport === "pnl" &&
              (() => {
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardContent>
                          <h3 className="font-semibold mb-2">
                            Income Breakdown
                          </h3>
                          <ul className="space-y-2">
                            {Object.entries(reportData.income_by_category).map(
                              ([cat, amt]) => (
                                <li key={cat} className="flex justify-between">
                                  <span>{cat}</span>
                                  <span className="text-green-600 font-semibold">
                                    ${amt.toLocaleString()}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                          <div className="mt-4 pt-4 border-t">
                            <strong>
                              Total Income: $
                              {reportData.total_income.toLocaleString()}
                            </strong>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent>
                          <h3 className="font-semibold mb-2">
                            Expenses Breakdown
                          </h3>
                          <ul className="space-y-2">
                            {Object.entries(
                              reportData.expenses_by_category
                            ).map(([cat, amt]) => (
                              <li key={cat} className="flex justify-between">
                                <span>{cat}</span>
                                <span className="text-red-600 font-semibold">
                                  ${amt.toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-4 border-t">
                            <strong>
                              Total Expenses: $
                              {reportData.total_expenses.toLocaleString()}
                            </strong>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardContent className="text-center">
                        <h3 className="font-semibold mb-2">Net Profit/Loss</h3>
                        <p
                          className={`text-3xl font-bold ${
                            reportData.net_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${reportData.net_profit.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

            {selectedReport === "cashflow" &&
              (() => {
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Card>
                        <CardContent>
                          <h3 className="font-semibold mb-2">
                            Income Breakdown
                          </h3>
                          <ul className="space-y-2">
                            {Object.entries(reportData.income_by_category).map(
                              ([cat, amt]) => (
                                <li key={cat} className="flex justify-between">
                                  <span>{cat}</span>
                                  <span className="text-green-600 font-semibold">
                                    ${amt.toLocaleString()}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                          <div className="mt-4 pt-4 border-t">
                            <strong>
                              Total Income: $
                              {reportData.total_income.toLocaleString()}
                            </strong>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent>
                          <h3 className="font-semibold mb-2">
                            Expenses Breakdown
                          </h3>
                          <ul className="space-y-2">
                            {Object.entries(
                              reportData.expenses_by_category
                            ).map(([cat, amt]) => (
                              <li key={cat} className="flex justify-between">
                                <span>{cat}</span>
                                <span className="text-red-600 font-semibold">
                                  ${amt.toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-4 border-t">
                            <strong>
                              Total Expenses: $
                              {reportData.total_expenses.toLocaleString()}
                            </strong>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardContent className="text-center">
                        <h3 className="font-semibold mb-2">Net Cash Flow</h3>
                        <p
                          className={`text-3xl font-bold ${
                            reportData.net_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${reportData.net_profit.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

            {selectedReport === "custom" &&
              (() => {
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Total Income</h3>
                          <p className="text-2xl font-bold text-green-600">
                            ${reportData.total_income.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Total Expenses</h3>
                          <p className="text-2xl font-bold text-red-600">
                            ${reportData.total_expenses.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="text-center">
                          <h3 className="font-semibold">Net Profit</h3>
                          <p
                            className={`text-2xl font-bold ${
                              reportData.net_profit >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ${reportData.net_profit.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4">
                                  Description
                                </th>
                                <th className="text-left py-3 px-4">Amount</th>
                                <th className="text-left py-3 px-4">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.transactions.map((t) => (
                                <tr key={t.id} className="border-b">
                                  <td className="py-3 px-4">{t.description}</td>
                                  <td
                                    className={`py-3 px-4 font-semibold ${
                                      t.type === "Income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {t.type === "Income" ? "+" : "-"}$
                                    {Math.abs(t.amount).toLocaleString()}
                                  </td>
                                  <td className="py-3 px-4">
                                    {new Date(t.date).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await generatePDFReport(reportParams);
                    const url = window.URL.createObjectURL(
                      new Blob([response.data])
                    );
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute(
                      "download",
                      `${selectedReport}_financial_report.pdf`
                    );
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch {
                    alert("Failed to download PDF");
                  }
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Report Builder Modal */}
      <Modal
        isOpen={showCustomBuilder}
        onClose={() => setShowCustomBuilder(false)}
        title="Custom Report Builder"
        size="large"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={customFilters.startDate}
              onChange={handleCustomFilterChange}
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={customFilters.endDate}
              onChange={handleCustomFilterChange}
            />
          </div>
          <select
            name="type"
            value={customFilters.type}
            onChange={handleCustomFilterChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Income">Income Only</option>
            <option value="Expense">Expenses Only</option>
          </select>
          <Button onClick={generateCustom}>Generate Custom Report</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Financial;
