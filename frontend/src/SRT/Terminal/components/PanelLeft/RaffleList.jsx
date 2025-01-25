import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import { useLogs } from "../../../../context/LogContext"; 
import {
  FaListAlt,
  FaStar,
  FaCog,
  FaLink,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa"; // Additional icons
import "./RaffleList.styles.css";

const RaffleList = () => {
  const { raffles, loadRaffleDetails } = useRaffle();
  const { addLog } = useLogs();

  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  const now = new Date();

  // Price tiers
  const priceTiers = {
    conservative: { min: 0.01, max: 0.03 },
    moderate: { min: 0.04, max: 0.1 },
    aggressive: { min: 0.1, max: Infinity },
  };

  // Helper Functions
  const isNewRaffle = (raffle) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(raffle.time?.created) >= oneDayAgo;
  };

  const isEndingSoon = (raffle, hours) => {
    const timeFrame = hours * 60 * 60 * 1000;
    const endTime = new Date(raffle.time?.end);
    return endTime - now <= timeFrame && endTime - now > 0;
  };

  const isPriceTier = (raffle, tier) => {
    const { min, max } = priceTiers[tier];
    return raffle.entryFee >= min && raffle.entryFee <= max;
  };

  const determineChainType = (raffle) => {
    const prizeType = raffle.prizeDetails?.type;
    return prizeType === "onChain" ? "onChain" : "offChain";
  };

  // Calculate Filter Counts
  const calculateFilterCounts = () => {
    return {
      all: raffles.length,
      new: raffles.filter(isNewRaffle).length,
      endingSoon: {
        "1h": raffles.filter((r) => isEndingSoon(r, 1)).length,
        "6h": raffles.filter((r) => isEndingSoon(r, 6)).length,
        "24h": raffles.filter((r) => isEndingSoon(r, 24)).length,
        "72h": raffles.filter((r) => isEndingSoon(r, 72)).length,
      },
      priceTiers: {
        conservative: raffles.filter((r) => isPriceTier(r, "conservative")).length,
        moderate: raffles.filter((r) => isPriceTier(r, "moderate")).length,
        aggressive: raffles.filter((r) => isPriceTier(r, "aggressive")).length,
      },
      chainType: {
        onChain: raffles.filter((r) => determineChainType(r) === "onChain").length,
        offChain: raffles.filter((r) => determineChainType(r) === "offChain").length,
      },
    };
  };

  const [filterCounts, setFilterCounts] = useState(calculateFilterCounts());

  useEffect(() => {
    setFilterCounts(calculateFilterCounts());
  }, [raffles]);

  // Apply Filters
  useEffect(() => {
    let filtered = [];
    if (activeFilter === "all") {
      filtered = raffles;
    } else if (activeFilter === "new") {
      filtered = raffles.filter(isNewRaffle);
    } else if (activeFilter.startsWith("endingSoon")) {
      const hours = parseInt(activeFilter.split(":")[1], 10);
      filtered = raffles.filter((r) => isEndingSoon(r, hours));
    } else if (activeFilter.startsWith("price")) {
      const tier = activeFilter.split(":")[1];
      filtered = raffles.filter((r) => isPriceTier(r, tier));
    } else if (activeFilter.startsWith("chain")) {
      const type = activeFilter.split(":")[1];
      filtered = raffles.filter((r) => determineChainType(r) === type);
    }
    setFilteredRaffles(filtered);
  }, [activeFilter, raffles]);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".tab.dropdown")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter & Dropdown handlers
  const handleChangeFilter = (newFilter) => {
    setActiveFilter(newFilter);
    addLog(`User changed filter to: ${newFilter}`, "info");
  };

  const handleToggleDropdown = (dropdownName) => {
    const nextVal = openDropdown === dropdownName ? null : dropdownName;
    setOpenDropdown(nextVal);
    addLog(`User toggled '${dropdownName}' dropdown; now set to: ${nextVal}`, "info");
  };

  return (
    <div className="raffle-list">
      {/* A subtle heading using CLI-style terminology */}
      <h4 className="filters-heading">== TERMINAL FILTERS ==</h4>

      {/* Icon bar with tooltips + one "Advanced" dropdown */}
      <div className="tabs icon-bar">
        {/* All Raffles */}
        <div
          className={`tab icon-only ${activeFilter === "all" ? "active" : ""} tooltipped`}
          data-tooltip={`All Raffles (${filterCounts.all})`}
          onClick={() => handleChangeFilter("all")}
        >
          <FaListAlt />
        </div>

        {/* New Raffles */}
        <div
          className={`tab icon-only ${activeFilter === "new" ? "active" : ""} tooltipped`}
          data-tooltip={`New Raffles (${filterCounts.new})`}
          onClick={() => handleChangeFilter("new")}
        >
          <FaStar />
        </div>

        {/* ADVANCED: Ending Soon + Risk Tolerance + Chain Type in 1 dropdown */}
        <div
          className={`tab dropdown icon-only tooltipped ${openDropdown === "advanced" ? "open" : ""}`}
          data-tooltip="Advanced Filters"
          onClick={() => handleToggleDropdown("advanced")}
        >
          <FaCog />

          {/* The big combined dropdown */}
          {openDropdown === "advanced" && (
            <div className="dropdown-menu combined-filters">

              {/* ENDING SOON */}
              <div className="dropdown-section">
                <p className="dropdown-section-title">
                  <FaClock /> Ending Soon
                </p>
                {["1h", "6h", "24h", "72h"].map((timeFrame) => (
                  <div
                    key={timeFrame}
                    className={activeFilter === `endingSoon:${timeFrame}` ? "active" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeFilter(`endingSoon:${timeFrame}`);
                    }}
                  >
                    {timeFrame.toUpperCase()} ({filterCounts.endingSoon[timeFrame]})
                  </div>
                ))}
              </div>

              {/* RISK TOLERANCE */}
              <div className="dropdown-section">
                <p className="dropdown-section-title">
                  <FaShieldAlt /> Risk Tolerance
                </p>
                {Object.keys(priceTiers).map((tier) => (
                  <div
                    key={tier}
                    className={activeFilter === `price:${tier}` ? "active" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeFilter(`price:${tier}`);
                    }}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} (
                    {filterCounts.priceTiers[tier]})
                  </div>
                ))}
              </div>

              {/* CHAIN TYPE */}
              <div className="dropdown-section">
                <p className="dropdown-section-title">
                  <FaLink /> Chain Type
                </p>
                <div
                  className={activeFilter === "chain:onChain" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeFilter("chain:onChain");
                  }}
                >
                  On-Chain ({filterCounts.chainType.onChain})
                </div>
                <div
                  className={activeFilter === "chain:offChain" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeFilter("chain:offChain");
                  }}
                >
                  Off-Chain ({filterCounts.chainType.offChain})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtered Raffles List */}
      <ul className="raffles">
        {filteredRaffles.length === 0 ? (
          <p>No raffles match your criteria.</p>
        ) : (
          filteredRaffles.map((raffle) => (
            <li
              key={raffle._id}
              className="raffle-item"
              onClick={() => {
                addLog(
                  `User clicked on raffle: ${raffle.raffleName} (ID: ${raffle._id})`,
                  "info"
                );
                loadRaffleDetails(raffle._id);
              }}
            >
              <h3>{raffle.raffleName}</h3>
              <p>Entry Fee: {raffle.entryFee.toFixed(2)} SOL</p>
              <p>
                Tickets Sold: {raffle.participants?.ticketsSold} /{" "}
                {raffle.participants?.max}
              </p>
              <p>
                On-Chain Status:{" "}
                {determineChainType(raffle) === "onChain" ? "Yes" : "No"}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RaffleList;
