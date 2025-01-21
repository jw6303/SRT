import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import Modal from "./components/Modal";
import RaffleList from "./components/RaffleList";
import ConnectWalletButton from "./components/ConnectWalletButton";
import ChatBubble from "./components/ChatBubble";
import BottomNavBar from "./components/BottomNavBar";
import "./components/Terminal.css";
import "./components/WalletButtonOverride.css";
import "./components/ChatBubble.css";
import "./components/BottomNavBar.css";

const Raffle = () => {
  const [selectedPool, setSelectedPool] = useState(null);
  const [balance, setBalance] = useState(null);
  const [activeTab, setActiveTab] = useState("Screener");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { connected, publicKey } = useWallet();
  const connection = new Connection("https://api.devnet.solana.com");

  // Detect wallet availability
  useEffect(() => {
    if (window.solana?.isPhantom) {
      console.log("Phantom Wallet detected.");
    } else {
      console.warn("Phantom Wallet not detected. Ensure another supported wallet is available.");
    }
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!connected || !publicKey) {
        setBalance(null);
        return;
      }

      try {
        const balanceInLamports = await connection.getBalance(publicKey);
        const balanceInSol = balanceInLamports / 1e9;
        setBalance(balanceInSol.toFixed(2));
        console.log("Wallet balance fetched:", balanceInSol);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  // Handle modal open
  const openModal = (pool) => {
    if (!connected) {
      alert("Please connect your wallet to participate.");
      return;
    }
    console.log("Opening modal for pool:", pool);
    setSelectedPool(pool);
  };

  // Handle modal close
  const closeModal = () => {
    console.log("Closing modal");
    setSelectedPool(null);
  };

  return (
    <div className="raffle-container">
      {/* Header */}
      <header className="raffle-header">
        <h1>Solana Raffle Terminal</h1>
      </header>

{/* Wallet Section */}
<div
  className="wallet-section centered"
  style={{
    backgroundColor: "transparent",
    padding: "10px",
    border: "none",
    borderRadius: "0",
    boxShadow: "none",
  }}
>
  <ConnectWalletButton />
  {connected ? (
    <div className="wallet-info">
      <p className="syntax-green">
        Connected as: {publicKey?.toString().slice(0, 4)}...
        {publicKey?.toString().slice(-4)}
      </p>
      <p className="syntax-cyan">
        Balance: {balance !== null ? `${balance} SOL` : "Loading..."}
      </p>
    </div>
  ) : (
    <p className="syntax-red">Please connect your wallet to participate.</p>
  )}
</div>
      {/* Divider */}
      <div className="divider" />

      {/* Raffle List */}
      <RaffleList openModal={openModal} />

      {/* Divider */}
      <div className="divider" />

      {/* Conditional Tab Content */}
      {activeTab === "Chat" && (
        <ChatBubble onClose={() => setActiveTab("Screener")} />
      )}

      {/* ChatBubble (Overlay) */}
      {isChatOpen && (
        <ChatBubble onClose={() => setIsChatOpen(false)} />
      )}

      {/* Modal */}
      {selectedPool && <Modal pool={selectedPool} onClose={closeModal} />}

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "Chat") {
            setIsChatOpen(!isChatOpen);
          } else {
            setActiveTab(tab);
          }
        }}
      />
    </div>
  );
};

export default Raffle;
