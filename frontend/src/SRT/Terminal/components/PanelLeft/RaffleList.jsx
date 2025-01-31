import React, { useState, useEffect } from "react";
import { useRaffle } from "../../context/RaffleContext";
import { useLogs } from "../../../../context/LogContext"; // Ensure correct path
import { FaClock, FaBars, FaEthereum, FaCog, FaBolt } from "react-icons/fa";
import "../../Terminal.styles.css";
import RaffleItem from "./RaffleItem"; // Adjust the path if needed
import FilterMenu from "./FilterMenu";




const RaffleList = () => {
  // -------------------- STATE VARIABLES --------------------
  const { raffles, loadRaffleDetails } = useRaffle();
  const [filteredRaffles, setFilteredRaffles] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openSections, setOpenSections] = useState({}); // Stores which sections are open
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const ITEMS_PER_PAGE = 7; // Number of raffles per page
const [currentPage, setCurrentPage] = useState(1);

  // Toggle the filter menu
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen((prev) => !prev);
  };


   // Filtering logic
   const applyFilter = (filter) => {
    setActiveFilter(filter);

    if (filter === "all") {
      setFilteredRaffles(raffles);
    } else if (filter === "new") {
      setFilteredRaffles(raffles.filter((raffle) => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(raffle.time?.created) >= oneDayAgo;
      }));
    } else if (filter.startsWith("endingSoon")) {
      const hours = parseInt(filter.split(":")[1], 10);
      setFilteredRaffles(raffles.filter((raffle) => {
        const endTime = new Date(raffle.time?.end);
        return endTime - new Date() <= hours * 60 * 60 * 1000;
      }));
    }
    // Close menu after selection
    setIsFilterMenuOpen(false);
  };

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


  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
    <div className="raffle-list">
      
      {/* ✅ Filter Menu Toggle Button (Gear Icon) */}
      <div className="filter-toggle-container">
        <button 
          className={`filter-toggle ${isFilterMenuOpen ? "active" : ""}`} 
          onClick={() => {
            toggleFilterMenu();
            addLog("Toggled filter menu", "info");
          }}
        >
          <FaCog />
        </button>
      </div>
  
      {/* ✅ Pop-out Filter Menu */}
      <div className={`filter-menu ${isFilterMenuOpen ? "open" : ""}`}>
        <h3>Filter Raffles</h3>
        <ul className="filter-options">
          
          {/* Show Section */}
          <li className={`filter-item ${activeFilter === "all" ? "active" : ""}`} 
              onClick={() => {
                applyFilter("all");
                addLog("Applied 'Show All' filter", "info");
              }}>
            <FaBars /> Show All ({filterCounts.all})
          </li>
          <li className={`filter-item ${activeFilter === "new" ? "active" : ""}`} 
              onClick={() => {
                applyFilter("new");
                addLog("Applied 'New' filter", "info");
              }}>
            New ({filterCounts.new})
          </li>
  
          {/* Ending Soon Section */}
          <li className="filter-title">Ending Soon</li>
          {["1h", "6h", "24h", "72h"].map((timeFrame) => (
            <li key={timeFrame} className={`filter-item ${activeFilter === `endingSoon:${timeFrame}` ? "active" : ""}`} 
                onClick={() => {
                  applyFilter(`endingSoon:${timeFrame}`);
                  addLog(`Applied 'Ending Soon' filter (${timeFrame})`, "info");
                }}>
              <FaClock /> {timeFrame.toUpperCase()} ({filterCounts.endingSoon[timeFrame]})
            </li>
          ))}
  
          {/* Risk Section */}
          <li className="filter-title">Risk</li>
          {Object.keys(priceTiers).map((tier) => (
            <li key={tier} className={`filter-item ${activeFilter === `price:${tier}` ? "active" : ""}`} 
                onClick={() => {
                  applyFilter(`price:${tier}`);
                  addLog(`Applied 'Risk' filter (${tier})`, "info");
                }}>
              <FaBolt /> {tier.charAt(0).toUpperCase() + tier.slice(1)} ({filterCounts.priceTiers[tier]})
            </li>
          ))}
  
          {/* Chain Type Section */}
          <li className="filter-title">Chain Type</li>
          <li className={`filter-item ${activeFilter === "chain:onChain" ? "active" : ""}`} 
              onClick={() => {
                applyFilter("chain:onChain");
                addLog("Applied 'On-Chain' filter", "info");
              }}>
            <FaEthereum /> On-Chain ({filterCounts.chainType.onChain})
          </li>
          <li className={`filter-item ${activeFilter === "chain:offChain" ? "active" : ""}`} 
              onClick={() => {
                applyFilter("chain:offChain");
                addLog("Applied 'Off-Chain' filter", "info");
              }}>
            <FaEthereum /> Off-Chain ({filterCounts.chainType.offChain})
          </li>
        </ul>
      </div>
  
      {/* ✅ Scrollable Raffle List */}
      <div className="raffle-list-scroll-container">
        <ul className="raffles">
          {filteredRaffles.length === 0 ? (
            <p>No raffles match your criteria.</p>
          ) : (
            filteredRaffles.map((raffle) => (
              <RaffleItem 
                key={raffle._id} 
                raffle={raffle} 
                loadRaffleDetails={loadRaffleDetails} 
                addLog={addLog} // ✅ Ensure logging works inside RaffleItem
              />
            ))
          )}
        </ul>
      </div>
  
    </div>
  );
  
  

  };  

export default RaffleList;
