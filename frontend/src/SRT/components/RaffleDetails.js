import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api"; // Updated API import
import "./RaffleDetails.css";

const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketPurchased, setTicketPurchased] = useState(false);

  useEffect(() => {
    const loadRaffleDetails = async () => {
      if (!raffleId) {
        setLog((prev) => [...prev, ">> ERROR: Invalid raffle ID."]);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRaffleDetails(raffleId);
        setRaffle(data);
        setLog((prev) => [
          ...prev,
          `>> Loaded raffle details for ID: ${data.raffleId}`,
        ]);
      } catch (err) {
        setLog((prev) => [
          ...prev,
          ">> ERROR: Failed to fetch raffle details. Please try again.",
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  const handleBuyTicket = async () => {
    if (!selectedAnswer) {
      setLog((prev) => [
        ...prev,
        ">> ERROR: No answer selected. Please select an answer before buying a ticket.",
      ]);
      return;
    }

    try {
      const response = await purchaseTicket(raffleId, {
        participantId: "dynamic-participant-id",
        name: "Dynamic User",
        pubkey: "dynamic-public-key",
      });
      setLog((prev) => [...prev, `>> SUCCESS: ${response.message}`]);
      setTicketPurchased(true);
    } catch (err) {
      setLog((prev) => [
        ...prev,
        ">> ERROR: Failed to purchase ticket. Please try again.",
      ]);
    }
  };

  if (loading) return <p className="terminal-log">>> Loading raffle details...</p>;

  return (
    <div className="raffle-details">
      <h1 className="terminal-header">Raffle Details</h1>
      <div className="details-container">
        <div className="raffle-info">
          <p>> Raffle ID: {raffle.raffleId}</p>
          <p>> Prize Amount: {raffle.prizeAmount} SOL</p>
          <p>> Entry Fee: {raffle.entryFee} SOL</p>
          <p>> Start Time: {new Date(raffle.startTime).toLocaleString()}</p>
          <p>> End Time: {new Date(raffle.endTime).toLocaleString()}</p>
          <p>> Status: {raffle.status}</p>
          <p>> Created At: {new Date(raffle.createdAt).toLocaleString()}</p>
          <p>> On-Chain Status: {raffle.isOnChain ? "Yes" : "No"}</p>
          <p>> Prize Details: {raffle.prizeDetails}</p>
          <p>> Total Participants: {(raffle.participants || []).length}</p>
        </div>
        {raffle.imageUrl && (
          <div className="raffle-image-container">
            <img
              src={raffle.imageUrl}
              alt="Raffle"
              className="raffle-image"
            />
          </div>
        )}
      </div>
      <div className="terminal-log">
        <p>> Question: {raffle.question}</p>
        <div className="cli-options">
          {raffle &&
            raffle.questionOptions.map((option, index) => (
              <label key={index} className="cli-option">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
        </div>
      </div>
      <button
        onClick={handleBuyTicket}
        disabled={ticketPurchased}
        className={`buy-ticket-btn ${ticketPurchased ? "disabled" : ""}`}
      >
        {ticketPurchased ? ">> Ticket Purchased" : ">> Buy Ticket"}
      </button>
      <div className="navigation-links">
        <Link to="/" className="back-link">
          >> Back to Active Raffles
        </Link>
      </div>
      <div className="cli-log">
        {log.map((entry, index) => (
          <p
            key={index}
            className={entry.includes("ERROR") ? "error-log" : "success-log"}
          >
            {entry}
          </p>
        ))}
      </div>
    </div>
  );
};

export default RaffleDetails;
