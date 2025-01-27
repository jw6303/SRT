import React from "react";
import "./BuyLogic.styles.css";

const ProgressBar = ({ ticketsSold, maxTickets }) => {
  const percentage = Math.min((ticketsSold / maxTickets) * 100, 100);

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%` }}
      />
      <p>
        {ticketsSold}/{maxTickets} Tickets Sold
      </p>
    </div>
  );
};

export default ProgressBar;
