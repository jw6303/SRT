import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api";
import { getLogStyle } from "../utils/logStyling";
import "./RaffleDetails.css";
import { initializeWebSocket } from "../utils/websocket";

const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [maxTickets, setMaxTickets] = useState(1);
  const [progress, setProgress] = useState(false);
  const [countdown, setCountdown] = useState(""); // Countdown timer
  const logContainerRef = useRef(null);

  // Calculate ticket progress
  const ticketProgress = raffle
    ? Math.min(
        Math.round((raffle.ticketsSold / raffle.maxParticipants) * 100),
        100
      )
    : 0;

  // Calculate threshold progress
  const thresholdProgress = raffle
    ? Math.min(
        Math.round((raffle.ticketsSold / raffle.minParticipants) * 100),
        100
      )
    : 0;

  // Calculate time remaining progress
  const timeRemainingProgress = raffle
    ? (() => {
        const now = new Date();
        const startTime = new Date(raffle.startTime);
        const endTime = new Date(raffle.endTime);
        const totalTime = endTime - startTime;
        const elapsedTime = now - startTime;
        return Math.max(0, Math.min(100, Math.round((elapsedTime / totalTime) * 100)));
      })()
    : 0;

  // Countdown Timer
  useEffect(() => {
    if (raffle?.endTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date(raffle.endTime);
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
  }, [raffle?.endTime]);

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
          {
            type: "highlight",
            message: `Prize Details: ${data.prizeDetails}`,
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

  // Initialize WebSocket
  useEffect(() => {
    const ws = initializeWebSocket();

    const handleNotification = (data) => {
      console.log("WebSocket notification:", data);
      // Update UI or add logs based on WebSocket notifications
      setLogs((prev) => [
        ...prev,
        {
          type: "info",
          message: `WebSocket Notification: ${data.message}`,
          logTime: new Date().toISOString(),
        },
      ]);
    };

    ws.on("notification", handleNotification);

    return () => {
      ws.off("notification", handleNotification);
      ws.close();
    };
  }, []);

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
            {"\n"}On Chain: <span className="bold">{raffle?.isOnChain ? "Yes" : "No"}</span>
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
          <div className="prize-details-section">
            <h3 className="prize-header">Prize Details</h3>
            <p className="prize-details">{raffle?.prizeDetails || "Loading prize details..."}</p>
          </div>
          {raffle?.imageUrl && (
            <img src={raffle.imageUrl} alt="Raffle" className="raffle-image" />
          )}
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

{/* Progress Bars */}
<div className="raffle-progress-bars">
        <div className="progress-bar">
          Tickets Sold: [<span className="progress">{'#'.repeat(ticketProgress / 10)}</span>
          {'-'.repeat(10 - ticketProgress / 10)}] {ticketProgress}%
        </div>
        <div className="progress-bar">
          Threshold Progress: [<span className="progress">{'#'.repeat(thresholdProgress / 10)}</span>
          {'-'.repeat(10 - thresholdProgress / 10)}] {thresholdProgress}%
        </div>
        <div className="countdown-timer">
        Winner Announced In: {countdown}
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
