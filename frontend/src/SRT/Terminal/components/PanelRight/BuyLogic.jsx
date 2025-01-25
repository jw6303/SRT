import React, { useState } from "react";
import { useRaffle } from "../../context/RaffleContext";
import { useLogs } from "../../../../context/LogContext"; // Adjust path as needed
import "./BuyLogic.styles.css";

const BuyLogic = () => {
  const { selectedRaffle } = useRaffle();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [buying, setBuying] = useState(false);

  // 1) Pull in addLog from the LogContext
  const { addLog } = useLogs();

  if (!selectedRaffle) {
    return <p className="no-raffle">Select a raffle to start buying tickets.</p>;
  }

  const { question = {}, entryFee, participants = {} } = selectedRaffle;

  // 2) When user selects an answer, log it
  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
    addLog(`User selected answer: ${answer}`, "info");
  };

  // 3) When ticket count changes, log it
  const handleTicketCountChange = (count) => {
    setTicketCount(count);
    addLog(`User changed ticket count to: ${count}`, "info");
  };

  // 4) Purchase logic with logging
  const handlePurchase = async () => {
    if (!selectedAnswer) {
      addLog("User attempted purchase without selecting an answer.", "warning");
      alert("Please select an answer before purchasing tickets.");
      return;
    }

    setBuying(true);
    try {
      addLog(`Purchasing ${ticketCount} tickets with answer: ${selectedAnswer}`, "info");
      // Mock API call
      console.log(`Purchasing ${ticketCount} tickets with answer: ${selectedAnswer}`);
      alert("Tickets purchased successfully!");
      addLog("Tickets purchased successfully!", "info");
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      addLog(`Error purchasing tickets: ${error.message}`, "error");
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
