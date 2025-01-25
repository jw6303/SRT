import React, { createContext, useContext, useState } from "react";

const LogContext = createContext();

export const useLogs = () => useContext(LogContext);

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const newLog = {
      message,
      type,
      logTime: Date.now(),
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};
