import React, { useState } from "react";
import Sidebar from "./components/Shared/Sidebar";
import Header from "./components/Shared/Header";
import FullWidthPanel from "./components/Shared/FullWidthPanel";
import PanelLeft from "./components/PanelLeft/RaffleList";
import PanelMiddle from "./components/PanelMiddle/RaffleDetails";
import PanelRight from "./components/PanelRight/BuyLogic";
import CliPanel from "./components/PanelBottom/cli";
import "./Terminal.styles.css";

const Terminal = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // For mobile drawer
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openDrawer = (raffle) => {
    setSelectedRaffle(raffle);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRaffle(null);
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
            <PanelLeft onSelectRaffle={openDrawer} />
          </div>
          <div className="panel-middle">
            <PanelMiddle selectedRaffle={selectedRaffle} />
          </div>
          <div className="panel-right">
            <PanelRight selectedRaffle={selectedRaffle} />
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="panel-bottom">
          <CliPanel />
        </div>

        {/* Mobile Drawer */}
        <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <button onClick={closeDrawer}>Close</button>
          </div>
          <div className="drawer-content">
            {selectedRaffle ? (
              <>
                <PanelMiddle selectedRaffle={selectedRaffle} />
                <PanelRight selectedRaffle={selectedRaffle} />
              </>
            ) : (
              <p>No raffle selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
