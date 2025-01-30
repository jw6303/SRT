import React, { useState } from "react";
import Header from "./components/Shared/Header";
import FullWidthPanel from "./components/Shared/FullWidthPanel";
import PanelLeft from "./components/PanelLeft/RaffleList";
import PanelMiddle from "./components/PanelMiddle/RaffleDetails";
import PanelRight from "./components/PanelRight/BuyLogic";
import CliPanel from "./components/PanelBottom/cli";
import "./Terminal.styles.css";

const Terminal = () => {
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [isCliCollapsed, setIsCliCollapsed] = useState(false);

  return (
    <div className="terminal-wrapper">
      <div className="terminal-main">
        {/* Header */}
        <Header />

        {/* Full-Width Panel */}
        <FullWidthPanel />

        {/* Main Content (Raffle List -> Raffle Details -> Buy Logic) */}
        <div className="terminal-container">
          <div className="panels-wrapper">
            <div className="panel-left">
              <PanelLeft onSelectRaffle={setSelectedRaffle} />
            </div>
            <div className="panel-middle">
              <PanelMiddle selectedRaffle={selectedRaffle} />
            </div>
          </div>

          {/* Buy Logic Section */}
          <div className="panel-right">
            <PanelRight selectedRaffle={selectedRaffle} />
          </div>
        </div>

        {/* CLI Panel at the Bottom */}
        <div className="panel-bottom">
          <CliPanel setIsCliCollapsed={setIsCliCollapsed} isCliCollapsed={isCliCollapsed} />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
