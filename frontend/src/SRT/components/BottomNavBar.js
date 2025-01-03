import React from "react";
import "./BottomNavBar.css";

const BottomNavBar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bottom-nav-bar">
      {/* Screener Tab */}
      <button
        className={`nav-item ${activeTab === "Screener" ? "active" : ""}`}
        onClick={() => setActiveTab("Screener")}
      >
        <span className="nav-icon">🦉</span>
        <span className="nav-label">Screener</span>
      </button>

      {/* Chat Tab */}
      <button
        className={`nav-item ${activeTab === "Chat" ? "active" : ""}`}
        onClick={() => setActiveTab(activeTab === "Chat" ? "Screener" : "Chat")}
      >
        <span className="nav-icon">💬</span>
        <span className="nav-label">Chat</span>
      </button>

      {/* Watchlist Tab */}
      <button
        className={`nav-item ${activeTab === "Watchlist" ? "active" : ""}`}
        onClick={() => setActiveTab("Watchlist")}
      >
        <span className="nav-icon">⭐</span>
        <span className="nav-label">Watchlist</span>
      </button>

      {/* Alerts Tab */}
      <button
        className={`nav-item ${activeTab === "Alerts" ? "active" : ""}`}
        onClick={() => setActiveTab("Alerts")}
      >
        <span className="nav-icon">🔔</span>
        <span className="nav-label">Alerts</span>
      </button>

      {/* Menu Tab */}
      <button
        className={`nav-item ${activeTab === "Menu" ? "active" : ""}`}
        onClick={() => setActiveTab("Menu")}
      >
        <span className="nav-icon">☰</span>
        <span className="nav-label">Menu</span>
      </button>
    </div>
  );
};

export default BottomNavBar;
