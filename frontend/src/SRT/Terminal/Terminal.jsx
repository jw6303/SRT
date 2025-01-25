import React, { useState } from "react";
import Sidebar from "./components/Shared/Sidebar";
import Header from "./components/Shared/Header";
import FullWidthPanel from "./components/Shared/FullWidthPanel";
import PanelLeft from "./components/PanelLeft/RaffleList";
import PanelMiddle from "./components/PanelMiddle/RaffleDetails";
import PanelRight from "./components/PanelRight/BuyLogic";
import CliPanel from "./components/PanelBottom/cli"; // Import the new CLI panel
import "./Terminal.styles.css";

const Terminal = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`terminal-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div className="terminal-main">
        {/* Header */}
        <Header />

        {/* Full-Width Panel */}
        <FullWidthPanel />

        {/* Main Content */}
        <div className="terminal-container">
          <div className="panel-left">
            <PanelLeft />
          </div>
          <div className="panel-middle">
            <PanelMiddle />
          </div>
          <div className="panel-right">
            <PanelRight />
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="panel-bottom">
          <CliPanel />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
