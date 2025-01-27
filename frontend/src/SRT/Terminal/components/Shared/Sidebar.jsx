import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiTrendingUp,
  FiPieChart,
  FiGift,
  FiX,
  FiVolume2,
  FiAward,
  FiSettings,
} from "react-icons/fi";
import "./Sidebar.styles.css";

const Sidebar = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Sidebar visibility
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapse/Expand logic

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const showSidebar = () => {
    setIsSidebarVisible(true);
  };

  const hideSidebar = () => {
    setIsSidebarVisible(false);
  };

  return (
    <div className={`sidebar-wrapper ${isSidebarVisible ? "visible" : ""}`}>
      {/* Draggable Handle */}
      {!isSidebarVisible && (
        <div className="drag-handle" onClick={showSidebar}>
          <FiChevronRight />
        </div>
      )}

      {/* Sidebar Content */}
      {isSidebarVisible && (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
          {/* Header with Toggle Button */}
          <div className="sidebar-header">
            <button className="toggle-btn" onClick={hideSidebar}>
              <FiChevronLeft />
            </button>
            {!isCollapsed && (
              <button className="collapse-btn" onClick={toggleSidebarCollapse}>
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              </button>
            )}
          </div>

          {/* Main Menu */}
          <div className="sidebar-section">
            <h4 className="section-title">Main Menu</h4>
            <ul className="sidebar-nav">
              <li className="nav-item">
                <FiGrid className="nav-icon" />
                {!isCollapsed && <span className="nav-text">Browse</span>}
              </li>
              <li className="nav-item">
                <FiTrendingUp className="nav-icon" />
                {!isCollapsed && <span className="nav-text">Trade</span>}
              </li>
              <li className="nav-item">
                <FiPieChart className="nav-icon" />
                {!isCollapsed && <span className="nav-text">Portfolio</span>}
              </li>
              <li className="nav-item">
                <FiGift className="nav-icon" />
                {!isCollapsed && (
                  <>
                    <span className="nav-text">Rewards</span>
                    <span className="badge">Live</span>
                  </>
                )}
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <ul className="footer-icons">
              <li>
                <FiX />
              </li>
              <li>
                <FiVolume2 />
              </li>
              <li>
                <FiAward />
              </li>
              <li>
                <FiSettings />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
