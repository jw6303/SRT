// Import Buffer polyfill first (must be the first import)
import "./bufferPolyfill";

// React and other imports
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import WalletContextProvider from "./context/WalletContext"; // Change to default import
import reportWebVitals from "./reportWebVitals";

// Main render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);

// Report web vitals
reportWebVitals();