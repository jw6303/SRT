import React, { useEffect, useState } from "react";
import "./ProgressBar.css";

const ProgressBar = ({
  current = 0, // Current tickets sold
  total = 50, // Total tickets available (max)
  min = 30, // Minimum tickets required to avoid refund
  entryFee = 0.03, // Entry fee per ticket in SOL
  endTime, // Raffle end time (Date object)
}) => {
  // Calculations
  const minThresholdValue = min * entryFee; // Minimum SOL required
  const currentSalesValue = current * entryFee; // Current sales in SOL
  const progressPercentage = Math.min((current / total) * 100, 100); // Overall progress

  const totalBars = 20; // Number of segments in the bar
  const filledBars = Math.round((progressPercentage / 100) * totalBars);
  const progressBar = `[${"=".repeat(filledBars)}${" ".repeat(
    totalBars - filledBars
  )}]`;

  // Blinking cursor effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Time remaining calculation
  const [timeRemaining, setTimeRemaining] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(endTime) - now;
      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        clearInterval(interval);
      } else {
        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
        setTimeRemaining(`${hours}:${minutes}:${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="cli-progress-container">
      {/* Header */}
      <div className="cli-header">
        {"<"}RAFFLE STATUS{" />"}
      </div>

      {/* Progress Bar */}
      <div className="cli-progress-bar">
        {progressBar}
        {showCursor && "|"}
      </div>

      {/* Tickets and Progress Info */}
      <div className="cli-progress-text">
        <span>{"[ "}Tickets Sold: {current} / {total}{" ]"}</span>
        <span>{"[ "}Progress: {Math.floor(progressPercentage)}%{" ]"}</span>
      </div>

      {/* Financial Calculations */}
      <div className="cli-financials">
        <div>
          <strong>Current Sales:</strong> {currentSalesValue.toFixed(2)}{" "}
          <span className="sol-text">SOL</span>
        </div>
        <div>
          <strong>Min Threshold:</strong> {minThresholdValue.toFixed(2)}{" "}
          <span className="sol-text">SOL</span>
        </div>
        <div>
          <strong>Time Remaining:</strong> {timeRemaining}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="cli-feedback">
        {current >= min
          ? "[STATUS: Threshold Met - Finalization Pending]"
          : "[STATUS: Minimum Threshold Not Met - Refund Possible]"}
      </div>
    </div>
  );
};

export default ProgressBar;
