import React from "react";
import { useRaffle } from "../../context/RaffleContext";
import "./RaffleDetails.styles.css";

const RaffleDetails = () => {
  const { selectedRaffle, loading } = useRaffle();

  // Handle loading and empty state
  if (loading) return <p>Loading details...</p>;
  if (!selectedRaffle) return <p>Select a raffle to view details.</p>;

  // Destructure the raffle object
  const {
    raffleName = "N/A",
    prizeDetails = {},
    entryFee = 0,
    participants = {},
    time = {},
    status = {},
    question = {},
    analytics = {},
  } = selectedRaffle;

  const { title = "Unknown Prize", type = "N/A", details = "No details available.", imageUrl } =
    prizeDetails;

  // Determine chain type
  const chainType = prizeDetails.type === "physical" ? "Off-Chain" : "On-Chain";

  return (
    <div className="raffle-details">
      <h2>{raffleName}</h2>

      {/* Prize Information */}
      <p>
        Prize: {title} ({type})
      </p>
      <p>Details: {details}</p>

      {/* Entry Fee and Participants */}
      <p>Entry Fee: {entryFee.toFixed(2)} SOL</p>
      <p>
        Tickets Sold: {participants.ticketsSold || 0}/{participants.max || "N/A"}
      </p>
      <p>Minimum Participants Required: {participants.min || "N/A"}</p>

      {/* Analytics */}
      <p>Total Tickets: {analytics.totalTickets || "N/A"}</p>
      <p>Total Entries: {analytics.totalEntries || "N/A"}</p>
      <p>Total Refunds: {analytics.totalRefunds || "N/A"}</p>

      {/* Time Information */}
      <p>Start Time: {time.start ? new Date(time.start).toLocaleString() : "N/A"}</p>
      <p>End Time: {time.end ? new Date(time.end).toLocaleString() : "N/A"}</p>

      {/* Raffle Status */}
      <p>Status: {status.current || "Unknown"}</p>
      <p>Fulfillment: {status.fulfillment || "Unknown"}</p>

      {/* Chain Status */}
      <p>Chain Type: {chainType}</p>

      {/* Question Section */}
      <p>
        Question: {question.text || "N/A"}{" "}
        {question.options && (
          <ul>
            {question.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        )}
      </p>

      {/* Prize Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`Prize for ${raffleName}`}
          className="raffle-prize-image"
        />
      )}
    </div>
  );
};

export default RaffleDetails;
