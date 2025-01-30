import React, { useState } from "react";

const RaffleItem = ({ raffle, loadRaffleDetails, addLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="raffle-item tree-branch">
      {/* Clickable Prize Title (Expands Details) */}
      <h3
        className="tree-key prize-title"
        onClick={() => {
          setIsExpanded(!isExpanded);
          addLog(`User clicked on prize title: ${raffle.raffleName}`, "info");
        }}
      >
        {raffle.raffleName} {isExpanded ? "▼" : "▶"}
      </h3>

      {/* Expandable Details Section */}
      {isExpanded && (
        <ul className="tree-sublist">
          <li><span className="tree-key">Entry Fee:</span> {raffle.entryFee.toFixed(2)} SOL</li>
          <li><span className="tree-key">Tickets Sold:</span> {raffle.participants?.ticketsSold} / {raffle.participants?.max}</li>
          <li><span className="tree-key">On-Chain:</span> {raffle.prizeDetails?.type === "onChain" ? "Yes" : "No"}</li>
          <li>
            <button
              className="raffle-details-button"
              onClick={() => {
                addLog(`User opened raffle details for: ${raffle.raffleName}`, "info");
                loadRaffleDetails(raffle._id);
              }}
            >
              View Details
            </button>
          </li>
        </ul>
      )}
    </li>
  );
};

export default RaffleItem;
