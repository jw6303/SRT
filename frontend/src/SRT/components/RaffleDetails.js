import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api";
import { getLogStyle } from "../utils/logStyling";
import "./RaffleDetails.css";

const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [logs, setLogs] = useState([]); // Store logs
  const [selectedAnswer, setSelectedAnswer] = useState(""); // Selected answer
  const [ticketCount, setTicketCount] = useState(1); // Ticket count
  const [maxTickets, setMaxTickets] = useState(1); // Max tickets allowed
  const [progress, setProgress] = useState(false); // Progress state
  const logContainerRef = useRef(null); // For scrolling logs

  // Fetch raffle details
  useEffect(() => {
    const loadRaffleDetails = async () => {
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          message: "Fetching raffle details...",
          logTime: new Date().toISOString(),
        },
      ]);
      try {
        const data = await fetchRaffleDetails(raffleId);
        setRaffle(data);

        const availableTickets = data.maxParticipants - (data.ticketsSold || 0);
        setMaxTickets(Math.min(availableTickets, 10));

        setLogs((prev) => [
          ...prev,
          {
            type: "success",
            message: "Raffle details loaded successfully.",
            logTime: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            message: "Failed to fetch raffle details.",
            logTime: new Date().toISOString(),
          },
        ]);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (!selectedAnswer) {
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: "Please select an answer before purchasing tickets.",
          logTime: new Date().toISOString(),
        },
      ]);
      return;
    }

    if (progress) {
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          message: "Ticket purchase is already in progress. Please wait.",
          logTime: new Date().toISOString(),
        },
      ]);
      return;
    }

    setProgress(true);
    setLogs((prev) => [
      ...prev,
      {
        type: "info",
        message: `Initiating purchase for ${ticketCount} ticket(s)...`,
        logTime: new Date().toISOString(),
      },
      {
        type: "info",
        message: "Verifying answer and ticket availability...",
        logTime: new Date().toISOString(),
      },
    ]);

    try {
      await purchaseTicket(raffleId, { participantId: "user123", ticketCount });
      setLogs((prev) => [
        ...prev,
        {
          type: "success",
          message: `${ticketCount} ticket(s) purchased successfully.`,
          logTime: new Date().toISOString(),
        },
        {
          type: "info",
          message: "Thank you for your participation!",
          logTime: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: "Ticket purchase failed. Please try again.",
          logTime: new Date().toISOString(),
        },
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
      <div className="raffle-columns">
        {/* Left Column: Raffle Info */}
        <div className="raffle-info">
          <pre>
            <span className="bold">Raffle Details</span>
            {"\n"}ID: <span className="bold">{raffle?.raffleId || "Loading..."}</span>
            {"\n"}Prize: <span className="bold">{raffle?.prizeAmount || "Loading..."} SOL</span>
            {"\n"}Entry Fee: <span className="bold">{raffle?.entryFee || "Loading..."} SOL</span>
            {"\n"}Tickets: <span className="bold">{raffle?.ticketsSold || 0}</span>{" "}
            / <span className="subtle">{raffle?.maxParticipants || 0}</span>
            {"\n"}Status: <span className="bold">{raffle?.status || "Loading..."}</span>
            {"\n"}On Chain:{" "}
            <span className="bold">{raffle?.isOnChain ? "Yes" : "No"}</span>
            {"\n"}Start Time:{" "}
            <span className="bold">
              {raffle?.startTime
                ? new Date(raffle.startTime).toLocaleString()
                : "Loading..."}
            </span>
            {"\n"}End Time:{" "}
            <span className="bold">
              {raffle?.endTime
                ? new Date(raffle.endTime).toLocaleString()
                : "Loading..."}
            </span>
          </pre>
          {raffle?.imageUrl && (
            <img src={raffle.imageUrl} alt="Raffle" className="raffle-image" />
          )}
          {/* Render prize details without typing effect */}
          <pre className="typed-text">{raffle?.prizeDetails || "Loading prize details..."}</pre>
        </div>

        {/* Right Column: Logs */}
        <div className="raffle-logs" ref={logContainerRef}>
          <h3 className="logs-title">Activity Logs</h3>
          {logs.map((log, index) => (
            <div
              key={`log-${log.type}-${log.logTime}-${index}`}
              style={getLogStyle(log.type)}
              className="log-message"
            >
              [{new Date(log.logTime).toLocaleTimeString()}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Question and Ticket Purchase */}
      <div className="raffle-question-purchase">
        <div>
          <pre>
            <span className="cli-keyword">Question</span>
            {"\n"}
            <span>{raffle?.question || "Loading question..."}</span>
          </pre>
          <div className="answer-options">
            {raffle?.questionOptions?.map((option, index) => (
              <label key={`question-option-${index}`}>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  onChange={() => setSelectedAnswer(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <pre>
            <span className="cli-keyword">Select Tickets</span>
          </pre>
          <select
            value={ticketCount}
            onChange={(e) => setTicketCount(Number(e.target.value))}
          >
            {[...Array(maxTickets)].map((_, i) => (
              <option key={`ticket-option-${raffleId}-${i}`} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <button onClick={handleBuyTicket} disabled={progress}>
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </div>
      </div>

      <Link to="/">Back to Raffles</Link>
    </div>
  );
};

export default RaffleDetails;
