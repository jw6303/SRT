import React, { useState } from "react";
import "./cli.styles.css";

const CliPanel = ({ logs }) => {
  const [height, setHeight] = useState(200); // Initial height
  const [isDragging, setIsDragging] = useState(false); // Dragging state
  const [input, setInput] = useState(""); // Input state for CLI commands
  
  // NEW: Track which tab is active: "logs" or "stats"
  const [activeTab, setActiveTab] = useState("logs");

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const startY = e.clientY;

    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY; // Calculate drag distance
      setHeight((prevHeight) =>
        Math.min(Math.max(prevHeight + deltaY, 100), window.innerHeight / 2) // Clamp height
      );
    };

    const stopDrag = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Placeholder for log generation
      console.log(`Command executed: ${input}`);
      setInput("");
    }
  };

  return (
    <div className="cli-panel" style={{ height: `${height}px` }}>
      {/* Drag Handle */}
      <div
        className={`drag-handle ${isDragging ? "active" : ""}`}
        onMouseDown={startDrag}
        title="Drag to resize"
      ></div>

      {/* NEW: Tab Navigation */}
      <div className="cli-tabs">
        <button
          className={activeTab === "logs" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("logs")}
        >
          Activity Logs
        </button>
        <button
          className={activeTab === "stats" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
      </div>

      {/* Conditionally show content based on activeTab */}
      {activeTab === "logs" && (
        <div className="cli-logs">
          <h3>Logs</h3>
          {logs && logs.length > 0 ? (
            <div className="log-container">
              {logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <span className="log-time">
                    [{new Date(log.logTime).toLocaleTimeString()}]
                  </span>{" "}
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No logs available.</p>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="cli-stats">
          <h3>Stats</h3>
          {/* Replace with any stats or data you want to display */}
          <p>Here you can display some statistics about your system, usage, or any other data.</p>
        </div>
      )}

      {/* Input Section */}
      <input
        type="text"
        className="cli-input"
        placeholder="Enter command..."
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default CliPanel;
