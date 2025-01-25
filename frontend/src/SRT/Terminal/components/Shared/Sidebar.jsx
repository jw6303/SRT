import React, { useState } from "react";
import {
  FiPrinter,
  FiDollarSign,
  FiBell,
  FiFileText,
  FiDatabase,
  FiTwitter,
  FiGithub,
} from "react-icons/fi";
import "./Sidebar.styles.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Initially collapsed

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
<div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
  {/* CLI Prompt + Collapse Button */}
  <div className="cli-header">
    <span className="cli-prompt">userIDxxxx@PC:~Solana Raffle Terminal $</span>
    <span
      className={`cli-collapse ${isCollapsed ? "" : "active"}`}
      onClick={toggleSidebar}
    >
      {isCollapsed ? "/*} >" : "ACTIVE/*} >"}<span className={!isCollapsed ? "blinker" : ""}>_</span>
    </span>
  </div>

  {/* Navigation Items */}
      <ul className="sidebar-nav">
        <li className="nav-item">
          <FiPrinter className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Print</span>}
        </li>
        <li className="nav-item">
          <FiDollarSign className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Refund</span>}
        </li>
        <li className="nav-item">
          <FiBell className="nav-icon" />
          {!isCollapsed && <span className="nav-text">Alerts</span>}
        </li>
        {!isCollapsed && (
          <>
            <li className="nav-item">
              <FiFileText className="nav-icon" />
              <span className="nav-text">Logs</span>
            </li>
            <li className="nav-item">
              <FiDatabase className="nav-icon" />
              <span className="nav-text">Transaction History</span>
            </li>
          </>
        )}
      </ul>

      {/* Footer Section */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <>
            <ul className="footer-links">
              <li>
                <FiFileText className="footer-icon" />
                <a href="/privacy-policy" title="Privacy Policy">[Privacy]</a>
              </li>
              <li>
                <FiFileText className="footer-icon" />
                <a href="/terms-conditions" title="Terms & Conditions">[Terms]</a>
              </li>
            </ul>
            <div className="social-icons">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
              >
                <FiTwitter />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <FiGithub />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
