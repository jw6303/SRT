import React, { useState } from "react";
import {
  FiPrinter,
  FiDollarSign,
  FiBell,
  FiFileText,
  FiDatabase,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Sidebar.styles.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Initially collapsed

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header with Toggle Button */}
      <div className="cli-header">
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <FiChevronRight className="toggle-icon" />
          ) : (
            <FiChevronLeft className="toggle-icon" />
          )}
          <span className="tooltip">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
      </div>

      {/* Navigation Section */}
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
              <span className="nav-text">Transactions</span>
            </li>
          </>
        )}
      </ul>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <p className="footer-text">
          {!isCollapsed && "CLI Terminal Sidebar"}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
