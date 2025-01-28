import React from "react";
import "./BuyLogic.styles.css";

const UrgencyMessage = ({ remainingTickets }) => {
  if (remainingTickets > 20) return null;

  return (
    <p className="limited-tickets">
      {remainingTickets <= 5
        ? `Hurry! Only ${remainingTickets} tickets left!`
        : `Only ${remainingTickets} tickets remaining!`}
    </p>
  );
};

export default UrgencyMessage;
