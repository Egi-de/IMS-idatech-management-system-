import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children, isDarkMode, setIsDarkMode }) => {
  // Sidebar state with localStorage persistence
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    const initialValue = saved ? JSON.parse(saved) : false;
    console.log("Initial sidebar state:", initialValue);
    return initialValue;
  });

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
    console.log("Sidebar toggled to:", newState);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById("sidebar");
        const header = document.getElementById("header");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          header &&
          !header.contains(event.target)
        ) {
          setSidebarOpen(false);
          localStorage.setItem("sidebarOpen", JSON.stringify(false));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onMenuToggle={toggleSidebar}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <div className="flex h-screen">
        {/* Sidebar - hidden on mobile when closed, visible on desktop */}
        <div
          className={`${
            sidebarOpen ? "w-50" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
