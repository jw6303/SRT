import React, { useState, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import { useRaffle } from "../../context/RaffleContext";
import CLIShippingForm from "../../../components/CLIShippingForm";
import "../../Terminal.styles.css";

const COOLDOWN_TIME = 10 * 1000;
const OWNERSHIP_CAP_PERCENTAGE = 0.1;

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


  // 🛠 FIX: Add State for Collapsible Sections
  const [collapsedSections, setCollapsedSections] = useState({
    prize: false,
    tickets: false,
    selection: false,
    question: false,
    shipping: false,
  });

  // 🛠 FIX: Function to Toggle Collapsed Sections
  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };


  const { prizeDetails = {}, participants = {}, question = {} } = selectedRaffle || {};
  const totalTickets = participants.max || 0;
  const ticketsSold = participants.ticketsSold || 0;
  const remainingTickets = totalTickets - ticketsSold;
  const chainType = determineChainType(selectedRaffle);

  const calculateUserMaxTickets = () => {
    const userTicketsOwned = userPurchases.get("currentUser") || 0;
    return Math.min(
      Math.floor(totalTickets * OWNERSHIP_CAP_PERCENTAGE) - userTicketsOwned,
      remainingTickets
    );
  };

  useEffect(() => {
    if (selectedRaffle) {
      setMaxTickets(calculateUserMaxTickets());
    }
  }, [selectedRaffle, ticketsSold, remainingTickets]);

  const handleTicketCountChange = (value) => {
    if (value > maxTickets || value > remainingTickets) {
      addLog("Invalid ticket count. Please select a valid amount.", "error");
      return;
    }
    setTicketCount(value);
    addLog(`You selected ${value} ticket(s).`, "info");
  };

  const handleShippingSubmit = (info) => {
    setShippingInfo(info);
    setIsShippingProvided(true);
    addLog("Shipping details provided successfully.", "success");
  };

  const handleBuyTicket = async () => {
    addLog(`Attempting to purchase tickets. Ticket Count: ${ticketCount}`, "info");

    if (chainType === "offChain" && !isShippingProvided) {
      addLog("Shipping information is required for off-chain prizes.", "error");
      setIsShippingCollapsed(false);
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
          <h3 className="section-title tree-key">Buy Tickets</h3>
  
          {/* Prize Section */}
          <div className="tree-branch">
            <h3
              className={`section-title ${collapsedSections["prize"] ? "collapsed" : ""}`}
              onClick={() => toggleCollapse("prize")}
            >
              Prize {collapsedSections["prize"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["prize"] && (
              <ul className="tree-sublist">
                <li><span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}</li>
                <li><span className="tree-key">Entry Fee:</span> {selectedRaffle.entryFee || "0"} SOL</li>
                <li><span className="tree-key">On-Chain Status:</span> {chainType === "onChain" ? "Yes" : "No"}</li>
              </ul>
            )}
          </div>
  
          {/* Ticket Availability Section */}
          <div className="tree-branch">
            <h3
              className={`section-title ${collapsedSections["tickets"] ? "collapsed" : ""}`}
              onClick={() => toggleCollapse("tickets")}
            >
              Ticket Availability {collapsedSections["tickets"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["tickets"] && (
              <ul className="tree-sublist">
                <li><span className="tree-key">Tickets Sold:</span> {ticketsSold}/{totalTickets}</li>
                <li><span className="tree-key">Tickets Remaining:</span> {remainingTickets}</li>
              </ul>
            )}
          </div>
  
          {/* Ticket Selection Section */}
          <div className="tree-branch">
            <h3
              className={`section-title ${collapsedSections["selection"] ? "collapsed" : ""}`}
              onClick={() => toggleCollapse("selection")}
            >
              Select Tickets {collapsedSections["selection"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["selection"] && (
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
            )}
          </div>
  
          {/* Question Section */}
          {question.text && (
            <div className="tree-branch">
              <h3
                className={`section-title ${collapsedSections["question"] ? "collapsed" : ""}`}
                onClick={() => toggleCollapse("question")}
              >
                Question {collapsedSections["question"] ? "▶" : "▼"}
              </h3>
              {!collapsedSections["question"] && (
                <ul className="tree-sublist">
                  <li><span className="tree-key">Question:</span> {question.text}</li>
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
                </ul>
              )}
            </div>
          )}
  
          {/* Shipping Section */}
          {prizeDetails.requiresShipping && (
            <div className="tree-branch">
              <h3
                className={`section-title ${collapsedSections["shipping"] ? "collapsed" : ""}`}
                onClick={() => toggleCollapse("shipping")}
              >
                Shipping Information {collapsedSections["shipping"] ? "▶" : "▼"}
              </h3>
              {!collapsedSections["shipping"] && (
                <CLIShippingForm onSubmit={handleShippingSubmit} />
              )}
            </div>
          )}
  
          {/* Buy Button */}
          <button
            onClick={handleBuyTicket}
            disabled={progress || (chainType === "offChain" && !isShippingProvided)}
            className="tree-toggle"
          >
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </>
      )}
    </div>
  );
    
};

export default BuyLogic;
