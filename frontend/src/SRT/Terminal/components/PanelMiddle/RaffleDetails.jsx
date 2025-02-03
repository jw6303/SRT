import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import "./RaffleDetails.styles.css";

// Helper function to format dates
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Countdown calculation helper
const calculateCountdown = (endDate) => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const timeLeft = end - now;

  if (timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

const RaffleDetails = () => {
  const { selectedRaffle, loading } = useRaffle();
  const [collapsedSections, setCollapsedSections] = useState({
    prize: false,
    media: true,
    participation: false,
    timing: false,
    status: false,
  });
  const [countdown, setCountdown] = useState(null);

  // Toggle collapse for sections
  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ✅ Determine Prize Type: "SOL" (onChain) or "Physical" (offChain)
  const getPrizeClass = () => {
    if (selectedRaffle?.isOnChain) return "prize-sol"; // SOL (on-chain)
    if (selectedRaffle?.prizeDetails?.type === "physical") return "prize-physical"; // Physical (off-chain)
    return "prize-unknown"; // Unknown type
  };

  useEffect(() => {
    if (selectedRaffle?.time?.end) {
      setCountdown(calculateCountdown(selectedRaffle.time.end));

      const timer = setInterval(() => {
        setCountdown(calculateCountdown(selectedRaffle.time.end));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedRaffle]);

  if (loading) return <p className="cli-text">Loading details...</p>;
  if (!selectedRaffle) return <p className="cli-text">Select a raffle to view details.</p>;

  const { raffleName, entryFee, prizeDetails = {}, participants = {}, time = {}, status = {}, isOnChain } = selectedRaffle;

  return (
    <div className="raffle-details">
      <h2 className="raffle-title">{raffleName}</h2>

      {/* Prize Section */}
      <div className="tree-branch">
        <h3 className={`section-title ${collapsedSections["prize"] ? "collapsed" : ""}`} onClick={() => toggleCollapse("prize")}>
          Prize {collapsedSections["prize"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["prize"] && (
          <ul>
            <li>
              <span className="tree-key">Prize:</span>{" "}
              <span className={`prize-title ${getPrizeClass()}`}>
                {prizeDetails.title || "N/A"}
              </span>
            </li>
            <li>
              <span className="tree-key">Entry Fee:</span> {entryFee} SOL
            </li>
            <li>
              <span className="tree-key">Details:</span> {prizeDetails.details || "N/A"}
            </li>
          </ul>
        )}
      </div>

      {/* Media Section */}
      {prizeDetails.imageUrl && (
        <div className="tree-branch">
          <h3 className={`section-title ${collapsedSections["media"] ? "collapsed" : ""}`} onClick={() => toggleCollapse("media")}>
            Media {collapsedSections["media"] ? "▶" : "▼"}
          </h3>
          {!collapsedSections["media"] && (
            <div className="raffle-media">
              <img src={prizeDetails.imageUrl} alt={prizeDetails.title || "Raffle Image"} className="raffle-image" />
            </div>
          )}
        </div>
      )}

      {/* Status Section */}
      <div className="tree-branch">
        <h3 className={`section-title ${collapsedSections["status"] ? "collapsed" : ""}`} onClick={() => toggleCollapse("status")}>
          Status {collapsedSections["status"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["status"] && (
          <ul>
            <li>
              <span className="tree-key">Current:</span> {status.current || "N/A"}
            </li>
            <li>
              <span className="tree-key">Fulfillment:</span> {status.fulfillment || "N/A"}
            </li>
          </ul>
        )}
      </div>

      {/* Raffle Type */}
      <p>
        <span className="tree-key">Raffle Type:</span> {isOnChain ? "On-Chain" : "Off-Chain"}
      </p>
    </div>
  );
};

export default RaffleDetails;
