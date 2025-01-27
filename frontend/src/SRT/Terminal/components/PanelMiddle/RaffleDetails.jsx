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

  // State to manage collapsed sections
  const [collapsedSections, setCollapsedSections] = useState({});

  // State for countdown timer
  const [countdown, setCountdown] = useState(null);

  // Toggle collapse for sections
  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update countdown timer
  useEffect(() => {
    if (selectedRaffle?.time?.end) {
      setCountdown(calculateCountdown(selectedRaffle.time.end));

      const timer = setInterval(() => {
        setCountdown(calculateCountdown(selectedRaffle.time.end));
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount
    }
  }, [selectedRaffle]);

  if (loading) return <p className="cli-text">Loading details...</p>;
  if (!selectedRaffle) return <p className="cli-text">Select a raffle to view details.</p>;

  const {
    raffleName,
    entryFee,
    prizeDetails = {},
    participants = {},
    time = {},
    status = {},
    isOnChain,
  } = selectedRaffle;

  return (
    <div className="raffle-details">
      <h2 className="raffle-title">Raffle Details</h2>

      {/* Prize Section */}
      <div className="tree-branch">
        <h3
          className={`section-title ${collapsedSections["prize"] ? "collapsed" : ""}`}
          onClick={() => toggleCollapse("prize")}
        >
          Prize {collapsedSections["prize"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["prize"] && (
          <ul>
            <li>
              <span className="tree-key">Prize:</span> {prizeDetails.title}
            </li>
            <li>
              <span className="tree-key">Entry Fee:</span> {entryFee} SOL
            </li>
            <li>
              <span className="tree-key">Details:</span> {prizeDetails.details}
            </li>
          </ul>
        )}
      </div>

      {/* Participation Section */}
      <div className="tree-branch">
        <h3
          className={`section-title ${collapsedSections["participation"] ? "collapsed" : ""}`}
          onClick={() => toggleCollapse("participation")}
        >
          Participation {collapsedSections["participation"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["participation"] && (
          <ul>
            <li>
              <span className="tree-key">Max Tickets:</span> {participants.max}
            </li>
            <li>
              <span className="tree-key">Min Tickets:</span> {participants.min}
            </li>
            <li>
              <span className="tree-key">Tickets Sold:</span> {participants.ticketsSold}
            </li>
          </ul>
        )}
      </div>

      {/* Timing Section */}
      <div className="tree-branch">
        <h3
          className={`section-title ${collapsedSections["timing"] ? "collapsed" : ""}`}
          onClick={() => toggleCollapse("timing")}
        >
          Timing {collapsedSections["timing"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["timing"] && (
          <ul>
            <li>
              <span className="tree-key">Start:</span> {formatDate(time.start)}
            </li>
            <li>
              <span className="tree-key">End:</span> {formatDate(time.end)}
            </li>
            {countdown ? (
              <li>
                <span className="tree-key">Countdown:</span>
                <span className="countdown">
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                </span>
              </li>
            ) : (
              <li>
                <span className="tree-key">Countdown:</span> <span className="countdown">Expired</span>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Status Section */}
      <div className="tree-branch">
        <h3
          className={`section-title ${collapsedSections["status"] ? "collapsed" : ""}`}
          onClick={() => toggleCollapse("status")}
        >
          Status {collapsedSections["status"] ? "▶" : "▼"}
        </h3>
        {!collapsedSections["status"] && (
          <ul>
            <li>
              <span className="tree-key">Current:</span> {status.current}
            </li>
            <li>
              <span className="tree-key">Fulfillment:</span> {status.fulfillment}
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
