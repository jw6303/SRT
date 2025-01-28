import React, { useState } from "react";
import { translateText } from "../../../../api";
import { FaSun, FaMoon } from "react-icons/fa"; // Import icons
import "./Header.styles.css";

const Header = () => {
  const [language, setLanguage] = useState("en");
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default theme

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

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);

    // Update CSS variables for the theme
    const root = document.documentElement;
    if (isDarkTheme) {
      // Light theme
      root.style.setProperty("--terminal-bg-color", "#ffffff");
      root.style.setProperty("--sidebar-bg-color", "#f4f4f4");
      root.style.setProperty("--panel-bg-color", "#eaeaea");
      root.style.setProperty("--border-color", "#cccccc");
      root.style.setProperty("--text-color", "#333333");
      root.style.setProperty("--accent-color", "#007acc");
    } else {
      // Dark theme
      root.style.setProperty("--terminal-bg-color", "#1e1e1e");
      root.style.setProperty("--sidebar-bg-color", "#252526");
      root.style.setProperty("--panel-bg-color", "#2c2c2c");
      root.style.setProperty("--border-color", "#3c3c3c");
      root.style.setProperty("--text-color", "#d4d4d4");
      root.style.setProperty("--accent-color", "#61dafb");
    }
  };

  return (
    <div className="header">
      <h1 className="header-title">Raffle Terminal</h1>
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
        <div className="theme-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={!isDarkTheme}
              onChange={toggleTheme}
              className="toggle-input"
            />
            <span className="toggle-slider">
              {isDarkTheme ? <FaMoon className="toggle-icon" /> : <FaSun className="toggle-icon" />}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Header;
