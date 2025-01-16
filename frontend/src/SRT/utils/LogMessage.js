import React from "react";
import PropTypes from "prop-types";
import { getLogStyle } from "./logStyling"; // Import the external getLogStyle function

const LogMessage = ({ type, message, timestamp }) => {
  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleTimeString()
    : "No Timestamp";

  return (
    <p style={getLogStyle(type)}>
      <span>[{formattedTimestamp}]</span> {message}
    </p>
  );
};

LogMessage.propTypes = {
  type: PropTypes.oneOf(["info", "success", "error", "warning"]).isRequired,
  message: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
};

export default LogMessage;
