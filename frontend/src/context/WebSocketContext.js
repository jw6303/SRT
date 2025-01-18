import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const connectWebSocket = (raffleId, onNotification) => {
    if (!raffleId) return;

    socketRef.current = new WebSocket(`ws://localhost:5000/ws/raffle/${raffleId}`);

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
