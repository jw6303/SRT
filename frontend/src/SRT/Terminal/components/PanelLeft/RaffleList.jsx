import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import { useLogs } from "../../../../context/LogContext"; // Ensure correct path
import { FaClock, FaFilter, FaEthereum, FaListAlt } from "react-icons/fa";
import "../../Terminal.styles.css";
import RaffleItem from "./RaffleItem"; // Adjust the path if needed





const RaffleList = () => {
  // -------------------- STATE VARIABLES --------------------
  const { raffles, loadRaffleDetails } = useRaffle();
  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const ITEMS_PER_PAGE = 7; // Number of raffles per page
const [currentPage, setCurrentPage] = useState(1);

// Calculate total pages based on filtered raffles
const totalPages = Math.ceil(filteredRaffles.length / ITEMS_PER_PAGE);

// Get raffles for current page
const currentRaffles = filteredRaffles.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const goToPrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};


  // Access logging function from LogContext
  const { addLog } = useLogs();

  // -------------------- HELPER CONSTANTS --------------------
  const now = new Date();
  const priceTiers = {
    conservative: { min: 0.01, max: 0.03 },
    moderate: { min: 0.04, max: 0.1 },
    aggressive: { min: 0.1, max: Infinity },
  };

  // -------------------- HELPER FUNCTIONS --------------------
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
    return raffle.prizeDetails?.type === "onChain" ? "onChain" : "offChain";
  };

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

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleChangeFilter = (newFilter) => {
    setActiveFilter(newFilter);
    addLog(`User changed filter to: ${newFilter}`, "info");
  };

  const handleToggleDropdown = (dropdownName) => {
    const nextVal = openDropdown === dropdownName ? null : dropdownName;
    setOpenDropdown(nextVal);
    addLog(`User toggled '${dropdownName}' dropdown; now set to: ${nextVal}`, "info");
  };

  // -------------------- EFFECTS --------------------
  const [filterCounts, setFilterCounts] = useState(calculateFilterCounts());

  useEffect(() => {
    setFilterCounts(calculateFilterCounts());
  }, [raffles]);

  useEffect(() => {
    const applyFilter = () => {
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
    };

    applyFilter();
  }, [activeFilter, raffles]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".tab.dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // -------------------- RENDER --------------------
  return (
    <div className={`raffle-list ${isMobile ? "mobile" : ""}`}>
      {/* Mobile Drawer Toggle Button */}
      {isMobile && (
        <button className="drawer-toggle" onClick={toggleDrawer}>
          {isDrawerOpen ? "Close Raffle List" : "Open Raffle List"}
        </button>
      )}
  
      {/* ✅ Fully Scrollable Raffle List */}
      <div className="raffle-list-scroll-container">
        <ul className={`raffles ${isMobile ? (isDrawerOpen ? "visible" : "hidden") : ""}`}>
          {filteredRaffles.length === 0 ? (
            <p>No raffles match your criteria.</p>
          ) : (
            filteredRaffles.map((raffle) => (
              <RaffleItem key={raffle._id} raffle={raffle} loadRaffleDetails={loadRaffleDetails} addLog={addLog} />
            ))
          )}
        </ul>
      </div>
  
      {/* Tabs Section */}
      <div className={`tabs ${isMobile ? (isDrawerOpen ? "visible" : "hidden") : ""}`}>
        {/* All Raffles Tab */}
        <div className={`tab ${activeFilter === "all" ? "active" : ""}`} onClick={() => handleChangeFilter("all")}>
          <FaListAlt /> All Raffles ({filterCounts.all})
        </div>
  
        {/* New Raffles Tab */}
        <div className={`tab ${activeFilter === "new" ? "active" : ""}`} onClick={() => handleChangeFilter("new")}>
          <FaListAlt /> New Raffles ({filterCounts.new})
        </div>
  
        {/* Ending Soon Dropdown */}
        <div className={`tab dropdown ${openDropdown === "endingSoon" ? "open" : ""}`} onClick={() => handleToggleDropdown("endingSoon")}>
          <FaClock /> Ending Soon
          {openDropdown === "endingSoon" && (
            <div className="dropdown-menu">
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
          )}
        </div>
  
        {/* Price Tiers Dropdown */}
        <div className={`tab dropdown ${openDropdown === "price" ? "open" : ""}`} onClick={() => handleToggleDropdown("price")}>
          <FaFilter /> Risk Tolerance
          {openDropdown === "price" && (
            <div className="dropdown-menu">
              {Object.keys(priceTiers).map((tier) => (
                <div
                  key={tier}
                  className={activeFilter === `price:${tier}` ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeFilter(`price:${tier}`);
                  }}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} ({filterCounts.priceTiers[tier]})
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Chain Type Dropdown */}
        <div className={`tab dropdown ${openDropdown === "chain" ? "open" : ""}`} onClick={() => handleToggleDropdown("chain")}>
          <FaEthereum /> Chain Type
          {openDropdown === "chain" && (
            <div className="dropdown-menu">
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
          )}
        </div>
      </div>
    </div>
  );
  
  
  
};

export default RaffleList;
