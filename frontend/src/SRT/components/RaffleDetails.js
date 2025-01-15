import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api"; // Updated API import
import "./RaffleDetails.css";

const RaffleDetails = () => {
  const { raffleId } = useParams(); // Dynamically get raffleId from URL
  const [raffle, setRaffle] = useState(null); // Store raffle details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedAnswer, setSelectedAnswer] = useState(""); // Track selected answer
  const [ticketPurchased, setTicketPurchased] = useState(false); // Track ticket purchase status

  // Fetch raffle details on component mount
  useEffect(() => {
    const loadRaffleDetails = async () => {
      if (!raffleId) {
        setError("Invalid raffle ID.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRaffleDetails(raffleId); // Fetch raffle by ID
        setRaffle(data);
      } catch (err) {
        console.error("[ERROR] Failed to fetch raffle details:", err);
        setError("Failed to fetch raffle details.");
      } finally {
        setLoading(false);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer before purchasing a ticket.");
      return;
    }

    try {
      const response = await purchaseTicket(raffleId, {
        participantId: "dynamic-participant-id", // Replace with actual participant ID
        name: "Dynamic User", // Replace with actual user name
        pubkey: "dynamic-public-key", // Replace with actual wallet public key
      });
      alert(response.message); // Display success message from backend
      setTicketPurchased(true); // Update ticket purchased state
    } catch (err) {
      console.error("[ERROR] Failed to purchase ticket:", err);
      alert("Failed to purchase ticket. Please try again.");
    }
  };

  if (loading) return <p>Loading raffle details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="raffle-details">
      <h1>Raffle Details</h1>
      <div className="raffle-overview">
        <p><strong>Raffle ID:</strong> {raffle.raffleId}</p>
        <p><strong>Prize Amount:</strong> {raffle.prizeAmount} SOL</p>
        <p><strong>Entry Fee:</strong> {raffle.entryFee} SOL</p>
        <p><strong>Start Time:</strong> {new Date(raffle.startTime).toLocaleString()}</p>
        <p><strong>End Time:</strong> {new Date(raffle.endTime).toLocaleString()}</p>
        <p><strong>Question:</strong> {raffle.question}</p>
      </div>

      {raffle.questionOptions && raffle.questionOptions.length > 0 && (
        <div className="raffle-question">
          <h3>Answer the Question</h3>
          {raffle.questionOptions.map((option, index) => (
            <label key={index} className="answer-option">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      <button
        onClick={handleBuyTicket}
        disabled={ticketPurchased} // Disable button if ticket is already purchased
        className={`buy-ticket-btn ${ticketPurchased ? "disabled" : ""}`}
      >
        {ticketPurchased ? "Ticket Purchased" : "Buy Ticket"}
      </button>

      <div className="navigation">
        <Link to="/">Back to Active Raffles</Link>
      </div>
    </div>
  );
};

export default RaffleDetails;
