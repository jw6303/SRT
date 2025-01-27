import React, { useState, useEffect, useRef } from "react";
import { useLogs } from "../../../../context/LogContext";
import { useRaffle } from "../../context/RaffleContext";
import CLIShippingForm from "../../../components/CLIShippingForm";
import "./BuyLogic.styles.css";

const COOLDOWN_TIME = 10 * 1000; // Cooldown in milliseconds (10 seconds)

// Track user purchases and cooldowns
const userPurchases = new Map();
const userCooldowns = new Map();

const BuyLogic = () => {
  const { selectedRaffle } = useRaffle();
  const { addLog } = useLogs();

  const [ticketCount, setTicketCount] = useState(1);
  const [progress, setProgress] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [maxTickets, setMaxTickets] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({});

  const logContainerRef = useRef(null);

  const { question = {}, entryFee, participants = {}, prizeDetails = {} } = selectedRaffle || {};
  const remainingTickets = (participants.max || 0) - (participants.ticketsSold || 0);

  const ownershipPercentage = 0.1; // 10% ownership cap

  /**
   * Dynamically calculate the maximum tickets the user can purchase.
   */
  const calculateUserMaxTickets = () => {
    const totalTickets = participants.max || 0;
    const userTicketsOwned = userPurchases.get("currentUser") || 0;
    const userMaxTickets = Math.floor(totalTickets * ownershipPercentage) - userTicketsOwned;

    return Math.min(userMaxTickets, remainingTickets);
  };

  useEffect(() => {
    if (selectedRaffle) {
      setMaxTickets(calculateUserMaxTickets());
    }
  }, [selectedRaffle, participants.ticketsSold, remainingTickets]);

  const handleTicketCountChange = (value) => {
    setTicketCount(value);
    addLog(`You selected ${value} ticket(s).`, "info");
  };

  const handleBuyTicket = async () => {
    if (question.text && !selectedAnswer) {
      addLog("Please select an answer before purchasing tickets.", "error");
      return;
    }

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addLog(`${ticketCount} ticket(s) purchased successfully!`, "success");

      participants.ticketsSold += ticketCount;
      userPurchases.set("currentUser", (userPurchases.get("currentUser") || 0) + ticketCount);
      userCooldowns.set("currentUser", now);
    } catch (error) {
      addLog("Failed to purchase tickets. Please try again.", "error");
    } finally {
      setProgress(false);
    }
  };

  return (
    <div className="buy-logic">
      {!selectedRaffle ? (
        <p className="no-raffle">Select a raffle to start buying tickets.</p>
      ) : (
        <>
          <h3>Buy Tickets</h3>

          <div className="tree-branch">
            <p>
              <span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}
            </p>
            <p>
              <span className="tree-key">Entry Fee:</span> {entryFee || "0"} SOL
            </p>
          </div>

          <div className="ticket-purchase tree-branch">
            <p>
              <span className="tree-key">Select how many tickets you would like:</span>
            </p>
            <div className="ticket-buttons">
              {[...Array(maxTickets)].map((_, i) => (
                <button
                  key={i}
                  className={`ticket-button ${ticketCount === i + 1 ? "selected" : ""}`}
                  onClick={() => handleTicketCountChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p>
              <span className="tree-key">Tickets Sold:</span> {participants.ticketsSold}/{participants.max}
            </p>
          </div>

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

          <button onClick={handleBuyTicket} disabled={progress}>
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </>
      )}
    </div>
  );
};

export default BuyLogic;
