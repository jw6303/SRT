import React from "react";
import { Link } from "react-router-dom";
import SyntaxRenderer from "./SyntaxRenderer";
import "./RaffleEntry.css";

const RaffleEntry = ({ raffle, countdown }) => {
  const currentTickets = raffle.participants?.ticketsSold || 0;
  const totalTickets = raffle.participants?.max || 1;
  const minThreshold = raffle.participants?.min || 0;

  // Calculate Initializing Progress (Percentage)
  const progressPercentage = Math.min(
    Math.floor((currentTickets / minThreshold) * 100),
    100
  );

  const statusTag =
    currentTickets >= minThreshold
      ? "[ACTIVE - Threshold Met]"
      : "[ACTIVE - Below Threshold]";

  return (
    <div className="raffle-entry">
      <SyntaxRenderer keyName="Raffle Name" value={raffle.raffleName || "N/A"} />
      <SyntaxRenderer keyName="Raffle ID" value={raffle.raffleId || "N/A"} />
      <SyntaxRenderer
        keyName="Entry Fee"
        value={`${raffle.entryFee} SOL`}
        valueType="money"
      />
      <SyntaxRenderer
        keyName="Participants"
        value={`${currentTickets} / ${totalTickets}`}
        valueType="number"
      />
      <SyntaxRenderer
        keyName="Initializing"
        value={`${progressPercentage}%`}
        valueType="number"
      />
      <SyntaxRenderer
        keyName="Countdown"
        value={countdown}
        valueType="countdown"
      />
      <SyntaxRenderer keyName="Status" value={statusTag} />
      <Link to={`/raffles/${raffle._id}`} className="details-link">
        > View Details
      </Link>
    </div>
  );
};

export default RaffleEntry;
