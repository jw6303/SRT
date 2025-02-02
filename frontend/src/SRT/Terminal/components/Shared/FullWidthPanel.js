import React, { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import useSolanaGasFee from "../../hooks/useSolanaGasFee";
import { useLogs } from "../../../../context/LogContext"; // ✅ Import CLI Logging System
import "../../Terminal.styles.css";

const FullWidthPanel = () => {
  const { priorityFee, congestionLevel } = useSolanaGasFee();
  const { publicKey, wallet, connected } = useWallet();
  const { addLog } = useLogs(); // ✅ Logging Hook for CLI
  const [hasLoggedFirstGasFee, setHasLoggedFirstGasFee] = useState(false);

  // ⏳ Format timestamp for logs
  const formatTimestamp = () =>
    new Date().toLocaleTimeString("en-US", { hour12: false });

  // 📌 Log Gas Fee when Wallet is First Connected
  useEffect(() => {
    if (connected && publicKey && priorityFee !== null && !hasLoggedFirstGasFee) {
      addLog(
        `[${formatTimestamp()}] [INFO] Wallet Connected: ${wallet?.adapter?.name || "Unknown Wallet"} | Public Key: ${publicKey.toBase58()}`
      );
      addLog(
        `[${formatTimestamp()}] [INFO] Initial Gas Fee: ${priorityFee.toFixed(6)} SOL | Congestion: ${congestionLevel}`
      );
      setHasLoggedFirstGasFee(true);
    }
  }, [connected, publicKey, priorityFee, congestionLevel, addLog]);

  // 📌 Periodically Log Gas Fee Updates in CLI
  useEffect(() => {
    if (connected && priorityFee !== null) {
      addLog(
        `[${formatTimestamp()}] [INFO] Updated Gas Fee: ${priorityFee.toFixed(6)} SOL | Congestion: ${congestionLevel}`
      );
    }
  }, [priorityFee, congestionLevel, addLog]);

  // 📌 Handle Wallet Disconnection (Log Public Key)
  useEffect(() => {
    if (!connected && hasLoggedFirstGasFee && publicKey) {
      addLog(
        `[${formatTimestamp()}] [WARN] Wallet Disconnected: ${wallet?.adapter?.name || "Unknown Wallet"} | Public Key: ${publicKey.toBase58()}`
      );
      setHasLoggedFirstGasFee(false); // Reset state for next connection
    }
  }, [connected, publicKey, wallet, addLog]);

  return (
    <div className="full-width-panel">
      {/* Left Panel: Wallet Info */}
      <div className="panel-left">
        {publicKey ? (
          <p className="wallet-info">
            [WALLET] {wallet?.adapter?.name || "Unknown Wallet"} | 
            <span className="wallet-balance">{priorityFee ? `${priorityFee.toFixed(6)} SOL` : "Loading..."}</span>
          </p>
        ) : (
          <p className="wallet-prompt">[DISCONNECTED] No Wallet Connected</p>
        )}
      </div>

      {/* Center Panel: Solana Gas Fee Indicator */}
      <div className="panel-center">
        <p className="solana-gas-indicator">
          [NETWORK] Status: <span className={`fee-level ${congestionLevel.toLowerCase()}`}>{congestionLevel}</span> | 
          Priority Fee: <span className="fee-amount">{priorityFee ? `${priorityFee.toFixed(6)} SOL` : "Loading..."}</span>
        </p>
      </div>

      {/* Right Panel: Wallet Button */}
      <div className="panel-right">
        <WalletMultiButton className="wallet-button" />
      </div>
    </div>
  );
};

export default FullWidthPanel;
