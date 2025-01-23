import React, { useEffect, useState } from "react";
import PillProgressBar from "./PillProgressBar"; // Import PillProgressBar
import "./ProgressBar.css";

const ProgressBar = ({
  current = 0,
  total = 50,
  min = 30,
  entryFee = 0.03,
  endTime,
  prizeDetails = {},
  raffleName = "",
  question = {},
  status = {},
}) => {
  const minThresholdValue = min * entryFee;
  const currentSalesValue = current * entryFee;
  const progressPercentage = Math.min((current / total) * 100, 100);

  const totalBars = 20;
  const filledBars = Math.round((progressPercentage / 100) * totalBars);
  const progressBar = `[${"=".repeat(filledBars)}${" ".repeat(totalBars - filledBars)}]`;

  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  const [timeRemaining, setTimeRemaining] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = new Date(endTime) - now;
      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
        const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
        const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
        setTimeRemaining(`${days}d : ${hours}:${minutes}:${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="cli-progress-container">
      <div className="cli-header">{"<RAFFLE STATUS />"}</div>

{/* Raffle Information */}
<div className="cli-raffle-info">
  <div className="cli-info-item">
    <strong className="cli-title">Name:</strong> <span className="cli-raffle-name">{raffleName || "N/A"}</span>
  </div>
  <div className="cli-info-item">
    <strong className="cli-title">Prize:</strong> <span className="cli-prize-title">{prizeDetails.title || "N/A"}</span>
  </div>
  <div className="cli-info-item">
    <strong className="cli-title">Prize Type:</strong>
    <span className="cli-prize-type">{prizeDetails.type === "onChain" ? "On-Chain" : "Off-Chain"}</span>
  </div>
  <div className="cli-info-item">
    <strong className="cli-title">Description:</strong> <span className="cli-prize-description">{prizeDetails.details || "N/A"}</span>
  </div>
  {prizeDetails.requiresShipping && (
    <div className="cli-info-item">
      <strong className="cli-title">Requires Shipping:</strong> <span className="cli-shipping-info">Yes</span>
    </div>
  )}
</div>

      {/* Quiz Details */}
      {question.text && (
        <div className="cli-quiz">
          <strong>Quiz Question:</strong> {question.text}
          <ul>
            {question.options.map((option, idx) => (
              <li key={idx}>{option}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Bar */}
      <div className="cli-progress-bar">
        {progressBar}
        {showCursor && "|"}
      </div>

      <div className="cli-progress-text">
        <span>{"[ Tickets Sold: "}{current}{" / "}{total}{" ]"}</span>
        <span>{"[ Progress: "}{Math.floor(progressPercentage)}{"% ]"}</span>
      </div>

{/* Financial Details */}
<div className="cli-financials">
  <div className="cli-financial-item">
    <strong className="cli-title cli-title-sales">Current Sales:</strong> 
    <span className="cli-financial-value">{currentSalesValue.toFixed(2)} SOL</span>
  </div>
  <div className="cli-financial-item">
    <strong className="cli-title cli-title-threshold">Min Threshold:</strong> 
    <span className="cli-financial-value">{minThresholdValue.toFixed(2)} SOL</span>
  </div>
  <div className="cli-financial-item">
    <strong className="cli-title cli-title-time">Time Remaining:</strong> 
    <span className="cli-financial-value">{timeRemaining}</span>
  </div>
</div>

{/* Status */}
<div className="cli-status">
  <div className="cli-status-item">
    <strong className="cli-title cli-title-status">Status:</strong> 
    <span className="cli-status-value">{status.current || "Unknown"}</span>
  </div>
  {current >= min ? (
    <div className="cli-feedback-success">
      <span className="cli-status-highlight">[STATUS]</span> Threshold Met - Finalization Pending
    </div>
  ) : (
    <div className="cli-feedback">
      <span className="cli-status-highlight">[STATUS]</span> Minimum Threshold Not Met - Refund Possible
    </div>
  )}
</div>
      {/* Pill Progress Bar (at the bottom) */}
      <div className="pill-progress-bar-wrapper">
        <PillProgressBar
          current={current}
          total={total}
          minThreshold={minThresholdValue}
          maxThreshold={total}
          labels={{
            start: "0 Participants",
            mid: `${minThresholdValue} SOL Min`,
            end: `${total} Max`,
          }}
          showTooltip={true}
          showLabels={true}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
