import React, { createContext, useState, useEffect } from "react";

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Use saved preference, or fall back to system preference
    const initialDarkMode = savedTheme ? JSON.parse(savedTheme) : prefersDark;

    setIsDarkMode(initialDarkMode);
    setIsInitialized(true);

    // Apply the initial theme to the document
    document.documentElement.classList.toggle("dark", initialDarkMode);
  }, []);

  // Save to localStorage and apply to document whenever dark mode changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode, isInitialized]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    isInitialized,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};
