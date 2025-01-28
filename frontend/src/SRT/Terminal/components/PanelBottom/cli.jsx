import React, { useState, useRef, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import "./cli.styles.css";

const CliPanel = ({ setIsCliCollapsed, isCliCollapsed }) => {
  const { logs } = useLogs();
  const logContainerRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(50); // Start at 50vh
  const isDragging = useRef(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 🖱 Start Dragging
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // ✨ Smooth Animation Function
  const animateHeight = (targetHeight) => {
    const startHeight = panelHeight;
    const duration = 200; // Animation time in ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Ensure max progress = 1

      // **Ease Out Effect** for smooth snap motion
      const easedProgress = 1 - Math.pow(1 - progress, 3); 
      const newHeight = startHeight + (targetHeight - startHeight) * easedProgress;
      
      setPanelHeight(newHeight);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // 🎯 Handle Mouse Move (Resize Panel)
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const newHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
    const clampedHeight = Math.max(25, Math.min(100, newHeight)); // Restrict between 25vh - 100vh

    setPanelHeight(clampedHeight);
  };

  // 🛑 Handle Mouse Release (Stop Resizing)
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // **Snap Effect** - It automatically adjusts to predefined sizes (25%, 50%, 100%)
    const snapPoints = [25, 50, 100]; // Possible snap positions
    const closestSnap = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - panelHeight) < Math.abs(prev - panelHeight) ? curr : prev
    );

    animateHeight(closestSnap);
  };

  return (
    <div
      className={`cli-panel ${isCliCollapsed ? "collapsed" : ""}`}
      style={{ height: `${isCliCollapsed ? "25vh" : `${panelHeight}vh`}` }}
    >
      {/* Draggable Grab Handle */}
      <div className="cli-toggle" onClick={() => setIsCliCollapsed(!isCliCollapsed)} onMouseDown={handleMouseDown} />

      {/* Logs Section */}
      {!isCliCollapsed && (
        <div className="cli-logs">
          <h3>Logs</h3>
          <div className="log-container" ref={logContainerRef}>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <span className="log-time">
                    [{new Date(log.logTime).toLocaleTimeString()}]
                  </span>{" "}
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            ) : (
              <p>No logs available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CliPanel;
