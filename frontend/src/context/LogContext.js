// src/context/LogContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

// Create the LogContext
const LogContext = createContext();

// LogProvider Component
export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  // Memoized addLog to avoid unnecessary re-renders
  const addLog = useCallback((message, type = "info") => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { message, type, logTime: Date.now() },
    ]);
  }, []);

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};

// Custom hook for accessing the log context
export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
};
