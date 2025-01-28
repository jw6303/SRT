import React, { useState, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import { useRaffle } from "../../context/RaffleContext";
import CLIShippingForm from "../../../components/CLIShippingForm";
import "./BuyLogic.styles.css";

const COOLDOWN_TIME = 10 * 1000; // Cooldown in milliseconds (10 seconds)
const OWNERSHIP_CAP_PERCENTAGE = 0.1; // Max 10% of tickets per user

// Track user purchases and cooldowns
const userPurchases = new Map();
const userCooldowns = new Map();

const determineChainType = (raffle) => {
  return raffle?.prizeDetails?.type === "onChain" ? "onChain" : "offChain";
};

const BuyLogic = () => {
  const { selectedRaffle } = useRaffle();
  const { addLog } = useLogs();

  const [ticketCount, setTicketCount] = useState(1);
  const [progress, setProgress] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shippingInfo, setShippingInfo] = useState({});
  const [isShippingCollapsed, setIsShippingCollapsed] = useState(true);
  const [maxTickets, setMaxTickets] = useState(1);
  const [isShippingProvided, setIsShippingProvided] = useState(false);

  const {
    prizeDetails = {},
    participants = {},
    question = {},
  } = selectedRaffle || {};

  const totalTickets = participants.max || 0;
  const ticketsSold = participants.ticketsSold || 0;
  const remainingTickets = totalTickets - ticketsSold;

  const chainType = determineChainType(selectedRaffle);

  // Dynamically calculate the maximum tickets the user can purchase
  const calculateUserMaxTickets = () => {
    const userTicketsOwned = userPurchases.get("currentUser") || 0;
    const userMaxTickets = Math.floor(totalTickets * OWNERSHIP_CAP_PERCENTAGE) - userTicketsOwned;

    return Math.min(userMaxTickets, remainingTickets);
  };

  useEffect(() => {
    if (selectedRaffle) {
      setMaxTickets(calculateUserMaxTickets());
    }
  }, [selectedRaffle, ticketsSold, remainingTickets]);

  // Handle ticket count change
  const handleTicketCountChange = (value) => {
    if (value > maxTickets || value > remainingTickets) {
      addLog("Invalid ticket count. Please select a valid amount.", "error");
      return;
    }
    setTicketCount(value);
    addLog(`You selected ${value} ticket(s).`, "info");
  };

  // Simplified shipping submission
  const handleShippingSubmit = (info) => {
    setShippingInfo(info);
    setIsShippingProvided(true);
    addLog("Shipping details provided successfully.", "success");
  };

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    addLog(`Attempting to purchase tickets. Ticket Count: ${ticketCount}`, "info");

    if (chainType === "offChain" && !isShippingProvided) {
      addLog("Shipping information is required for off-chain prizes.", "error");
      setIsShippingCollapsed(false); // Expand the form to prompt user
      return;
    }

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

    if (ticketCount < 1 || ticketCount > maxTickets || ticketCount > remainingTickets) {
      addLog("Invalid ticket count. Please select a valid amount.", "error");
      return;
    }

    setProgress(true);
    addLog(`Processing purchase of ${ticketCount} ticket(s)...`, "info");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      participants.ticketsSold += ticketCount;
      userPurchases.set("currentUser", (userPurchases.get("currentUser") || 0) + ticketCount);
      userCooldowns.set("currentUser", now);

      addLog(`${ticketCount} ticket(s) purchased successfully!`, "success");

      const remainingAfterPurchase = remainingTickets - ticketCount;
      addLog(
        `Tickets remaining: ${remainingAfterPurchase}/${totalTickets}.`,
        remainingAfterPurchase > 0 ? "info" : "warning"
      );
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
          <h3 className="section-title">Buy Tickets</h3>

          <div className="tree-branch">
            <p>
              <span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}
            </p>
            <p>
              <span className="tree-key">Entry Fee:</span> {selectedRaffle.entryFee || "0"} SOL
            </p>
            <p>
              <span className="tree-key">On-Chain Status:</span>{" "}
              {chainType === "onChain" ? "Yes" : "No"}
            </p>
            {prizeDetails.requiresShipping && (
              <p className="shipping-required">Shipping Required: Yes</p>
            )}
          </div>

          <div className="ticket-availability tree-branch">
            <p>
              <span className="tree-key">Tickets Sold:</span> {ticketsSold}/{totalTickets}
            </p>
            <p>
              <span className="tree-key">Tickets Remaining:</span> {remainingTickets}
            </p>
          </div>

          <div className="ticket-selection tree-branch">
            <p>
              <span className="tree-key">Select Tickets:</span>
            </p>
            <div className="ticket-buttons">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  className={`ticket-button ${ticketCount === i + 1 ? "selected" : ""}`}
                  onClick={() => handleTicketCountChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="bulk-button" onClick={() => handleTicketCountChange(maxTickets)}>
                Max
              </button>
            </div>
          </div>

          {question.text && (
            <div className="question-section tree-branch">
              <p>
                <span className="tree-key">Question:</span> {question.text}
                <span className="required-indicator"> *</span>
              </p>
              {question.options?.map((option, index) => (
                <label key={index} className="answer-option">
                  <input
                    type="radio"
                    name="question"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => {
                      setSelectedAnswer(option);
                      addLog(`Answer selected: ${option}`, "info");
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {prizeDetails.requiresShipping && (
            <div
              className={`shipping-section tree-branch ${!isShippingProvided ? "error-highlight" : ""}`}
            >
              <h4
                className="collapsible-header"
                onClick={() => setIsShippingCollapsed(!isShippingCollapsed)}
              >
                Shipping Information <span className="required-indicator"> *</span>{" "}
                {isShippingCollapsed ? "▶" : "▼"}
              </h4>
              {!isShippingCollapsed && (
                <CLIShippingForm onSubmit={handleShippingSubmit} />
              )}
            </div>
          )}

          <button
            onClick={handleBuyTicket}
            disabled={progress || (chainType === "offChain" && !isShippingProvided)}
          >
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </>
      )}
    </div>
  );
};

export default BuyLogic;
