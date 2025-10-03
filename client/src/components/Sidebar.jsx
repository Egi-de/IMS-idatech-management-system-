import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Students",
      icon: AcademicCapIcon,
      current: location.pathname.startsWith("/students"),
      submenu: true,
      items: [
        { name: "Student Enrollment", href: "/students/enrollment" },
        { name: "Student Profile", href: "/students/profile" },
        { name: "Attendance & Participation", href: "/students/attendance" },
        { name: "Performance / Grades", href: "/students/performance" },
        { name: "Activities & Achievements", href: "/students/activities" },
        { name: "Feedback & Evaluation", href: "/students/feedback" },
        { name: "Status & Recommendations", href: "/students/status" },
      ],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: UsersIcon,
      current: location.pathname === "/employees",
    },
    {
      name: "Financial",
      href: "/financial",
      icon: CurrencyDollarIcon,
      current: location.pathname === "/financial",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: ChartBarIcon,
      current: location.pathname === "/reports",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: CogIcon,
      current: location.pathname === "/settings",
    },
  ];

  const isActive = (href) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      id="sidebar"
      className="h-full w-60 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20"
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                      ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {openSubmenus[item.name] ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>

                  {openSubmenus[item.name] && (
                    <div className="mt-2 ml-8 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`
                            block px-3 py-2 text-sm rounded-lg transition-colors duration-200
                            ${
                              location.pathname === subItem.href
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${
                      item.current
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
