import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import { FaClock, FaFilter, FaEthereum, FaListAlt } from "react-icons/fa";
import "./RaffleList.styles.css";

const RaffleList = () => {
  const { raffles, loadRaffleDetails } = useRaffle();
  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  const now = new Date();

  // Price tiers for filtering
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

  // Filter Counts
  const calculateFilterCounts = () => {
    return {
      all: raffles.length,
      new: raffles.filter(isNewRaffle).length,
      endingSoon: {
        "1h": raffles.filter((raffle) => isEndingSoon(raffle, 1)).length,
        "6h": raffles.filter((raffle) => isEndingSoon(raffle, 6)).length,
        "24h": raffles.filter((raffle) => isEndingSoon(raffle, 24)).length,
        "72h": raffles.filter((raffle) => isEndingSoon(raffle, 72)).length,
      },
      priceTiers: {
        conservative: raffles.filter((raffle) => isPriceTier(raffle, "conservative")).length,
        moderate: raffles.filter((raffle) => isPriceTier(raffle, "moderate")).length,
        aggressive: raffles.filter((raffle) => isPriceTier(raffle, "aggressive")).length,
      },
      chainType: {
        onChain: raffles.filter((raffle) => raffle.status?.isOnChain).length,
        offChain: raffles.filter((raffle) => raffle.status?.isOnChain === false).length,
      },
    };
  };

  const [filterCounts, setFilterCounts] = useState(calculateFilterCounts());

  useEffect(() => {
    setFilterCounts(calculateFilterCounts());
  }, [raffles]);

  // Apply Filters
  useEffect(() => {
    const applyFilter = () => {
      let filtered = [];

      if (activeFilter === "all") {
        filtered = raffles;
      } else if (activeFilter === "new") {
        filtered = raffles.filter(isNewRaffle);
      } else if (activeFilter.startsWith("endingSoon")) {
        const hours = parseInt(activeFilter.split(":")[1], 10);
        filtered = raffles.filter((raffle) => isEndingSoon(raffle, hours));
      } else if (activeFilter.startsWith("price")) {
        const tier = activeFilter.split(":")[1];
        filtered = raffles.filter((raffle) => isPriceTier(raffle, tier));
      } else if (activeFilter.startsWith("chain")) {
        const type = activeFilter.split(":")[1];
        if (type === "onChain") filtered = raffles.filter((raffle) => raffle.status?.isOnChain);
        if (type === "offChain") filtered = raffles.filter((raffle) => raffle.status?.isOnChain === false);
      }

      setFilteredRaffles(filtered);
    };

    applyFilter();
  }, [activeFilter, raffles]);

  // Close Dropdown on Outside Click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".tab.dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="raffle-list">
      {/* Tabs Section */}
      <div className="tabs">
        <div
          className={`tab ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          <FaListAlt /> All Raffles ({filterCounts.all})
        </div>
        <div
          className={`tab ${activeFilter === "new" ? "active" : ""}`}
          onClick={() => setActiveFilter("new")}
        >
          <FaListAlt /> New Raffles ({filterCounts.new})
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
              onClick={() => loadRaffleDetails(raffle._id)}
            >
              <h3>{raffle.raffleName}</h3>
              <p>Entry Fee: {raffle.entryFee.toFixed(2)} SOL</p>
              <p>
                Tickets Sold: {raffle.participants?.ticketsSold} /{" "}
                {raffle.participants?.max}
              </p>
              <p>On-Chain Status: {raffle.status?.isOnChain ? "Yes" : "No"}</p>
              <p>Type: {raffle.prizeDetails?.type || "Unknown"}</p>
              <p>Fulfillment: {raffle.status?.fulfillment || "Unknown"}</p>
            </li>
          ))
        )}
      </ul>

      {/* Debug: Show All Raffle Details */}
      <div className="debug">
        <h4>Debug Mode: All Raffle Data</h4>
        <pre>{JSON.stringify(raffles, null, 2)}</pre>
      </div>
    </div>
  );
};

export default RaffleList;
