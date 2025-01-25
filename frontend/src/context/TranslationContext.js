import React, { createContext, useState, useContext } from "react";
import { translateText } from "../api"; // Your translation function

// Create the context
const TranslationContext = createContext();

// Provider component
export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // Default to English

  const translate = async (text) => {
    try {
      const translatedText = await translateText(text, language);
      return translatedText;
    } catch (error) {
      console.error("Translation failed:", error.message);
      return text; // Fallback to original text
    }
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook to use the context
export const useTranslation = () => useContext(TranslationContext);
