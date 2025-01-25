import React, { useState } from "react";
import Sidebar from "./components/Shared/Sidebar";
import Header from "./components/Shared/Header";
import FullWidthPanel from "./components/Shared/FullWidthPanel";
import PanelLeft from "./components/PanelLeft/RaffleList";
import PanelMiddle from "./components/PanelMiddle/RaffleDetails";
import PanelRight from "./components/PanelRight/BuyLogic";
import CliPanel from "./components/PanelBottom/cli"; // Import the CLI panel
import "./Terminal.styles.css";

const Terminal = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1) Hold your logs in state here (the parent component)
  const [logs, setLogs] = useState([]);

  // 2) Provide a helper to add new logs
  const addLog = (message, type = "info") => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { message, type, logTime: Date.now() }
    ]);
  };

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
            {/* 3) Pass down addLog to child panels that need to log */}
            <PanelLeft addLog={addLog} />
          </div>
          <div className="panel-middle">
            <PanelMiddle addLog={addLog} />
          </div>
          <div className="panel-right">
            <PanelRight addLog={addLog} />
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="panel-bottom">
          {/* 4) Pass logs to the CLI panel */}
          <CliPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
