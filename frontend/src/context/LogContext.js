import React, { createContext, useContext, useState, useCallback } from "react";

// Create the LogContext
const LogContext = createContext();

// Max number of logs to retain
const MAX_LOGS = 100;

// LogProvider Component
export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  // Add a new log (with optional type, defaulting to "info")
  const addLog = useCallback((message, type = "info", additionalData = {}) => {
    setLogs((prevLogs) => {
      const newLog = {
        id: `${Date.now()}-${Math.random()}`, // Unique log ID
        message,
        type,
        logTime: Date.now(),
        ...additionalData, // Extend log entry with custom fields if needed
      };

      // Ensure logs don't exceed MAX_LOGS
      const updatedLogs = [...prevLogs, newLog];
      if (updatedLogs.length > MAX_LOGS) {
        updatedLogs.shift(); // Remove the oldest log
      }
      return updatedLogs;
    });
  }, []);

  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

// Custom hook for accessing the LogContext
export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
};
