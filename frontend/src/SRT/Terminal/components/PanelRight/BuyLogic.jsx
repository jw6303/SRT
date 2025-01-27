import React, { useState, useEffect, useRef } from "react";
import { useLogs } from "../../../../context/LogContext"; // Adjust as needed
import { useRaffle } from "../../context/RaffleContext";
import CLIShippingForm from "../../../components/CLIShippingForm";
import "./BuyLogic.styles.css";

const MAX_TICKETS_PER_PURCHASE = 10; // Max tickets allowed per transaction
const MAX_TICKETS_PER_USER = 20; // Max tickets allowed per user for the raffle
const COOLDOWN_TIME = 10 * 1000; // Cooldown in milliseconds (10 seconds)

// Track user purchases and cooldowns
const userPurchases = new Map();
const userCooldowns = new Map();

const BuyLogic = () => {
  const { selectedRaffle } = useRaffle();
  const { addLog } = useLogs(); // For logging system

  const [ticketCount, setTicketCount] = useState(1);
  const [progress, setProgress] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shippingInfo, setShippingInfo] = useState({});

  const logContainerRef = useRef(null); // For scrolling logs

  if (!selectedRaffle) {
    return <p className="no-raffle">Select a raffle to start buying tickets.</p>;
  }

  const { question = {}, entryFee, participants = {}, prizeDetails = {} } = selectedRaffle;
  const remainingTickets = (participants.max || 0) - (participants.ticketsSold || 0);

  // Incrementing logic: Handle ticket count changes
  const handleTicketCountChange = (value) => {
    const currentUserTickets = userPurchases.get("currentUser") || 0;

    // Prevent exceeding per-user or per-purchase limits
    if (value > MAX_TICKETS_PER_PURCHASE) {
      addLog(`You can only purchase up to ${MAX_TICKETS_PER_PURCHASE} tickets at a time.`, "warning");
      setTicketCount(MAX_TICKETS_PER_PURCHASE);
      return;
    }

    if (currentUserTickets + value > MAX_TICKETS_PER_USER) {
      const allowedTickets = MAX_TICKETS_PER_USER - currentUserTickets;
      addLog(`You can only purchase ${allowedTickets} more ticket(s) for this raffle.`, "warning");
      setTicketCount(allowedTickets);
      return;
    }

    // Ensure the ticket count doesn't exceed remaining tickets
    if (value > remainingTickets) {
      addLog(`Only ${remainingTickets} ticket(s) are available.`, "warning");
      setTicketCount(remainingTickets);
      return;
    }

    setTicketCount(value);
  };

  // Purchase tickets with validation and logging
  const handleBuyTicket = async () => {
    // Ensure an answer is selected if a question exists
    if (question.text && !selectedAnswer) {
      addLog("Please select an answer before purchasing tickets.", "error");
      return;
    }

    // Prevent spam purchases (cooldown)
    const lastPurchaseTime = userCooldowns.get("currentUser") || 0;
    const now = Date.now();

    if (now - lastPurchaseTime < COOLDOWN_TIME) {
      const waitTime = Math.ceil((COOLDOWN_TIME - (now - lastPurchaseTime)) / 1000);
      addLog(`You must wait ${waitTime} seconds before purchasing again.`, "warning");
      return;
    }

    setProgress(true);
    addLog(`Attempting to purchase ${ticketCount} ticket(s)...`, "info");

    try {
      // Simulate purchase delay (replace with API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addLog(`${ticketCount} ticket(s) purchased successfully!`, "success");

      // Update ticket state and logs
      participants.ticketsSold += ticketCount; // Simulated state update
      userPurchases.set("currentUser", (userPurchases.get("currentUser") || 0) + ticketCount);
      userCooldowns.set("currentUser", now); // Update cooldown timer
    } catch (error) {
      addLog("Failed to purchase tickets. Please try again.", "error");
    } finally {
      setProgress(false);
    }
  };

  return (
    <div className="buy-logic">
      <h3>Buy Tickets</h3>

      {/* Prize and Entry Fee */}
      <div className="tree-branch">
        <p>
          <span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}
        </p>
        <p>
          <span className="tree-key">Entry Fee:</span> {entryFee || "0"} SOL
        </p>
      </div>

      {/* Ticket Purchase Section */}
      <div className="ticket-purchase tree-branch">
        <label>
          <span className="tree-key">Number of Tickets:</span>
          <input
            type="number"
            value={ticketCount}
            min="1"
            max={Math.min(MAX_TICKETS_PER_PURCHASE, remainingTickets)}
            onChange={(e) => handleTicketCountChange(Number(e.target.value))}
          />
        </label>
        <p>
          <span className="tree-key">Tickets Sold:</span> {participants.ticketsSold}/{participants.max}
        </p>
      </div>

      {/* Question Section */}
      {question.text && (
        <div className="question-section tree-branch">
          <p>
            <span className="tree-key">Question:</span> {question.text}
          </p>
          {question.options?.map((option, index) => (
            <label key={index} className="answer-option">
              <input
                type="radio"
                name="question"
                value={option}
                checked={selectedAnswer === option}
                onChange={() => setSelectedAnswer(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {/* Shipping Section */}
      {prizeDetails.requiresShipping && (
        <div className="shipping-section tree-branch">
          <CLIShippingForm
            onSubmit={(info) => {
              setShippingInfo(info);
              addLog(
                `Shipping details captured: ${Object.entries(info)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}`,
                "success"
              );
            }}
          />
        </div>
      )}

      {/* Buy Tickets Button */}
      <button onClick={handleBuyTicket} disabled={progress}>
        {progress ? "Processing..." : "Buy Tickets"}
      </button>
    </div>
  );
};

export default BuyLogic;
