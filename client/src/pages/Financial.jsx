import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
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

const Financial = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Mock financial data
  const [transactions] = useState([
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
  ]);

  const tabs = [
    { id: "overview", name: "Financial Overview", icon: ChartBarIcon },
    { id: "transactions", name: "Transactions", icon: CurrencyDollarIcon },
    { id: "income", name: "Income", icon: ArrowUpIcon },
    { id: "expenses", name: "Expenses", icon: ArrowDownIcon },
    { id: "reports", name: "Financial Reports", icon: ReceiptRefundIcon },
  ];

  const statuses = ["All", "Completed", "Pending", "Failed"];

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType("view");
    setShowModal(true);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setModalType("add");
    setShowModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setModalType("edit");
    setShowModal(true);
  };

  const handleDeleteTransaction = (transactionId) => {
    // Implement delete functionality
    console.log("Delete transaction:", transactionId);
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

      {/* Income vs Expenses Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-sm text-gray-500">
                Integration with Chart.js or similar library
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
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
                <div className="text-right">
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
              </div>
            ))}
          </div>
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
            {["Student Fees", "Workshop Revenue"].map((category) => {
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
            })}
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
            {["Equipment", "Salary", "Utilities"].map((category) => {
              const categoryTotal = transactions
                .filter((t) => t.type === "Expense" && t.category === category)
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
            })}
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
              <Button variant="outline" size="small">
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
              <Button variant="outline" size="small">
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
              <Button variant="outline" size="small">
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
            <Button>Start Report Builder</Button>
          </div>
        </CardContent>
      </Card>
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
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <Input label="Amount" type="number" placeholder="Enter amount" />
              <Input label="Category" placeholder="Select category" />
              <Input label="Date" type="date" />
            </div>
            <Input label="Description" placeholder="Enter description" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Reference" placeholder="Enter reference" />
              <Input
                label="Payment Method"
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
    </div>
  );
};

export default Financial;
