// Import Buffer polyfill first (must be the first import)
import "./bufferPolyfill";

// React and other imports
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Ensure critical styles are imported here
import App from "./App";
import WalletContextProvider from "./context/WalletContext"; // Context for Wallet functionality
import reportWebVitals from "./reportWebVitals";

// Ensure styles are loaded first
import "./index.css";

// Main render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Use Suspense for lazy-loaded components */}
    <React.Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <WalletContextProvider>
        <App />
      </WalletContextProvider>
    </React.Suspense>
  </React.StrictMode>
);

// Report web vitals
reportWebVitals();
