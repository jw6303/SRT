import React from "react";
import "./BuyLogic.styles.css";

const QuickSelectButtons = ({ ticketCount, predefinedOptions, onSelect }) => {
  return (
    <div className="quick-select-options">
      {predefinedOptions.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`quick-select-btn ${ticketCount === option ? "active" : ""}`}
        >
          {option} {option === 10 && <span className="popular-badge">Popular</span>}
        </button>
      ))}
    </div>
  );
};

export default QuickSelectButtons;
