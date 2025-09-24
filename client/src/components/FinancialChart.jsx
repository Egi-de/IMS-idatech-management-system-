import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialChart = ({ income, expenses }) => {
  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Amount ($)",
        data: [income, expenses],
        backgroundColor: [
          "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Enhanced green gradient
          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Enhanced red gradient
        ],
        borderColor: ["rgba(16, 185, 129, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 0,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: [
          "linear-gradient(135deg, #059669 0%, #047857 100%)",
          "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        ],
        hoverBorderColor: ["rgba(16, 185, 129, 1)", "rgba(239, 68, 68, 1)"],
        hoverBorderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: true,
        text: "Income vs Expenses Overview",
        font: {
          size: 18,
          weight: "600",
          family: "'Inter', sans-serif",
        },
        color: "#1f2937",
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `Amount: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 14,
            weight: "500",
            family: "'Inter', sans-serif",
          },
          padding: 10,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
            weight: "400",
            family: "'Inter', sans-serif",
          },
          padding: 10,
          callback: function (value) {
            if (value >= 1000) {
              return "$" + (value / 1000).toFixed(0) + "k";
            }
            return "$" + value.toLocaleString();
          },
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 12,
      },
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  return (
    <div className="relative">
      {/* Custom Legend */}
      <div className="flex justify-center items-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Income</span>
          <span className="text-sm font-bold text-green-600">
            ${income.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Expenses</span>
          <span className="text-sm font-bold text-red-600">
            ${expenses.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart Container with Enhanced Styling */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner border border-gray-200/50">
        <div className="h-80 w-full">
          <Bar data={data} options={options} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};

export default FinancialChart;
