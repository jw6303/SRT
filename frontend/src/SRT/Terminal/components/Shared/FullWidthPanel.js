import React, { useState, useEffect, useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useLogs } from "../../../../context/LogContext";
import "./FullWidthPanel.styles.css";

const FullWidthPanel = () => {
  const { publicKey, wallet, disconnecting, connected } = useWallet();
  const { addLog } = useLogs();
  const [balance, setBalance] = useState(null);

  // Memoize the connection to avoid re-creating it
  const connection = useMemo(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
    []
  );

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const lamports = await connection.getBalance(publicKey);
          const solBalance = lamports / 1e9; // Convert lamports to SOL
          setBalance(solBalance);
          addLog(`Fetched balance: ${solBalance.toFixed(2)} SOL`, "info");
        } catch (error) {
          console.error("Error fetching balance:", error);
          addLog("Error fetching balance.", "error");
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [publicKey, connection, addLog]);

  useEffect(() => {
    if (wallet) {
      if (connected) {
        addLog(`Wallet Connected: ${wallet?.adapter?.name || "Unknown Wallet"}`, "info");
      }
      if (disconnecting) {
        addLog(`Wallet Disconnecting: ${wallet?.adapter?.name}`, "warn");
      }
    }
  }, [wallet, connected, disconnecting, addLog]);

  return (
    <div className="full-width-panel">
      {/* Left Column: Wallet Info */}
      <div className="panel-left">
        {publicKey ? (
          <p className="wallet-info">
            <span>{wallet?.adapter?.name || "Unknown Wallet"}</span>
            <span className="wallet-balance">
              {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
            </span>
          </p>
        ) : (
          <p className="wallet-prompt">Connect your wallet to view your balance.</p>
        )}
      </div>

      {/* Center Column: Solana Ticker ✅ */}
      <div className="panel-center">
        <SolanaTicker />
      </div>

      {/* Right Column: Wallet Button */}
      <div className="panel-right">
        <WalletMultiButton className="wallet-button" />
      </div>
    </div>
  );
};

/** ✅ SolanaTicker Component (Styled to Match Your CSS) */
const SolanaTicker = () => {
  const [solanaData, setSolanaData] = useState(null);

  useEffect(() => {
    const fetchSolanaData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana"
        );
        const data = await response.json();
        setSolanaData(data[0]); // Extract Solana data from the array
      } catch (error) {
        console.error("Error fetching Solana data:", error);
      }
    };

    fetchSolanaData();
  }, []);

  return (
    <div className="solana-ticker">
      {solanaData ? (
        <>
          <span>💰 SOL: <strong>${solanaData.current_price.toFixed(2)}</strong></span> |
          <span>📈 24h: <strong className={solanaData.price_change_percentage_24h > 0 ? "positive" : "negative"}>
            {solanaData.price_change_percentage_24h.toFixed(2)}%
          </strong></span> |
          <span>🏦 MCap: <strong>${(solanaData.market_cap / 1e9).toFixed(2)}B</strong></span> |
          <span>🔄 Vol: <strong>${(solanaData.total_volume / 1e9).toFixed(2)}B</strong></span>
        </>
      ) : (
        <span>Loading Solana data...</span>
      )}
    </div>
  );
};

export default FullWidthPanel;
