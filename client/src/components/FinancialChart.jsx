import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const FinancialChart = ({ type, transactionsData }) => {
  // Calculate totals based on type
  const incomeTotal = transactionsData
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const expenseTotal = Math.abs(
    transactionsData
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  );

  // Group transactions by category for pie chart
  const expenseCategories = {};
  transactionsData
    .filter((t) => t.type === "Expense")
    .forEach((t) => {
      const category = t.category || "Other";
      expenseCategories[category] =
        (expenseCategories[category] || 0) +
        Math.abs(parseFloat(t.amount || 0));
    });

  const incomeCategories = {};
  transactionsData
    .filter((t) => t.type === "Income")
    .forEach((t) => {
      const category = t.category || "Other";
      incomeCategories[category] =
        (incomeCategories[category] || 0) + parseFloat(t.amount || 0);
    });

  // Group by month for line chart
  const monthlyData = {};
  transactionsData.forEach((t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    if (!monthlyData[monthKey])
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    if (t.type === "Income") {
      monthlyData[monthKey].income += parseFloat(t.amount || 0);
    } else {
      monthlyData[monthKey].expenses += Math.abs(parseFloat(t.amount || 0));
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyIncome = sortedMonths.map((month) => monthlyData[month].income);
  const monthlyExpenses = sortedMonths.map(
    (month) => monthlyData[month].expenses
  );

  let chartData, options, ChartComponent;

  if (type === "income") {
    // Income sources pie chart
    chartData = {
      labels: Object.keys(incomeCategories),
      datasets: [
        {
          data: Object.values(incomeCategories),
          backgroundColor: [
            "#10b981",
            "#059669",
            "#047857",
            "#065f46",
            "#064e3b",
          ],
          borderWidth: 1,
        },
      ],
    };
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Income Sources" },
      },
    };
    ChartComponent = Pie;
  } else if (type === "expense") {
    // Expense categories pie chart
    chartData = {
      labels: Object.keys(expenseCategories),
      datasets: [
        {
          data: Object.values(expenseCategories),
          backgroundColor: [
            "#ef4444",
            "#dc2626",
            "#b91c1c",
            "#991b1b",
            "#7f1d1d",
          ],
          borderWidth: 1,
        },
      ],
    };
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Expense Categories" },
      },
    };
    ChartComponent = Pie;
  } else if (type === "trend") {
    // Monthly trend line chart
    chartData = {
      labels: sortedMonths,
      datasets: [
        {
          label: "Income",
          data: monthlyIncome,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: monthlyExpenses,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
      ],
    };
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Monthly Financial Trend" },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    };
    ChartComponent = Line;
  } else {
    // Default bar chart for comparison
    chartData = {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount ($)",
          data: [incomeTotal, expenseTotal],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 0,
          borderRadius: 12,
        },
      ],
    };
    options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Income vs Expenses Overview" },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Amount: $${context.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    };
    ChartComponent = Bar;
  }

  return (
    <div className="relative">
      {/* Summary */}
      <div className="flex justify-center items-center space-x-6 mb-4">
        {type === "income" && (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-700">
              Total Income
            </span>
            <p className="text-2xl font-bold text-green-600">
              ${incomeTotal.toLocaleString()}
            </p>
          </div>
        )}
        {type === "expense" && (
          <div className="text-center">
            <span className="text-sm font-medium text-gray-700">
              Total Expenses
            </span>
            <p className="text-2xl font-bold text-red-600">
              ${expenseTotal.toLocaleString()}
            </p>
          </div>
        )}
        {type !== "income" && type !== "expense" && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-lg bg-green-500 shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Income</span>
              <span className="text-sm font-bold text-green-600">
                ${incomeTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">
                Expenses
              </span>
              <span className="text-sm font-bold text-red-600">
                ${expenseTotal.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner border border-gray-200/50">
        <div className="h-80 w-full">
          <ChartComponent data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
