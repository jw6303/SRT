import React from "react";
import { FiMenu, FiHome, FiSettings, FiHelpCircle } from "react-icons/fi";
import "./Sidebar.styles.css";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Collapse Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FiMenu />
      </button>

      {/* Navigation Items */}
      <ul className="sidebar-nav">
        <li className="nav-item">
          <FiHome className="nav-icon" />
          {!isCollapsed && <span className="nav-text"></span>}
        </li>
        <li className="nav-item">
          <FiSettings className="nav-icon" />
          {!isCollapsed && <span className="nav-text"></span>}
        </li>
        <li className="nav-item">
          <FiHelpCircle className="nav-icon" />
          {!isCollapsed && <span className="nav-text"></span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
