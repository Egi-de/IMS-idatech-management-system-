import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TrashBinProvider } from "./contexts/TrashBinContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <TrashBinProvider>
        <App />
      </TrashBinProvider>
    </ThemeProvider>
  </React.StrictMode>
);
