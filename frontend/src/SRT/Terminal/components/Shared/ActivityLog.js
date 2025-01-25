import React from "react";
import PropTypes from "prop-types";
import "./ActivityLog.styles.css";

const ActivityLog = ({ logs }) => {
  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <div className="log-container">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <span className="log-time">[{new Date(log.logTime).toLocaleTimeString()}]</span>{" "}
              <span className="log-message">{log.message}</span>
            </div>
          ))
        ) : (
          <p>No activity logs available.</p>
        )}
      </div>
    </div>
  );
};

ActivityLog.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(["info", "success", "error", "warning"]).isRequired,
      message: PropTypes.string.isRequired,
      logTime: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ActivityLog;
