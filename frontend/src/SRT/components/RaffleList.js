import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchActiveRaffles } from "../../api";
import ProgressBar from "./ProgressBar";
import "./RaffleList.css";

const RaffleList = () => {
  // State Variables
  const [raffles, setRaffles] = useState([]); // Cached raffles
  const [displayedRaffles, setDisplayedRaffles] = useState([]); // Raffles currently displayed
  const [endedRaffles, setEndedRaffles] = useState([]); // Ended raffles
  const [filterType, setFilterType] = useState("all"); // Filter: all, onChain, offChain
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEnded, setShowEnded] = useState(false); // Toggle ended raffles
  const [viewMode, setViewMode] = useState("grid"); // View mode: grid or list

  // Precomputed Counts
  const [holidayCount, setHolidayCount] = useState(0);
  const [luxuryCount, setLuxuryCount] = useState(0);
  const [conservativeCount, setConservativeCount] = useState(0);
  const [moderateCount, setModerateCount] = useState(0);
  const [aggressiveCount, setAggressiveCount] = useState(0);
  const [onChainCount, setOnChainCount] = useState(0);
  const [offChainCount, setOffChainCount] = useState(0);
  const [allCount, setAllCount] = useState(0); // All count

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Fetch Raffles
  const loadRaffles = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetchActiveRaffles();
      const now = new Date();
      const allRaffles = response?.raffles || [];
  
      // Separate active and ended raffles
      const activeRaffles = allRaffles.filter(
        (raffle) => new Date(raffle.time?.end) > now
      );
      const endedRaffles = allRaffles.filter(
        (raffle) => new Date(raffle.time?.end) <= now
      );
  
      // Categorize active raffles
      const onChain = activeRaffles.filter(
        (raffle) => raffle.prizeDetails?.type === "onChain"
      );
      const offChain = activeRaffles.filter(
        (raffle) => raffle.prizeDetails?.type === "physical"
      );
  
      // Filter raffles based on entry fee tiers
      const conservativeRaffles = activeRaffles.filter(
        (raffle) => parseFloat(raffle.entryFee) >= 0.01 && parseFloat(raffle.entryFee) <= 0.03
      );
      const moderateRaffles = activeRaffles.filter(
        (raffle) => parseFloat(raffle.entryFee) >= 0.04 && parseFloat(raffle.entryFee) <= 0.1
      );
      const aggressiveRaffles = activeRaffles.filter(
        (raffle) => parseFloat(raffle.entryFee) > 0.1
      );
  
      // Cache raffles and precompute counts
      setRaffles(activeRaffles);
      setDisplayedRaffles(activeRaffles); // Default: Show all active raffles
      setEndedRaffles(endedRaffles);
  
      // Update counts based on the filtered raffles
      setAllCount(activeRaffles.length);
      setOnChainCount(onChain.length);
      setOffChainCount(offChain.length);
      setConservativeCount(conservativeRaffles.length);
      setModerateCount(moderateRaffles.length);
      setAggressiveCount(aggressiveRaffles.length);
  
    } catch (err) {
      setError("Failed to fetch raffles. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Define price tiers based on risk tolerance
  const priceTiers = {
    conservative: { min: 0.01, max: 0.03, label: "Conservative" },
    moderate: { min: 0.04, max: 0.1, label: "Moderate" },
    aggressive: { min: 0.1, max: Infinity, label: "Aggressive" },
  };

  // Filter Handler
  const holidayKeywords = ["holiday", "vacation", "getaway", "trip"];
  const luxuryKeywords = ["luxury", "premium", "exclusive", "high-end"];

  const handleFilter = (type) => {
    setFilterType(type);

    let filteredRaffles = [];

    if (type === "onChain") {
      filteredRaffles = raffles.filter((raffle) => raffle.prizeDetails?.type === "onChain");
      setOnChainCount(filteredRaffles.length);
    } else if (type === "offChain") {
      filteredRaffles = raffles.filter((raffle) => raffle.prizeDetails?.type === "physical");
      setOffChainCount(filteredRaffles.length);
    } else if (type === "holiday") {
      filteredRaffles = raffles.filter((raffle) =>
        holidayKeywords.some((keyword) =>
          raffle.prizeDetails?.description?.toLowerCase()?.includes(keyword)
        )
      );
      setHolidayCount(filteredRaffles.length);
    } else if (type === "luxury") {
      filteredRaffles = raffles.filter((raffle) =>
        luxuryKeywords.some((keyword) =>
          raffle.prizeDetails?.description?.toLowerCase()?.includes(keyword)
        )
      );
      setLuxuryCount(filteredRaffles.length);
    } else if (type === "conservative") {
      filteredRaffles = raffles.filter(
        (raffle) => raffle.entryFee >= priceTiers.conservative.min && raffle.entryFee <= priceTiers.conservative.max
      );
      setConservativeCount(filteredRaffles.length);
    } else if (type === "moderate") {
      filteredRaffles = raffles.filter(
        (raffle) => raffle.entryFee >= priceTiers.moderate.min && raffle.entryFee <= priceTiers.moderate.max
      );
      setModerateCount(filteredRaffles.length);
    } else if (type === "aggressive") {
      filteredRaffles = raffles.filter(
        (raffle) => raffle.entryFee >= priceTiers.aggressive.min && raffle.entryFee <= priceTiers.aggressive.max
      );
      setAggressiveCount(filteredRaffles.length);
    } else {
      filteredRaffles = raffles;
      setAllCount(raffles.length);
    }

    // Update the raffles being displayed
    setDisplayedRaffles(filteredRaffles);
  };

  // Initial Fetch
  useEffect(() => {
    loadRaffles();
  }, []);

  // JSX Render
  if (loading) return <p className="terminal-loading">> Loading active raffles...</p>;
  if (error) return <p className="terminal-error">> {error}</p>;

  return (
    <div className="raffle-header-container">
      <h1 className="terminal-title">Active Raffles</h1>
      <p className="terminal-subtitle">Choose On-Chain or Off-Chain prizes below:</p>

      <div className="filter-row">
  <button
    className={`filter-btn ${filterType === "all" ? "active" : ""}`}
    onClick={() => handleFilter("all")}
  >
    ALL ({allCount})
  </button>
  <button
    className={`filter-btn ${filterType === "onChain" ? "active" : ""}`}
    onClick={() => handleFilter("onChain")}
  >
    ON-CHAIN ({onChainCount})
  </button>
  <button
    className={`filter-btn ${filterType === "offChain" ? "active" : ""}`}
    onClick={() => handleFilter("offChain")}
  >
    OFF-CHAIN ({offChainCount})
  </button>

  {/* Price Tiers Filter */}
  <button
    className={`filter-btn ${filterType === "conservative" ? "active" : ""}`}
    onClick={() => handleFilter("conservative")}
  >
    Conservative ({conservativeCount})
  </button>
  <button
    className={`filter-btn ${filterType === "moderate" ? "active" : ""}`}
    onClick={() => handleFilter("moderate")}
  >
    Moderate ({moderateCount})
  </button>
  <button
    className={`filter-btn ${filterType === "aggressive" ? "active" : ""}`}
    onClick={() => handleFilter("aggressive")}
  >
    Aggressive ({aggressiveCount})
  </button>
</div>

      {/* Active Raffles */}
      <div className={`raffle-grid ${viewMode}`}>
        {displayedRaffles.length > 0 ? (
          displayedRaffles.map((raffle) => {
            const endTime = new Date(raffle.time?.end);
            const now = new Date();
            const timeLeft = endTime - now;

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const ticketsSold = raffle.participants?.ticketsSold || 0;
            const maxTickets = raffle.participants?.max || 1;

            return (
              <div key={raffle._id} className="raffle-entry">
                {/* Prize Above Image */}
                <p className="raffle-prize">
                  Prize: <span className="syntax-cyan">{raffle.prizeDetails?.title || "N/A"}</span>
                </p>

                {/* Image */}
                <img
                  src={raffle.prizeDetails?.imageUrl || ""}
                  alt={raffle.prizeDetails?.title || "Raffle Image"}
                  className="raffle-image"
                />

                {/* Progress Bar */}
                <div className="progress-bars-container">
                  <div className="linear-progress-bar-wrapper">
                    <ProgressBar
                      current={ticketsSold}
                      total={maxTickets}
                      min={Math.ceil(maxTickets * 0.3)}
                      entryFee={raffle.entryFee || 0}
                      endTime={raffle.time?.end}
                      prizeDetails={raffle.prizeDetails || {}}
                      raffleName={raffle.raffleName || "N/A"}
                      status={raffle.status || {}}
                    />
                  </div>
                </div>

                {/* Details Link */}
                <Link to={`/raffles/${raffle._id}`} className="details-link">
                  View Details
                </Link>
              </div>
            );
          })
        ) : (
          <p>No active raffles found.</p>
        )}
      </div>

      {/* Ended Raffles */}
      {showEnded && (
        <div className="raffle-grid">
          {endedRaffles.length > 0 ? (
            endedRaffles.map((raffle) => (
              <div key={raffle._id} className="raffle-entry ended">
                <p>
                  Prize: <span className="syntax-amber">{raffle.prizeDetails?.title || "N/A"}</span>{" "}
                  <span className="syntax-red">[ENDED]</span>
                </p>
                <p>
                  Entry Fee: <span className="syntax-green">{raffle.entryFee || "N/A"} SOL</span>
                </p>
                <p>
                  Participants:{" "}
                  <span className="syntax-number">
                    {`${raffle.participants?.ticketsSold || 0} / ${raffle.participants?.max || 1}`}
                  </span>
                </p>
                <Link to={`/raffles/${raffle._id}`} className="details-link">
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <p>No ended raffles found.</p>
          )}
        </div>
      )}

      {/* Show Ended Toggle */}
      <div className="cli-divider">
        <span>> -----------------------------------------------</span>
        <div className="cli-divider-controls">
          <button
            className={`toggle-btn ${showEnded ? "active" : ""}`}
            onClick={() => setShowEnded((prev) => !prev)}
          >
            {showEnded ? "Hide Ended Raffles" : "Show Ended Raffles"}
          </button>
        </div>
        <span>> -----------------------------------------------</span>
      </div>
    </div>
  );
};

export default RaffleList;
