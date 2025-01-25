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

  const determineChainType = (raffle) => {
    // This assumes `prizeDetails.type` dictates the chain type:
    // `onChain` for blockchain prizes, and `physical` for off-chain.
    const prizeType = raffle.prizeDetails?.type;
    return prizeType === "onChain" ? "onChain" : "offChain";
  };

  // Calculate Filter Counts
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
        onChain: raffles.filter((raffle) => determineChainType(raffle) === "onChain").length,
        offChain: raffles.filter((raffle) => determineChainType(raffle) === "offChain").length,
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
        filtered = raffles.filter((raffle) => determineChainType(raffle) === type);
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
        <div
          className={`tab dropdown ${openDropdown === "endingSoon" ? "open" : ""}`}
          onClick={() => setOpenDropdown((prev) => (prev === "endingSoon" ? null : "endingSoon"))}
        >
          <FaClock /> Ending Soon
          {openDropdown === "endingSoon" && (
            <div className="dropdown-menu">
              {["1h", "6h", "24h", "72h"].map((timeFrame) => (
                <div
                  key={timeFrame}
                  className={activeFilter === `endingSoon:${timeFrame}` ? "active" : ""}
                  onClick={() => setActiveFilter(`endingSoon:${timeFrame}`)}
                >
                  {timeFrame.toUpperCase()} ({filterCounts.endingSoon[timeFrame]})
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`tab dropdown ${openDropdown === "price" ? "open" : ""}`}
          onClick={() => setOpenDropdown((prev) => (prev === "price" ? null : "price"))}
        >
          <FaFilter /> Risk Tolerance
          {openDropdown === "price" && (
            <div className="dropdown-menu">
              {Object.keys(priceTiers).map((tier) => (
                <div
                  key={tier}
                  className={activeFilter === `price:${tier}` ? "active" : ""}
                  onClick={() => setActiveFilter(`price:${tier}`)}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} (
                  {filterCounts.priceTiers[tier]})
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`tab dropdown ${openDropdown === "chain" ? "open" : ""}`}
          onClick={() => setOpenDropdown((prev) => (prev === "chain" ? null : "chain"))}
        >
          <FaEthereum /> Chain Type
          {openDropdown === "chain" && (
            <div className="dropdown-menu">
              <div
                className={activeFilter === "chain:onChain" ? "active" : ""}
                onClick={() => setActiveFilter("chain:onChain")}
              >
                On-Chain ({filterCounts.chainType.onChain})
              </div>
              <div
                className={activeFilter === "chain:offChain" ? "active" : ""}
                onClick={() => setActiveFilter("chain:offChain")}
              >
                Off-Chain ({filterCounts.chainType.offChain})
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
              onClick={() => loadRaffleDetails(raffle._id)}
            >
              <h3>{raffle.raffleName}</h3>
              <p>Entry Fee: {raffle.entryFee.toFixed(2)} SOL</p>
              <p>
                Tickets Sold: {raffle.participants?.ticketsSold} /{" "}
                {raffle.participants?.max}
              </p>
              <p>On-Chain Status: {determineChainType(raffle) === "onChain" ? "Yes" : "No"}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default RaffleList;
