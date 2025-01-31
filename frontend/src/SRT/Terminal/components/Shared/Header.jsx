import React, { useState, useEffect, useMemo } from "react";
import { translateText } from "../../../../api";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { FaSun, FaMoon } from "react-icons/fa"; // Theme Icons
import "./Header.styles.css";

const Header = () => {
  const [language, setLanguage] = useState("en");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { publicKey, wallet } = useWallet();
  const [balance, setBalance] = useState(null);
  const [solanaData, setSolanaData] = useState(null);

  // ✅ Update Theme in <html> When Changed
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkTheme) {
      root.classList.remove("light-mode");
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
      root.classList.add("light-mode");
    }
  }, [isDarkTheme]);

  // ✅ Use Alchemy RPC Instead of CoinGecko for Gas Fees
  const connection = useMemo(
    () => new Connection("https://solana-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY"),
    []
  );

  // ✅ Fetch Solana Wallet Balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const lamports = await connection.getBalance(publicKey);
          const solBalance = lamports / 1e9; // Convert lamports to SOL
          setBalance(solBalance);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // ✅ Fetch Solana Market Data (Includes Fallback for Errors)
  useEffect(() => {
    const fetchSolanaData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=solana&price_change_percentage=24h,7d"
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setSolanaData(data[0]); // Ensure we have valid data
        } else {
          console.error("Invalid response structure:", data);
          setSolanaData(null);
        }
      } catch (error) {
        console.error("Error fetching Solana data:", error);
        setSolanaData(null);
      }
    };

    fetchSolanaData();
    const interval = setInterval(fetchSolanaData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = async (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);

    try {
      const translatedTitle = await translateText("Raffle Terminal", selectedLanguage);
      document.title = translatedTitle;
    } catch (error) {
      console.error("Error translating:", error.message);
    }
  };

  return (
    <div className="header">
      <h1 className="header-title">Solana Raffle Terminal</h1>

      {/* ✅ Solana Ticker (Now Fully Safe) */}
      <div className="header-ticker">
        {solanaData ? (
          <div className="solana-ticker">
            <span>Solana: <strong>${solanaData.current_price?.toFixed(2) || "Loading..."}</strong></span> |
            <span> 24h:{" "}
              <strong style={{ color: solanaData.price_change_percentage_24h > 0 ? "limegreen" : "red" }}>
                {solanaData.price_change_percentage_24h?.toFixed(2) || "0.00"}%
              </strong>
            </span> |
            <span> 7d:{" "}
              <strong style={{ color: solanaData.price_change_percentage_7d > 0 ? "limegreen" : "red" }}>
                {solanaData.price_change_percentage_7d?.toFixed(2) || "0.00"}%
              </strong>
            </span> |
            <span> Market Cap: <strong>${(solanaData.market_cap / 1e9)?.toFixed(2) || "0.00"}B</strong></span>
          </div>
        ) : (
          <div className="solana-ticker"> Loading Solana price...</div>
        )}
      </div>

      {/* ✅ Theme & Language Controls */}
      <div className="header-actions">
        {/* Language Selector */}
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh-cn">中文</option>
        </select>

        {/* Theme Toggle */}
        <div className="theme-toggle" onClick={() => setIsDarkTheme(!isDarkTheme)}>
          {isDarkTheme ? <FaMoon className="toggle-icon" /> : <FaSun className="toggle-icon" />}
        </div>
      </div>
    </div>
  );
};

export default Header;
