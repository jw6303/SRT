import React, { useState, useEffect, useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { FaChevronDown } from "react-icons/fa"; // Collapse button icon
import { useLogs } from "../../../../context/LogContext";
import "../../Terminal.styles.css";

const FullWidthPanel = () => {
  const { publicKey, wallet, disconnecting, connected } = useWallet();
  const { addLog } = useLogs();
  const [balance, setBalance] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Toggle panel visibility

  // Memoize the connection to avoid re-creating it on every render
  const connection = useMemo(() => new Connection(clusterApiUrl("devnet"), "confirmed"), []);

  // Function to fetch balance
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / 1e9; // Convert lamports to SOL
        setBalance(solBalance);
        addLog(`Updated balance: ${solBalance.toFixed(2)} SOL`, "info");
      } catch (error) {
        console.error("Error fetching balance:", error);
        addLog("Error fetching balance.", "error");
      }
    } else {
      setBalance(null);
    }
  };

  // Fetch balance periodically
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [publicKey, connection, addLog]);

  return (
    <div className={`full-width-panel ${isCollapsed ? "collapsed" : ""}`}>
      
      {/* 🔽 Collapse Toggle Button */}
      <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
        <FaChevronDown className={`collapse-icon ${isCollapsed ? "rotated" : ""}`} />
      </button>

      {/* Show content if NOT collapsed */}
      {!isCollapsed && (
        <>
          {/* Left Panel: Wallet Info & Button */}
          <div className="panel-left">
            <WalletMultiButton className="wallet-button" />
            {publicKey ? (
              <span className="wallet-info">
                {wallet?.adapter?.name || "Unknown Wallet"} | {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
              </span>
            ) : (
              <span className="wallet-prompt">Connect your wallet</span>
            )}
          </div>

          {/* Center Panel: Solana Ticker */}
          <div className="panel-center">
            <SolanaTicker />
          </div>
        </>
      )}
    </div>
  );
};

/** ✅ SolanaTicker Component */
const SolanaTicker = () => {
  const [solanaData, setSolanaData] = useState(null);

  useEffect(() => {
    const fetchSolanaData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana"
        );
        const data = await response.json();
        setSolanaData(data[0]); // Extract Solana data
      } catch (error) {
        console.error("Error fetching Solana data:", error);
      }
    };

    fetchSolanaData();
    const interval = setInterval(fetchSolanaData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="solana-ticker">
      {solanaData ? (
        <>
          <span>Solana: <strong>${solanaData.current_price.toFixed(2)}</strong></span> |
          <span> 24h: <strong style={{ color: solanaData.price_change_percentage_24h > 0 ? "green" : "red" }}>
            {solanaData.price_change_percentage_24h.toFixed(2)}%
          </strong></span> |
          <span> Market Cap: <strong>${(solanaData.market_cap / 1e9).toFixed(2)}B</strong></span>
        </>
      ) : (
        <span>Loading SOL price...</span>
      )}
    </div>
  );
};

export default FullWidthPanel;
