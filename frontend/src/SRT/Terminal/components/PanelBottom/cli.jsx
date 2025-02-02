import React, { useEffect, useRef, useState } from "react";
import { useWallet, useWallets } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { FaChevronDown, FaBolt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
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
  const welcomeLogged = useRef(false); // ✅ Prevents duplicate logs

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]); // Triggers every time logs update

  // ✅ Welcome Message (Logged Only Once)
  useEffect(() => {
    if (!welcomeLogged.current) {
      addLog("──────────────────────────────────────");
      addLog("Welcome to Solana Raffle Terminal");
      addLog("──────────────────────────────────────");
      addLog('Type "connect" to connect a wallet.');
      welcomeLogged.current = true; // ✅ Ensures it runs only once
    }
  }, []);

  // ✅ List Wallets
  const listWallets = () => {
    if (wallets.length === 0) {
      addLog("No wallets detected. Please install a wallet extension.");
      return;
    }

    addLog("──────────────────────────────────────");
    addLog("Available Wallets:");
    wallets.forEach((w, index) => {
      addLog(
        <span key={index} className="cli-clickable" onClick={() => selectWallet(index + 1)}>
          ├─ [{index + 1}] {w.adapter.name}
        </span>
      );
    });
    addLog("──────────────────────────────────────");
    addLog('Click a wallet or type: select <number>');
  };

  // ✅ Select Wallet
  const selectWallet = (index) => {
    if (index < 1 || index > wallets.length) {
      addLog("Invalid selection. Use the wallet number from the list.");
      return;
    }

    const selectedWallet = wallets[index - 1];
    select(selectedWallet.adapter.name);
    addLog(`Selected Wallet: ${selectedWallet.adapter.name}`);
    setWalletEnabled(true);
  };

  // ✅ Fetch Wallet Balance
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1e9;
        setBalance(solBalance);
        addLog(`Balance: ${solBalance.toFixed(2)} SOL`);
      } catch (error) {
        addLog("Failed to fetch balance.");
      }
    }
  };

  // ✅ Handle Wallet Connection
  useEffect(() => {
    if (connected) {
      addLog("──────────────────────────────────────");
      addLog(
        <span>
          <FaCheckCircle className="log-icon success" /> Wallet Connected: {wallet?.adapter?.name || "Unknown Wallet"}
        </span>
      );
      addLog(
        <span>
          <FaBolt className="log-icon update" /> Public Key: {publicKey?.toBase58() || "N/A"}
        </span>
      );
      fetchBalance();
      showWalletActions();
    }
  }, [connected, wallet, publicKey]);

  // ✅ Show Wallet Actions
  const showWalletActions = () => {
    addLog("──────────────────────────────────────");
    addLog("Available Actions:");
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
    addLog("──────────────────────────────────────");
  };

  // ✅ Copy Wallet Address
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      addLog("Wallet address copied.");
    }
  };

  // ✅ Disconnect Wallet
  const disconnectWallet = async () => {
    if (walletEnabled) {
      await disconnect();
      setWalletEnabled(false);
      setBalance(null);
      addLog("Wallet Disconnected.");
    }
  };

  // ✅ Handle CLI Commands
  const handleCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    addLog(`$ ${command}`);
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "clear") clearLogs();
    else if (lowerCommand === "connect") listWallets();
    else if (lowerCommand.startsWith("select ")) selectWallet(parseInt(lowerCommand.split(" ")[1], 10));
    else if (lowerCommand === "copy address" || lowerCommand === "a") copyAddress();
    else if (lowerCommand === "change wallet" || lowerCommand === "b") listWallets();
    else if (lowerCommand === "disconnect" || lowerCommand === "x") disconnectWallet();
    else addLog("Unknown command.");

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
            {logs.map((log, index) => {
              return (
                <div key={index} className="log-entry" ref={index === logs.length - 1 ? lastLogRef : null}>
                  {typeof log.message !== "string" ? log.message : <span className="log-message">{log.message}</span>}
                </div>
              );
            })}
          </div>

          {/* CLI Input */}
          <form onSubmit={handleCommand} className="cli-input">
            <span className="cli-prompt">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a command..."
              autoFocus
              className="log-input"
            />
          </form>
        </>
      )}
    </div>
  );
};

export default CliPanel;
