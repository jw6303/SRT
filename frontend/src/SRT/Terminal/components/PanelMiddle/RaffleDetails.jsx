import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import "./RaffleDetails.styles.css";

// Enhanced Custom Hook for Typing Effect
const useTypewriter = (text, speed = 50, pauseAfterTyping = 500) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setDisplayedText(text); // Ensure full text is displayed
        }, pauseAfterTyping);
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [text, speed, pauseAfterTyping]);

  return displayedText;
};

const RaffleDetails = () => {
  const { selectedRaffle, loading } = useRaffle();

  // Placeholder text
  const raffleName = selectedRaffle?.raffleName || "Loading Raffle...";
  const title = selectedRaffle?.prizeDetails?.title || "Loading Prize...";
  const entryFee = selectedRaffle?.entryFee?.toFixed(2) || "0.00 SOL";
  const details = selectedRaffle?.prizeDetails?.details || "Loading details...";
  const imageUrl = selectedRaffle?.prizeDetails?.imageUrl || "placeholder.jpg";

  // Typing effects
  const typedRaffleName = useTypewriter(raffleName, 40);
  const typedPrizeTitle = useTypewriter(title, 50);
  const typedEntryFee = useTypewriter(`${entryFee} SOL`, 30);
  const typedDetails = useTypewriter(details, 25);

  if (loading) return <p className="cli-text">Loading details...</p>;
  if (!selectedRaffle) return <p className="cli-text">Select a raffle to view details.</p>;

  const { participants = {}, time = {}, status = {}, prizeDetails = {} } = selectedRaffle;

  const chainType = prizeDetails.type === "physical" ? "Off-Chain" : "On-Chain";

  return (
    <div className="raffle-details">
      {/* Left Side: Text Details */}
      <div className="details-left">
        <h2 className="raffle-title">{typedRaffleName}</h2>

        <div className="section">
          <h3 className="section-title">Prize</h3>
          <p className="prize-title">
            {typedPrizeTitle} <span className="prize-type">({prizeDetails.type || "N/A"})</span>
          </p>
          <div className="description-panel">
            <p className="prize-details">{typedDetails}</p>
          </div>
        </div>

        <div className="section">
          <h3 className="section-title">Entry Fee</h3>
          <p className="entry-fee">{typedEntryFee}</p>
        </div>

        <div className="section">
          <h3 className="section-title">Participants</h3>
          <p>
            Tickets Sold:{" "}
            <span className="highlight">
              {participants.ticketsSold || 0}/{participants.max || "N/A"}
            </span>
          </p>
          <p>
            Minimum Participants:{" "}
            <span className="highlight">{participants.min || "N/A"}</span>
          </p>
        </div>

        <div className="section">
          <h3 className="section-title">Timing</h3>
          <p>
            Start Time:{" "}
            <span className="time">
              {time.start ? new Date(time.start).toLocaleString() : "N/A"}
            </span>
          </p>
          <p>
            End Time:{" "}
            <span className="time">
              {time.end ? new Date(time.end).toLocaleString() : "N/A"}
            </span>
          </p>
        </div>

        <div className="section">
          <h3 className="section-title">Status</h3>
          <p>
            Current Status:{" "}
            <span className="status">{status.current || "Unknown"}</span>
          </p>
          <p>
            Fulfillment:{" "}
            <span className="fulfillment">{status.fulfillment || "Unknown"}</span>
          </p>
          <p>Chain Type: {chainType}</p>
        </div>
      </div>

      {/* Right Side: Prize Image */}
      <div className="details-right">
        <img
          src={imageUrl}
          alt={`Prize for ${raffleName}`}
          className="raffle-prize-image"
        />
      </div>
    </div>
  );
};

export default RaffleDetails;
