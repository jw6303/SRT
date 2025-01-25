import React, { useState, useEffect, useRef } from "react";
import "./BuyLogic.styles.css";

const BuyLogic = () => {
  const [logs, setLogs] = useState([]); // Local state for logs
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [buying, setBuying] = useState(false);
  const logContainerRef = useRef(null); // Ref for log container

  const selectedRaffle = {
    question: {
      text: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
    },
    entryFee: 0.05,
    participants: {
      ticketsSold: 10,
      max: 100,
    },
  }; // Mock selected raffle for demonstration

  // Log management function
  const addLog = (type, message) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { type, message, logTime: new Date().toISOString() },
    ]);
  };

  // Scroll to the latest log entry
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!selectedRaffle) {
    addLog("warning", "No raffle selected. Waiting for user input.");
    return <p className="no-raffle">Select a raffle to start buying tickets.</p>;
  }

  const { question = {}, entryFee, participants = {} } = selectedRaffle;

  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
    addLog("info", `User selected answer: "${answer}"`);
  };

  const handleTicketCountChange = (count) => {
    setTicketCount(count);
    addLog("info", `User updated ticket count to: ${count}`);
  };

  const handlePurchase = async () => {
    if (!selectedAnswer) {
      addLog("error", "Ticket purchase failed: No answer selected.");
      return;
    }

    setBuying(true);
    addLog("info", `Processing purchase for ${ticketCount} ticket(s) with answer: "${selectedAnswer}"`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API delay
      addLog("success", `${ticketCount} ticket(s) purchased successfully!`);
    } catch (error) {
      addLog("error", `Purchase failed: ${error.message || "Unknown error"}`);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="buy-logic">
      {/* Log Box at the Top */}
      <div className="log-box" ref={logContainerRef}>
        <h3>Activity Logs</h3>
        <div className="log-container">
          {logs.length === 0 ? (
            <p>No logs available.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-time">
                  [{new Date(log.logTime).toLocaleTimeString()}]
                </span>{" "}
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Buy Logic */}
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
