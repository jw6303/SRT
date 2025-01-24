import React from "react";
import { FiMenu } from "react-icons/fi";
import "./Header.styles.css";

const Header = ({ toggleSidebar, isCollapsed }) => {
  return (
    <div className="header">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FiMenu />
      </button>
      <h1 className="header-title">Raffle Terminal</h1>
      <div className="header-actions">
        <button className="header-btn">Settings</button>
        <button className="header-btn">Profile</button>
      </div>
    </div>
  );
};

export default Header;
