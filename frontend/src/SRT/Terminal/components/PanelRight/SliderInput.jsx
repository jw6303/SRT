import React from "react";
import "./BuyLogic.styles.css";

const SliderInput = ({ ticketCount, maxTickets, onSlide }) => {
  return (
    <div className="ticket-slider">
      <input
        type="range"
        min="1"
        max={maxTickets}
        value={ticketCount}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
      <p>
        {ticketCount} Ticket{ticketCount > 1 ? "s" : ""} — {ticketCount} SOL
      </p>
    </div>
  );
};

export default SliderInput;
