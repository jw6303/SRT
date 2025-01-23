import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const connectWebSocket = (raffleId, onNotification) => {
    if (!raffleId) return;

    // Dynamically set WebSocket URL
    const WS_BASE_URL = process.env.REACT_APP_WS_URL || "ws://localhost:5000";

    socketRef.current = new WebSocket(`${WS_BASE_URL}/ws/raffle/${raffleId}`);

    socketRef.current.onopen = () => console.log("WebSocket connected");
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (onNotification) onNotification(data);
    };
    socketRef.current.onclose = () => console.log("WebSocket disconnected");
    socketRef.current.onerror = (error) => console.error("WebSocket error:", error);
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    return () => disconnectWebSocket(); // Cleanup on unmount
  }, []);

  return (
    <WebSocketContext.Provider value={{ connectWebSocket, disconnectWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};
