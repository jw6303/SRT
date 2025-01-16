import { useState, useEffect } from "react";

/**
 * Hook for CLI-style typing effect.
 * @param {string[]} lines - Array of strings to type out.
 * @param {number} typingSpeed - Speed of typing (ms per character).
 * @param {number} delayBetweenLines - Delay before typing the next line (ms).
 * @returns {string} typedText - Accumulated text typed out.
 */
const useCLITypingEffect = (lines, typingSpeed = 50, delayBetweenLines = 500) => {
  const [typedText, setTypedText] = useState(""); // The accumulated typed output
  const [currentLineIndex, setCurrentLineIndex] = useState(0); // Tracks which line is being typed

  useEffect(() => {
    if (currentLineIndex >= lines.length) return; // Stop when all lines are typed

    const currentLine = lines[currentLineIndex]; // Current line to type
    let charIndex = 0; // Tracks which character is being typed

    const typeCharacters = () => {
      if (charIndex < currentLine.length) {
        setTypedText((prev) => prev + currentLine[charIndex]); // Add the next character
        charIndex++;
        setTimeout(typeCharacters, typingSpeed); // Continue typing
      } else {
        setTypedText((prev) => prev + "\n"); // Move to the next line
        setTimeout(() => setCurrentLineIndex((prev) => prev + 1), delayBetweenLines); // Start next line
      }
    };

    typeCharacters();
  }, [currentLineIndex, lines, typingSpeed, delayBetweenLines]);

  return typedText;
};

export default useCLITypingEffect;
