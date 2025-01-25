
import React, { useState } from "react";
import { useRaffle } from "../../context/RaffleContext";
import "./BuyLogic.styles.css";

const BuyLogic = () => {
  const { selectedRaffle } = useRaffle(); // Access the selected raffle
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [buying, setBuying] = useState(false);

  if (!selectedRaffle) {
    return <p className="no-raffle">Select a raffle to start buying tickets.</p>;
  }

  const {
    question = {},
    entryFee,
    participants = {},
  } = selectedRaffle;

  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleTicketCountChange = (count) => {
    setTicketCount(count);
  };

  const handlePurchase = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer before purchasing tickets.");
      return;
    }

    setBuying(true);
    try {
      // Mock API call for ticket purchase
      console.log(`Purchasing ${ticketCount} tickets with answer: ${selectedAnswer}`);
      alert("Tickets purchased successfully!");
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      alert("Failed to purchase tickets.");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="buy-logic">
      <h3>Participate in the Raffle</h3>
      <p>Entry Fee: {entryFee} SOL per ticket</p>
      <p>Tickets Sold: {participants.ticketsSold}/{participants.max}</p>

      {/* Question Section */}
      <div className="question-section">
        <h4>{question.text || "No question available."}</h4>
        {question.options?.map((option, idx) => (
          <label key={idx} className="answer-option">
            <input
              type="radio"
              name="raffle-question"
              value={option}
              checked={selectedAnswer === option}
              onChange={() => handleAnswerChange(option)}
            />
            {option}
          </label>
        ))}
        {selectedAnswer && <p>Selected Answer: {selectedAnswer}</p>}
      </div>

      {/* Ticket Purchase Section */}
      <div className="ticket-purchase">
        <label>
          Number of Tickets:
          <input
            type="number"
            min="1"
            max={Math.max(1, participants.max - participants.ticketsSold)}
            value={ticketCount}
            onChange={(e) => handleTicketCountChange(Number(e.target.value))}
          />
        </label>
        <button onClick={handlePurchase} disabled={buying}>
          {buying ? "Processing..." : "Buy Tickets"}
        </button>
      </div>
    </div>
  );
};

export default BuyLogic;
