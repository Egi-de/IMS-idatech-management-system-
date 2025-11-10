import React, { forwardRef, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const Select = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      icon: Icon,
      className = "",
      required = false,
      disabled = false,
      options = [],
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState({});

    const baseClasses =
      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer";

    const selectClasses = error
      ? `${baseClasses} border-red-300 dark:border-red-600 focus:ring-red-500`
      : `${baseClasses} border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`;

    const selectedOption = options.find((option) => option.value === value) || {
      label: placeholder || "Select an option",
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    useEffect(() => {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 200; // Estimated max height
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top;
        if (spaceBelow >= dropdownHeight) {
          top = `${rect.bottom + 2}px`;
        } else if (spaceAbove >= dropdownHeight) {
          top = `${rect.top - dropdownHeight - 2}px`;
        } else {
          // If neither has enough space, prefer below but adjust height
          top = `${rect.bottom + 2}px`;
        }

        setDropdownStyle({
          position: "fixed",
          left: `${rect.left}px`,
          top,
          width: `${rect.width}px`,
          zIndex: 60,
        });
      }
    }, [isOpen]);

    const handleOptionClick = (optionValue) => {
      onChange({ target: { name: props.name, value: optionValue } });
      setIsOpen(false);
    };

    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    useEffect(() => {
      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
      }

      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [isOpen]);

    return (
      <div className="mb-4" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          <div
            ref={(node) => {
              selectRef.current = node;
              if (ref) ref(node);
            }}
            onClick={handleToggle}
            disabled={disabled}
            className={`${selectClasses} ${
              Icon ? "pl-10" : ""
            } ${className} pr-10 flex items-center justify-between`}
            {...props}
          >
            <span className={value ? "" : "text-gray-500"}>
              {selectedOption.label}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                style={dropdownStyle}
              >
                {options.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No options available
                  </div>
                ) : (
                  options.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleOptionClick(option.value)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        value === option.value
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {option.label}
                    </div>
                  ))
                )}
              </div>,
              document.body
            )}

          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
