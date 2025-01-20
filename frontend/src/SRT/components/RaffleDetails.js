import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api";
import { getLogStyle } from "../utils/logStyling";
import "./RaffleDetails.css";

const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null); // Store raffle details
  const [logs, setLogs] = useState([]); // Store activity logs
  const [selectedAnswer, setSelectedAnswer] = useState(""); // Selected question answer
  const [ticketCount, setTicketCount] = useState(1); // Tickets to purchase
  const [maxTickets, setMaxTickets] = useState(1); // Maximum available tickets
  const [progress, setProgress] = useState(false); // Show progress during purchase
  const [countdown, setCountdown] = useState(""); // Countdown timer
  const logContainerRef = useRef(null); // For auto-scrolling logs

  // Fetch raffle details
  useEffect(() => {
    const loadRaffleDetails = async () => {
      setLogs((prev) => [
        ...prev,
        { type: "info", message: "Fetching raffle details...", logTime: new Date().toISOString() },
      ]);

      try {
        const data = await fetchRaffleDetails(raffleId);
        setRaffle(data.data); // Assuming the API returns the raffle under `data`

        const availableTickets = Math.max(
          0,
          (data.data.participants?.max || 0) - (data.data.participants?.ticketsSold || 0)
        );
        setMaxTickets(Math.min(availableTickets, 10));

        setLogs((prev) => [
          ...prev,
          { type: "success", message: "Raffle details loaded successfully.", logTime: new Date().toISOString() },
        ]);
      } catch (error) {
        setLogs((prev) => [
          ...prev,
          { type: "error", message: "Failed to fetch raffle details.", logTime: new Date().toISOString() },
        ]);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  // Countdown Timer
  useEffect(() => {
    if (raffle?.time?.end) {
      const timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date(raffle.time.end);
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
          clearInterval(timer);
          setCountdown("Raffle Ended");
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [raffle?.time?.end]);

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (!selectedAnswer) {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: "Please select an answer before purchasing tickets.", logTime: new Date().toISOString() },
      ]);
      return;
    }

    if (progress) {
      setLogs((prev) => [
        ...prev,
        { type: "info", message: "Ticket purchase is already in progress.", logTime: new Date().toISOString() },
      ]);
      return;
    }

    setProgress(true);
    setLogs((prev) => [
      ...prev,
      { type: "info", message: `Purchasing ${ticketCount} ticket(s)...`, logTime: new Date().toISOString() },
    ]);

    try {
      await purchaseTicket(raffleId, { participantId: "user123", ticketCount });
      setLogs((prev) => [
        ...prev,
        { type: "success", message: `${ticketCount} ticket(s) purchased successfully!`, logTime: new Date().toISOString() },
      ]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: "Failed to purchase tickets. Please try again.", logTime: new Date().toISOString() },
      ]);
    } finally {
      setProgress(false);
    }
  };

  // Auto-scroll log box
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="raffle-details-container">
      <div className="raffle-info">
        <h2>Raffle Details</h2>
        {raffle ? (
          <pre>
            > <span className="key">Raffle Name:</span> {raffle.raffleName || "N/A"}
            {"\n"}> <span className="key">Raffle ID:</span> {raffle.raffleId || "N/A"}
            {"\n"}> <span className="key">Entry Fee:</span> {raffle.entryFee || "N/A"} SOL
            {"\n"}> <span className="key">Prize Type:</span> {raffle.prizeDetails?.type || "N/A"}
            {"\n"}> <span className="key">Prize:</span> {raffle.prizeDetails?.title || "N/A"}
            {"\n"}> <span className="key">Participants:</span> {raffle.participants?.ticketsSold || 0} / {raffle.participants?.max || "N/A"}
            {"\n"}> <span className="key">Start Time:</span> {raffle.time?.start ? new Date(raffle.time.start).toLocaleString() : "N/A"}
            {"\n"}> <span className="key">End Time:</span> {raffle.time?.end ? new Date(raffle.time.end).toLocaleString() : "N/A"}
            {"\n"}> <span className="key">Countdown:</span> {countdown || "N/A"}
          </pre>
        ) : (
          <p>Loading raffle details...</p>
        )}
      </div>

      <div className="raffle-question">
        <h3>Question</h3>
        {raffle?.question?.text ? (
          <>
            <p className="question-text">{raffle.question.text}</p>
            <div className="answer-options">
              {raffle.question.options.map((option, index) => (
                <label key={index} className="answer-option">
                  <input
                    type="radio"
                    name="question"
                    value={option}
                    onChange={() => setSelectedAnswer(option)}
                    checked={selectedAnswer === option}
                  />
                  {option}
                </label>
              ))}
            </div>
            {selectedAnswer && (
              <p className="selected-answer">
                Selected Answer: <strong>{selectedAnswer}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="no-question">No question available for this raffle.</p>
        )}
      </div>

      <div className="raffle-purchase">
        <label>
          Tickets:
          <select value={ticketCount} onChange={(e) => setTicketCount(Number(e.target.value))}>
            {[...Array(maxTickets)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleBuyTicket} disabled={progress}>
          {progress ? "Processing..." : "Buy Tickets"}
        </button>
      </div>

      <div className="raffle-logs" ref={logContainerRef}>
        <h3>Activity Logs</h3>
        {logs.map((log, index) => (
          <div key={index} style={getLogStyle(log.type)}>
            [{new Date(log.logTime).toLocaleTimeString()}] {log.message}
          </div>
        ))}
      </div>

      <Link to="/">Back to Raffles</Link>
    </div>
  );
};

export default RaffleDetails;
