import React from "react";
import PropTypes from "prop-types";
import "./PillProgressBar.css";

const PillProgressBar = ({
  current,
  total,
  minThreshold,
  maxThreshold,
  labels,
  showTooltip,
  showLabels,
}) => {
  const progressPercentage = Math.min((current / total) * 100, 100);
  const minThresholdPercentage = Math.min((minThreshold / total) * 100, 100);
  const maxThresholdPercentage = Math.min((maxThreshold / total) * 100, 100);

  return (
    <div className="cli-themed-progress-bar">
      {/* Progress Bar */}
      <div className="pill-progress-bar">
        <div className="pill-bar-background">
          <div
            className="pill-bar-progress"
            style={{ width: `${progressPercentage}%` }}
            title={showTooltip ? `${Math.round(progressPercentage)}% Complete` : ""}
          >
            <div className="liquid-fill"></div>
          </div>

          {/* Threshold Markers */}
          <div
            className="pill-bar-threshold min-threshold"
            style={{ left: `${minThresholdPercentage}%` }}
            title={`Minimum Threshold: ${minThreshold}`}
          ></div>
          <div
            className="pill-bar-threshold max-threshold"
            style={{ left: `${maxThresholdPercentage}%` }}
            title={`Maximum Threshold: ${maxThreshold}`}
          ></div>
        </div>
      </div>

      {/* CLI Themed Threshold Display */}
      <div className="cli-thresholds">
        <code>
          <span>MIN_THRESHOLD: {minThreshold} </span>
          <span>MAX_THRESHOLD: {maxThreshold} </span>
          <span>PROGRESS: {current} / {total}</span>
        </code>
      </div>

      {/* Optional Labels */}
      {showLabels && (
        <div className="progress-labels">
          <span className="start-label">{labels.start}</span>
          <span className="mid-label">{labels.mid}</span>
          <span className="end-label">{labels.end}</span>
        </div>
      )}
    </div>
  );
};

PillProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  minThreshold: PropTypes.number,
  maxThreshold: PropTypes.number,
  labels: PropTypes.shape({
    start: PropTypes.string,
    mid: PropTypes.string,
    end: PropTypes.string,
  }),
  showTooltip: PropTypes.bool,
  showLabels: PropTypes.bool,
};

PillProgressBar.defaultProps = {
  minThreshold: 0,
  maxThreshold: 100,
  labels: {
    start: "0 Participants",
    mid: "Threshold Reached",
    end: "Maximum Capacity",
  },
  showTooltip: true,
  showLabels: true,
};

export default PillProgressBar;
