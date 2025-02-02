import React, { useEffect, useRef, useState } from "react";
import { useWallet, useWallets } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { FaChevronDown } from "react-icons/fa";
import { useLogs } from "../../../../context/LogContext";
import "../../Terminal.styles.css";

const CliPanel = () => {
  const { logs, addLog, clearLogs } = useLogs();
  const { wallets, select, publicKey, wallet, connected, disconnect } = useWallet();
  const logContainerRef = useRef(null);
  const lastLogRef = useRef(null);
  const [command, setCommand] = useState("");
  const [walletEnabled, setWalletEnabled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [balance, setBalance] = useState(null);
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // ✅ Format timestamp for logs
  const formatTimestamp = () => new Date().toLocaleTimeString("en-US", { hour12: false });

  // ✅ Show welcome message on startup
  useEffect(() => {
    const timestamp = formatTimestamp();
    addLog(`[${timestamp}] [INFO] Welcome to Solana Raffle Terminal`);
    addLog(`[${timestamp}] [INFO] Click "Connect Wallet" or type "connect"`);
  }, [addLog]);

  // ✅ List available wallets
  const listWallets = () => {
    if (wallets.length === 0) {
      addLog(`[${formatTimestamp()}] [ERROR] No wallets detected. Please install a wallet extension.`);
      return;
    }

    const timestamp = formatTimestamp();
    addLog(`[${timestamp}] [INFO] Available Wallets:`);

    wallets.forEach((w, index) => {
      addLog(
        <span key={index} className="cli-clickable" onClick={() => selectWallet(index + 1)}>
          ├─ [{index + 1}] {w.adapter.name}
        </span>
      );
    });

    addLog(`[${timestamp}] [INFO] Click a wallet or type: select <number>`);
  };

  // ✅ Select a wallet
  const selectWallet = (index) => {
    if (index < 1 || index > wallets.length) {
      addLog(`[${formatTimestamp()}] [ERROR] Invalid selection. Use the wallet number from the list.`);
      return;
    }

    const selectedWallet = wallets[index - 1];
    select(selectedWallet.adapter.name);
    addLog(`[${formatTimestamp()}] [INFO] Selected Wallet: ${selectedWallet.adapter.name}`);
    setWalletEnabled(true);
  };

  // ✅ Fetch wallet balance (original method)
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1e9;
        setBalance(solBalance);
        addLog(`[${formatTimestamp()}] [INFO] Balance: ${solBalance.toFixed(2)} SOL`);
      } catch (error) {
        addLog(`[${formatTimestamp()}] [ERROR] Failed to fetch balance.`);
      }
    }
  };

  // ✅ Handle wallet connection
  useEffect(() => {
    if (connected) {
      const timestamp = formatTimestamp();
      addLog(`[${timestamp}] [INFO] Wallet Connected: ${wallet?.adapter?.name || "Unknown Wallet"}`);
      addLog(`[${timestamp}] [INFO] Public Key: ${publicKey?.toBase58() || "N/A"}`);
      fetchBalance(); // 🔥 Fetch balance immediately
      showWalletActions();
    }
  }, [connected, wallet, publicKey]);

  // ✅ Show available wallet actions
  const showWalletActions = () => {
    const timestamp = formatTimestamp();
    addLog(`[${timestamp}] [INFO] Actions:`);

    addLog(
      <span className="cli-clickable" onClick={copyAddress}>
        ├─ [A] Copy Address
      </span>
    );

    addLog(
      <span className="cli-clickable" onClick={listWallets}>
        ├─ [B] Change Wallet
      </span>
    );

    addLog(
      <span className="cli-clickable cli-disconnect" onClick={disconnectWallet}>
        ├─ [X] Disconnect Wallet
      </span>
    );
  };

  // ✅ Copy wallet address
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      addLog(`[${formatTimestamp()}] [INFO] Wallet Address Copied`);
    }
  };

  // ✅ Handle wallet disconnection
  const disconnectWallet = async () => {
    if (walletEnabled) {
      await disconnect();
      setWalletEnabled(false);
      setBalance(null);
      addLog(`[${formatTimestamp()}] [WARN] Wallet Disconnected`);
    }
  };

  // ✅ Handle CLI commands
  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    addLog(`$ ${command}`, "input");
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "clear") clearLogs();
    else if (lowerCommand === "connect") listWallets();
    else if (lowerCommand.startsWith("select ")) selectWallet(parseInt(lowerCommand.split(" ")[1], 10));
    else if (lowerCommand === "copy address" || lowerCommand === "a") copyAddress();
    else if (lowerCommand === "change wallet" || lowerCommand === "b") listWallets();
    else if (lowerCommand === "disconnect" || lowerCommand === "x") disconnectWallet();
    else addLog(`[${formatTimestamp()}] [ERROR] Unknown command.`);

    setCommand("");
  };

  return (
    <div className={`cli-panel ${isCollapsed ? "collapsed" : ""}`}>
      {/* 🔽 Collapse Button */}
      <button className="cli-collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        <FaChevronDown className={`collapse-icon ${isCollapsed ? "rotated" : ""}`} />
      </button>

      {/* CLI Logs */}
      {!isCollapsed && (
        <>
          <div className="cli-logs" ref={logContainerRef}>
            {logs.map((log, index) => (
              <div key={log.id} className={`log-entry log-${log.type}`} ref={index === logs.length - 1 ? lastLogRef : null}>
                <span className="log-time">[{new Date(log.logTime).toLocaleTimeString()}]</span>{" "}
                <span className={`log-keyword ${log.type === "info" ? "log-info" : log.type === "warn" ? "log-warn" : "log-error"}`}>
                  [{log.type.toUpperCase()}]
                </span>{" "}
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>

          {/* CLI Input */}
          <form onSubmit={handleCommand} className="cli-input">
            <span className="cli-prompt">$</span>
            <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Type a command..." autoFocus />
          </form>
        </>
      )}
    </div>
  );
};

export default CliPanel;
