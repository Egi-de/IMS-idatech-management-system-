import React from "react";

const Card = ({
  children,
  className = "",
  hover = true,
  padding = "p-6",
  shadow = "shadow",
  onClick,
  ...props
}) => {
  const baseClasses = `bg-white dark:bg-gray-800 rounded-lg transition-all duration-200 ${padding} ${shadow}`;

  const hoverClasses = hover
    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "";

  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const CardFooter = ({ children, className = "" }) => (
  <div
    className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
