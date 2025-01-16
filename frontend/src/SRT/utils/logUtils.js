export const addLog = (logs, setLogs, type, message) => {
    const timestamp = new Date().toISOString(); // Always include a timestamp
    setLogs([...logs, { type, message, timestamp }]);
  };
  