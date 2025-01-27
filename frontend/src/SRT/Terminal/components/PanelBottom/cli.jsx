import React, { useState, useRef, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import "./cli.styles.css";

const CliPanel = () => {
  const [height, setHeight] = useState(120);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollVisible, setIsScrollVisible] = useState(false); // New state for scroll visibility

  const { logs } = useLogs();

  const logContainerRef = useRef(null);

  // Automatically scroll to bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;

      // Check if scroll bar is necessary
      const { scrollHeight, clientHeight } = logContainerRef.current;
      setIsScrollVisible(scrollHeight > clientHeight);
    }
  }, [logs, height]); // Include height dependency for dynamic resize

  // Drag to resize logic
  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const initialY = e.clientY;
    const initialHeight = height;

    const onMouseMove = (moveEvt) => {
      const offset = moveEvt.clientY - initialY;
      const newHeight = initialHeight - offset;

      if (newHeight < 80) {
        setHeight(80);
      } else if (newHeight > window.innerHeight / 2) {
        setHeight(window.innerHeight / 2);
      } else {
        setHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="cli-panel" style={{ height: `${height}px` }}>
      {/* Drag Handle */}
      <div
        className={`drag-handle ${isDragging ? "active" : ""}`}
        onMouseDown={startDrag}
        title="Drag to resize"
      />

      {/* Logs Section */}
      <div className="cli-logs">
        <h3>Logs</h3>
        {logs && logs.length > 0 ? (
          <div
            className={`log-container ${isScrollVisible ? "scroll-visible" : ""}`}
            ref={logContainerRef}
          >
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
