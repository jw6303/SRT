import React, { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { FaChevronDown } from "react-icons/fa"; // Collapse icon
import { useLogs } from "../../../../context/LogContext";
import "../../Terminal.styles.css";

const CliPanel = () => {
  const { logs, addLog, clearLogs } = useLogs();
  const { publicKey, wallet, connected, disconnecting } = useWallet();
  const logContainerRef = useRef(null);
  const lastLogRef = useRef(null);
  const [command, setCommand] = useState("");
  const [balance, setBalance] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Auto-scroll when logs update
  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Fetch and log wallet balance
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1e9; // Convert lamports to SOL
        setBalance(solBalance);
        addLog(`[${new Date().toLocaleTimeString()}] Balance: ${solBalance.toFixed(2)} SOL`, "info");
      } catch (error) {
        addLog("Error fetching balance.", "error");
      }
    } else {
      setBalance(null);
    }
  };

  // Listen for wallet connections and log it
  useEffect(() => {
    if (connected) {
      addLog(`[${new Date().toLocaleTimeString()}] Wallet Connected: ${wallet?.adapter?.name}`, "info");
      fetchBalance();
    } else if (disconnecting) {
      addLog(`[${new Date().toLocaleTimeString()}] Wallet Disconnected`, "warn");
    }
  }, [connected, disconnecting, wallet]);

  // CLI Command Handling
  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    addLog(`$ ${command}`, "input");

    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "clear") {
      clearLogs();
      addLog("Logs cleared.", "success");
    } else if (lowerCommand === "balance") {
      if (publicKey) {
        await fetchBalance();
      } else {
        addLog("No wallet connected.", "error");
      }
    } else if (lowerCommand.startsWith("buy")) {
      addLog(`Processing ${command}...`, "info");
      setTimeout(() => addLog("✅ Purchase successful!", "success"), 2000);
    } else {
      addLog(`Unknown command: "${command}". Type 'help' for options.`, "error");
    }

    setCommand("");
  };

  return (
    <div className={`cli-panel ${isCollapsed ? "collapsed" : ""}`}>
      
      {/* 🔽 Collapse Button */}
      <button className="cli-collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        <FaChevronDown className={`collapse-icon ${isCollapsed ? "rotated" : ""}`} />
      </button>

      {/* CLI Logs (Hidden when collapsed) */}
      {!isCollapsed && (
        <>
          <div className="cli-logs">
            <div className="log-container" ref={logContainerRef}>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`log-entry log-${log.type}`}
                    ref={index === logs.length - 1 ? lastLogRef : null}
                  >
                    <span className="log-time">
                      [{new Date(log.logTime).toLocaleTimeString()}]
                    </span>{" "}
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              ) : (
                <p className="no-logs">No logs available.</p>
              )}
            </div>
          </div>

          {/* CLI Input Field */}
          <form onSubmit={handleCommand} className="cli-input">
            <span className="cli-prompt">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a command..."
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
};

export default CliPanel;
