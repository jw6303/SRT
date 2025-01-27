import React, { useState, useEffect, useMemo } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl } from "@solana/web3.js"; 
import { useLogs } from "../../../../context/LogContext";
import "./FullWidthPanel.styles.css";

const FullWidthPanel = ({ activeFilters, setActiveFilters }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const { publicKey, wallet, disconnecting, connected } = useWallet();
  const { addLog } = useLogs();
  const [balance, setBalance] = useState(null); // Store user's balance

  // Memoize the connection to avoid re-creating it
  const connection = useMemo(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
    []
  );

  // Fetch balance when wallet connects or publicKey changes
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

  const handleToggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <div className="full-width-panel">
      {/* Wallet Info Section */}
      <div className="main-info">
        <div className="wallet-status">
          <h3>Wallet Information</h3>
          {publicKey ? (
            <>
              <p>
                <strong>Connected Wallet:</strong> {wallet?.adapter?.name || "Unknown"}
              </p>
              <p>
                <strong>Balance:</strong>{" "}
                {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
              </p>
            </>
          ) : (
            <p>Connect your wallet to participate in raffles and view your balance.</p>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default FullWidthPanel;
