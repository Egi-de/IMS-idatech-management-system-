import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuToggle={toggleSidebar} />
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
