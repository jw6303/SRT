// syntax.js
const fontRules = {
    fonts: {
      heading: "'Orbitron', sans-serif", // Neon-inspired for titles
      body: "'Fira Code', monospace",   // Clean terminal-inspired font for body
      emphasis: "'Fira Code', monospace", // Used for important text like Entry Fee/Prize
    },
    colors: {
      terminalBackground: "#121212",
      panelBackground: "#2c2c2c",
      textPrimary: "#ffffff",
      textSecondary: "#e5e5e5",
      accent: "#e012c1",
      info: "#2cb8d1",
      warning: "#deb137",
      error: "#ff4500",
      border: "#3c3c3c",
    },
    textStyles: {
      title: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: "1.2rem",
        color: "#ffffff",
        textTransform: "uppercase",
      },
      body: {
        fontFamily: "'Fira Code', monospace",
        fontSize: "0.9rem",
        fontWeight: 400,
        color: "#e5e5e5",
      },
      highlight: {
        entryFee: {
          fontFamily: "'Fira Code', monospace",
          fontSize: "1rem",
          fontWeight: 700,
          color: "#e012c1", // Neon pink
        },
        prize: {
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "1rem",
          fontWeight: 700,
          color: "#2cb8d1", // Teal
        },
      },
    },
  };
  
  export default fontRules;
  