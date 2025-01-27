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
  const [shippingInfo, setShippingInfo] = useState({});
  const [isShippingCollapsed, setIsShippingCollapsed] = useState(true);
  const [maxTickets, setMaxTickets] = useState(1);
  const [isShippingValid, setIsShippingValid] = useState(false);

  const logContainerRef = useRef(null);

  const { question = {}, entryFee, participants = {}, prizeDetails = {} } = selectedRaffle || {};
  const totalTickets = participants.max || 0;
  const ticketsSold = participants.ticketsSold || 0;
  const remainingTickets = totalTickets - ticketsSold;

  const ownershipPercentage = 0.1; // 10% ownership cap

  // Dynamically calculate the maximum tickets the user can purchase
  const calculateUserMaxTickets = () => {
    const userTicketsOwned = userPurchases.get("currentUser") || 0;
    const userMaxTickets = Math.floor(totalTickets * ownershipPercentage) - userTicketsOwned;

    return Math.min(userMaxTickets, remainingTickets);
  };

  // Calculate ROI and chance dynamically
  const calculateRoi = (ticketCount) => {
    if (!totalTickets || !prizeDetails.amount) return null;

    const prizeValue = prizeDetails.amount; // Prize pool value in SOL
    const chance = ticketCount / totalTickets; // Probability of winning
    const roiMultiplier = prizeValue * chance; // Estimated ROI

    return {
      chance: (chance * 100).toFixed(2), // Convert to percentage
      roi: roiMultiplier.toFixed(2), // Show ROI as SOL value
    };
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

  // Validate and update shipping information
  const handleShippingSubmit = (info) => {
    setShippingInfo(info);
    setIsShippingValid(true);
    addLog(
      `Shipping details captured: ${Object.entries(info)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}`,
      "success"
    );
  };

  // Handle buying tickets
  const handleBuyTicket = async () => {
    if (prizeDetails.requiresShipping && !isShippingValid) {
      addLog("Please submit shipping information before purchasing tickets.", "error");
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
          <h3 className="section-title">Buy Tickets</h3>

          {/* Prize Details */}
          <div className="tree-branch">
            <p>
              <span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}
            </p>
            <p>
              <span className="tree-key">Entry Fee:</span> {entryFee || "0"} SOL
            </p>
          </div>

          {/* Ticket Availability */}
          <div className="ticket-availability tree-branch">
            <p>
              <span className="tree-key">Tickets Sold:</span> {ticketsSold}/{totalTickets}
            </p>
            <p>
              <span className="tree-key">Tickets Remaining:</span> {remainingTickets}
            </p>
          </div>

          {/* Ticket Selection */}
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
              <button className="bulk-button" onClick={() => handleTicketCountChange(20)}>
                20x
              </button>
              <button className="bulk-button" onClick={() => handleTicketCountChange(50)}>
                50x
              </button>
              <button className="bulk-button" onClick={() => handleTicketCountChange(maxTickets)}>
                Max
              </button>
            </div>
            <div className="custom-input">
              <label>
                Enter Exact Amount:
                <input
                  type="number"
                  placeholder="e.g., 15"
                  value={ticketCount}
                  onChange={(e) => handleTicketCountChange(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="roi-info">
              {ticketCount > 0 && calculateRoi(ticketCount) && (
                <p>
                  ROI: {calculateRoi(ticketCount).roi} SOL | Winning Chance:{" "}
                  {calculateRoi(ticketCount).chance}%
                </p>
              )}
            </div>
          </div>

          {/* Question Section */}
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

          {/* Shipping Section */}
          {prizeDetails.requiresShipping && (
            <div className="shipping-section tree-branch">
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

          {/* Buy Tickets Button */}
          <button
            onClick={handleBuyTicket}
            disabled={progress || (prizeDetails.requiresShipping && !isShippingValid)}
          >
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </>
      )}
    </div>
  );
};

export default BuyLogic;
