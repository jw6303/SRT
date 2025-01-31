import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useLogs } from "../../../../context/LogContext";
import "./FilterMenu.css"; // Separate styling

const FilterMenu = ({ activeFilter, setActiveFilter }) => {
  const [openSections, setOpenSections] = useState({});
  const { addLog } = useLogs();

  const toggleMenu = () => document.body.classList.toggle("filter-menu-open");
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    addLog(`Filter applied: ${filter}`, "info");
    toggleMenu(); // Close the menu after selection
  };

  return (
    <div className="filter-menu">
      <div className="filter-menu-content">
        
        {/* Header */}
        <div className="filter-header">
          <h3>Filters</h3>
          <button onClick={toggleMenu}>
            <FaTimes />
          </button>
        </div>

        {/* Filters (Tree Structure) */}
        <div className="filter-tree">
          
          {/* Show */}
          <div className="tree-item">
            <span className="tree-key" onClick={() => toggleSection("show")}>
              {openSections["show"] ? "▼" : "▶"} Show
            </span>
            {openSections["show"] && (
              <div className="tree-options">
                <span className={`cli-option ${activeFilter === "all" ? "active" : ""}`} onClick={() => handleFilterChange("all")}>
                  All
                </span>
                <span className={`cli-option ${activeFilter === "new" ? "active" : ""}`} onClick={() => handleFilterChange("new")}>
                  New
                </span>
              </div>
            )}
          </div>

          {/* Ending Soon */}
          <div className="tree-item">
            <span className="tree-key" onClick={() => toggleSection("endingSoon")}>
              {openSections["endingSoon"] ? "▼" : "▶"} Ending Soon
            </span>
            {openSections["endingSoon"] && (
              <div className="tree-options">
                {["1h", "6h", "24h", "72h"].map((timeFrame) => (
                  <span key={timeFrame} className={`cli-option ${activeFilter === `endingSoon:${timeFrame}` ? "active" : ""}`} onClick={() => handleFilterChange(`endingSoon:${timeFrame}`)}>
                    {timeFrame.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Risk Level */}
          <div className="tree-item">
            <span className="tree-key" onClick={() => toggleSection("risk")}>
              {openSections["risk"] ? "▼" : "▶"} Risk Level
            </span>
            {openSections["risk"] && (
              <div className="tree-options">
                {["conservative", "moderate", "aggressive"].map((tier) => (
                  <span key={tier} className={`cli-option ${activeFilter === `price:${tier}` ? "active" : ""}`} onClick={() => handleFilterChange(`price:${tier}`)}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chain Type */}
          <div className="tree-item">
            <span className="tree-key" onClick={() => toggleSection("chain")}>
              {openSections["chain"] ? "▼" : "▶"} Chain Type
            </span>
            {openSections["chain"] && (
              <div className="tree-options">
                <span className={`cli-option ${activeFilter === "chain:onChain" ? "active" : ""}`} onClick={() => handleFilterChange("chain:onChain")}>
                  On-Chain
                </span>
                <span className={`cli-option ${activeFilter === "chain:offChain" ? "active" : ""}`} onClick={() => handleFilterChange("chain:offChain")}>
                  Off-Chain
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reset Filters */}
        <button className="reset-filters" onClick={() => handleFilterChange("all")}>
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
