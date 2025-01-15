import React from "react";
import "./BottomNavBar.css";

const BottomNavBar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: "Terminal", id: "Terminal" },
        { name: "Chat", id: "Chat" },
        { name: "Logs", id: "Logs" },
        { name: "Print", id: "print" },
        { name: "Alerts", id: "Alerts" },
        { name: "Refund", id: "Refund" },
        { name: "Settings", id: "Settings" },
    ];

    return (
        <div className="bottom-nav-bar">
            {tabs.map((tab) => (
                <span
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? "active-tab" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {`> ${tab.name}`}
                </span>
            ))}
        </div>
    );
};

export default BottomNavBar;
