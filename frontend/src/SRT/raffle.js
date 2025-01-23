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

  // Theme state
  const [theme, setTheme] = useState("dark");

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

  // Theme toggle logic
  useEffect(() => {
    document.body.setAttribute("data-theme", theme); // Set the theme on body
    localStorage.setItem("theme", theme); // Store theme in localStorage
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="raffle-container">
      {/* Header */}
      <header className="raffle-header">
        <h1 className="cli-title">Solana Raffle Terminal</h1>
      </header>
  
      {/* Theme Toggle Button */}
      <div className="theme-toggle">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          Switch to {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>
  
      <div className="main-layout">
        {/* Left Column */}
        <div className="left-column">
          <div className="wallet-section">
            <ConnectWalletButton />
            {connected ? (
              <div className="wallet-info">
                <p className="syntax-green">
                  Connected as: <span className="cli-status-value">{publicKey?.toString().slice(0, 4)}...</span>{publicKey?.toString().slice(-4)}
                </p>
                <p className="syntax-cyan">
                  Balance: <span className="cli-financial-value">{balance !== null ? `${balance} SOL` : "Loading..."}</span>
                </p>
              </div>
            ) : (
              <p className="syntax-red">
                <span className="cli-status-highlight">Please connect your wallet to participate.</span>
              </p>
            )}
          </div>
  
          {/* Divider */}
          <div className="divider" />
  
          {/* Raffle List */}
          <RaffleList openModal={openModal} />
        </div>
  
        {/* Right Column */}
        <div className="right-column">
          {/* Conditional Tab Content */}
          {activeTab === "Chat" && <ChatBubble onClose={() => setActiveTab("Screener")} />}
  
          {/* ChatBubble (Overlay) */}
          {isChatOpen && <ChatBubble onClose={() => setIsChatOpen(false)} />}
  
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
      </div>
    </div>
  );
  };

export default Raffle;
