import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, registerParticipant } from "../../api";
import "./ConfirmPurchase.css";

const ConfirmPurchase = () => {
  const { raffleId } = useParams(); // Extract raffleId from the URL
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  useEffect(() => {
    const loadRaffleDetails = async () => {
      try {
        const data = await fetchRaffleDetails(raffleId); // Fetch raffle details
        setRaffle(data);
      } catch (err) {
        setError("Failed to fetch raffle details.");
      } finally {
        setLoading(false);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  const handleSubmit = async () => {
    try {
      await registerParticipant(raffleId, {
        participantId: "user123", // Replace with actual user data
        name: "John Doe",
        answer: selectedAnswer,
      });
      alert("Answer submitted successfully!");
    } catch (err) {
      alert("Failed to submit answer.");
    }
  };

  if (loading) return <p>Loading raffle details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="confirm-purchase">
      <h1>Confirm Purchase</h1>
      <div className="raffle-info">
        <p><strong>Raffle ID:</strong> {raffle.raffleId}</p>
        <p><strong>Entry Fee:</strong> {raffle.entryFee} SOL</p>
        <p><strong>Prize:</strong> {raffle.prizeAmount} SOL</p>
        <p><strong>Question:</strong> {raffle.question}</p>
      </div>
      <div className="answer-options">
        <label>
          <input
            type="radio"
            name="answer"
            value="Option 1"
            onChange={(e) => setSelectedAnswer(e.target.value)}
          />
          Option 1
        </label>
        <label>
          <input
            type="radio"
            name="answer"
            value="Option 2"
            onChange={(e) => setSelectedAnswer(e.target.value)}
          />
          Option 2
        </label>
      </div>
      <button onClick={handleSubmit}>Submit Answer</button>
      <Link to="/" className="back-link">Back to Raffles</Link>
    </div>
  );
};

export default ConfirmPurchase;
