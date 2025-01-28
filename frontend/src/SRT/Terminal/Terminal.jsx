import React, { useState } from "react";
import Header from "./components/Shared/Header";
import FullWidthPanel from "./components/Shared/FullWidthPanel";
import PanelLeft from "./components/PanelLeft/RaffleList";
import PanelMiddle from "./components/PanelMiddle/RaffleDetails";
import PanelRight from "./components/PanelRight/BuyLogic";
import CliPanel from "./components/PanelBottom/cli";
import "./Terminal.styles.css";

const Terminal = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Mobile drawer state
  const [selectedRaffle, setSelectedRaffle] = useState(null); // Selected raffle state
  const [isCliCollapsed, setIsCliCollapsed] = useState(false); // CLI Panel Collapsible state

  const openDrawer = (raffle) => {
    setSelectedRaffle(raffle);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedRaffle(null);
    setIsDrawerOpen(false);
  };

  return (
    <div className="terminal-wrapper">
      <div className="terminal-main">
        {/* Header */}
        <Header />

        {/* Full-Width Panel */}
        <FullWidthPanel />

        {/* Main Content */}
        <div className={`terminal-container ${isCliCollapsed ? "cli-collapsed" : ""}`}>
          {/* Panels Wrapper: Raffle List & Raffle Details */}
          <div className="panels-wrapper">
            <div className="panel-left">
              <PanelLeft onSelectRaffle={openDrawer} />
            </div>
            <div className="panel-middle">
              <PanelMiddle selectedRaffle={selectedRaffle} />
            </div>
          </div>

          {/* Right Panel: Buy Tickets */}
          <div className="panel-right">
            <PanelRight selectedRaffle={selectedRaffle} />
          </div>
        </div>

        {/* Bottom Panel: CLI Logs */}
        <div className="panel-bottom">
          <CliPanel setIsCliCollapsed={setIsCliCollapsed} isCliCollapsed={isCliCollapsed} />
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
