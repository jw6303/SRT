export const getLogStyle = (type) => {
    switch (type) {
      case "info":
        return {
          color: "#7FDBFF", // Cyan
          fontWeight: "normal",
        };
      case "success":
        return {
          color: "#00FF99", // Bright Green
          fontWeight: "bold",
        };
      case "error":
        return {
          color: "#FF4136", // Bright Red
          fontWeight: "bold",
        };
      case "warning":
        return {
          color: "#FFDC00", // Amber
          fontWeight: "bold",
        };
      default:
        return {
          color: "#FFFFFF", // White for unknown types
          fontWeight: "normal",
        };
    }
  };
  