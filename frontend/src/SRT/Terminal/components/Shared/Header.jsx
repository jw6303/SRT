import React, { useState } from "react";
import { translateText } from "../../../../api";
import "./Header.styles.css";

const Header = () => {
  const [language, setLanguage] = useState("en");

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
      <h1 className="header-title">Raffle Terminal</h1>
      <div className="header-actions">
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh-cn">中文</option>
        </select>
      </div>
    </div>
  );
};

export default Header;
