import React, { useEffect, useRef, useState } from "react";
import { useLogs } from "../../../../context/LogContext";
import "../../Terminal.styles.css";

const CliPanel = ({ isCliCollapsed }) => {
  const { logs, addLog, clearLogs } = useLogs();
  const logContainerRef = useRef(null);
  const lastLogRef = useRef(null);
  const [command, setCommand] = useState("");

  // Auto-scroll when logs update
  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Handle command input
  const handleCommand = (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    addLog(`> ${command}`, "input");

    if (command.toLowerCase() === "clear") {
      clearLogs();
      addLog("Logs cleared.", "success");
    } else if (command.toLowerCase().startsWith("buy")) {
      addLog(`Processing ${command}...`, "info");
      setTimeout(() => addLog("✅ Purchase successful!", "success"), 2000);
    } else {
      addLog(`Unknown command: "${command}". Type 'help' for options.`, "error");
    }

    setCommand("");
  };

  return (
    <div className={`cli-panel ${isCliCollapsed ? "collapsed" : ""}`}>
      {!isCliCollapsed && (
        <>
          {/* CLI Logs */}
          <div className="cli-logs">
            <div className="log-container" ref={logContainerRef}>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`log-entry log-${log.type}`}
                    ref={index === logs.length - 1 ? lastLogRef : null}
                  >
                    <span className="log-time">
                      [{new Date(log.logTime).toLocaleTimeString()}]
                    </span>{" "}
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              ) : (
                <p className="no-logs">No logs available.</p>
              )}
            </div>
          </div>

          {/* CLI Input Field */}
          <form onSubmit={handleCommand} className="cli-input">
            <span className="cli-prompt">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a command..."
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
};

export default CliPanel;
