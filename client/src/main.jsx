import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#fff",
            border: "1px solid rgba(255,60,47,0.3)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#39FF14", secondary: "#0A0A0A" } },
          error: { iconTheme: { primary: "#FF3C2F", secondary: "#0A0A0A" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
