// BuyLogic.jsx
import React, { useState, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import { useRaffle } from "../../context/RaffleContext";
import TicketSelection from "./TicketSelection";
import QuestionSection from "./QuestionSection";
import ShippingSection from "./ShippingSection";
import { COOLDOWN_TIME, REQUIRED_SHIPPING_FIELDS } from "./constants";
import { calculateUserMaxTickets, calculateRoi, validateShippingInfo } from "./helpers";
import "./BuyLogic.styles.css";

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
  const [shippingError, setShippingError] = useState("");

  const { question = {}, entryFee, participants = {}, prizeDetails = {} } = selectedRaffle || {};
  const totalTickets = participants.max || 0;
  const ticketsSold = participants.ticketsSold || 0;
  const remainingTickets = totalTickets - ticketsSold;

  useEffect(() => {
    if (selectedRaffle) {
      const userTicketsOwned = 0; // Mock value or replace with real user data
      setMaxTickets(calculateUserMaxTickets(totalTickets, userTicketsOwned, remainingTickets));
    }
  }, [selectedRaffle, ticketsSold, remainingTickets]);

  const handleTicketCountChange = (value) => {
    if (value > maxTickets || value > remainingTickets) {
      addLog(`Invalid ticket count. Adjusted to valid amount.`, "warning");
      setTicketCount(Math.min(maxTickets, remainingTickets));
    } else {
      setTicketCount(value);
    }
  };

  const handleShippingSubmit = (info) => {
    const missingFields = validateShippingInfo(info, REQUIRED_SHIPPING_FIELDS);
    if (missingFields) {
      setShippingError(`Missing fields: ${missingFields.join(", ")}`);
      setIsShippingValid(false);
      addLog(`Incomplete shipping details: ${missingFields.join(", ")}`, "error");
      return;
    }
    setShippingError("");
    setIsShippingValid(true);
    setShippingInfo(info);
    addLog(`Shipping details submitted.`, "success");
  };

  const handleBuyTicket = async () => {
    if (prizeDetails.requiresShipping && !isShippingValid) {
      setShippingError("Shipping details are required to purchase tickets.");
      setIsShippingCollapsed(false);
      addLog("Attempted to buy without shipping details.", "error");
      return;
    }

    // Further buy logic...
  };

  return (
    <div className="buy-logic">
      {!selectedRaffle ? (
        <p>Select a raffle to start buying tickets.</p>
      ) : (
        <>
          <h3>Buy Tickets</h3>
          <TicketSelection
            ticketCount={ticketCount}
            maxTickets={maxTickets}
            remainingTickets={remainingTickets}
            handleTicketCountChange={handleTicketCountChange}
            calculateRoi={calculateRoi}
            totalTickets={totalTickets}
            prizeValue={prizeDetails.amount}
          />
          <QuestionSection
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            addLog={addLog}
          />
          {prizeDetails.requiresShipping && (
            <ShippingSection
              isShippingCollapsed={isShippingCollapsed}
              setIsShippingCollapsed={setIsShippingCollapsed}
              shippingError={shippingError}
              handleShippingSubmit={handleShippingSubmit}
            />
          )}
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
