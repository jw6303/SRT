import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import useSolanaGasFee from "../../hooks/useSolanaGasFee";
import { useLogs } from "../../../../context/LogContext";
import { Connection, clusterApiUrl } from "@solana/web3.js"; // ✅ Import Solana Connection
import "../../Terminal.styles.css";

const FullWidthPanel = () => {
  const { priorityFee, congestionLevel } = useSolanaGasFee();
  const { publicKey, wallet, connected } = useWallet();
  const { addLog } = useLogs();
  const [hasLoggedFirstGasFee, setHasLoggedFirstGasFee] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null); // ✅ Store Wallet Balance
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // ⏳ Format timestamp for logs
  const formatTimestamp = () =>
    new Date().toLocaleTimeString("en-US", { hour12: false });

  // 📌 Fetch Wallet Balance when Connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setWalletBalance((balance / 1e9).toFixed(4)); // Convert lamports to SOL
        } catch (error) {
          setWalletBalance("N/A");
        }
      }
    };

    if (connected) fetchBalance();
  }, [connected, publicKey]);

  // 📌 Log Gas Fee when Wallet is First Connected
  useEffect(() => {
    if (connected && publicKey && priorityFee !== null && !hasLoggedFirstGasFee) {
      addLog(
        `[${formatTimestamp()}] Wallet Connected: ${wallet?.adapter?.name || "Unknown Wallet"} | Public Key: ${publicKey.toBase58()}`
      );
      addLog(
        `[${formatTimestamp()}] Initial Gas Fee: ${priorityFee.toFixed(6)} SOL | Congestion: ${congestionLevel}`
      );
      setHasLoggedFirstGasFee(true);
    }
  }, [connected, publicKey, priorityFee, congestionLevel, addLog]);

  // 📌 Periodically Log Gas Fee Updates in CLI
  useEffect(() => {
    if (connected && priorityFee !== null) {
      addLog(
        `[${formatTimestamp()}] Updated Gas Fee: ${priorityFee.toFixed(6)} SOL | Congestion: ${congestionLevel}`
      );
    }
  }, [priorityFee, congestionLevel, addLog]);

  // 📌 Handle Wallet Disconnection (Log Public Key)
  useEffect(() => {
    if (!connected && hasLoggedFirstGasFee && publicKey) {
      addLog(
        `[${formatTimestamp()}] Wallet Disconnected: ${wallet?.adapter?.name || "Unknown Wallet"} | Public Key: ${publicKey.toBase58()}`
      );
      setHasLoggedFirstGasFee(false);
      setWalletBalance(null); // Reset balance on disconnect
    }
  }, [connected, publicKey, wallet, addLog]);

  return (
    <div className="full-width-panel">
      {/* Wallet & Gas Info Container */}
      <div className="panel-content">
        {/* Wallet Info */}
        <div className="wallet-info-container">
          {publicKey ? (
            <p className="wallet-info">
              [WALLET] {wallet?.adapter?.name || "Unknown Wallet"} | 
              <span className="wallet-balance">{walletBalance !== null ? `${walletBalance} SOL` : "Loading..."}</span>
            </p>
          ) : (
            <p className="wallet-prompt">[DISCONNECTED] No Wallet Connected</p>
          )}
        </div>

        {/* Solana Network & Gas Fees */}
        <div className="network-status">
          <p className="solana-gas-indicator">
            [NETWORK] Status: 
            <span className={`fee-level ${congestionLevel.toLowerCase()}`}>{congestionLevel}</span> | 
            Priority Fee: <span className="fee-amount">{priorityFee ? `${priorityFee.toFixed(6)} SOL` : "Loading..."}</span>
          </p>
        </div>

        {/* Wallet Button (Aligned & No Overflow Issues) */}
        <div className="wallet-button-container">
          <WalletMultiButton className="wallet-button" />
        </div>
      </div>
    </div>
  );
};

export default FullWidthPanel;
