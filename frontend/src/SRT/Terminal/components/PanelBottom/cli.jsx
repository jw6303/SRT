// cli.js
import React, { useState } from "react";
import { useLogs } from "../../../../context/LogContext";
import "./cli.styles.css";

const CliPanel = () => {
  // Start it off slightly smaller (e.g., 150px)
  const [height, setHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [input, setInput] = useState("");

  // Logs from the LogContext
  const { logs } = useLogs();

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);

    // Record initial cursor position and current height
    const initialY = e.clientY;
    const initialHeight = height;

    // Mouse-move handler
    const onMouseMove = (moveEvt) => {
      // Calculate how much we've moved since drag began
      const offset = moveEvt.clientY - initialY;
      // We want to shrink if user drags up, grow if drags down => so subtract offset
      const newHeight = initialHeight - offset;

      // Clamp between 80px and half the viewport
      if (newHeight < 80) {
        setHeight(80);
      } else if (newHeight > window.innerHeight / 2) {
        setHeight(window.innerHeight / 2);
      } else {
        setHeight(newHeight);
      }
    };

    // Cleanup when mouse is released
    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    // Add event listeners for the drag
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleKeyDown = (e) => {
    // (Optional) handle commands if needed
    if (e.key === "Enter") {
      console.log(`Command executed: ${input}`);
      setInput("");
    }
  };

  return (
    <div className="cli-panel" style={{ height: `${height}px` }}>
      {/* Drag handle */}
      <div
        className={`drag-handle ${isDragging ? "active" : ""}`}
        onMouseDown={startDrag}
        title="Drag to resize"
      />

      {/* Logs Section */}
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

    </div>
  );
};

export default CliPanel;
