let retryAttempts = 0;
const maxRetries = 5;

export const initializeWebSocket = (raffleId, onNotification) => {
  const socket = new WebSocket(`ws://localhost:5000/ws/raffle/${raffleId}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
    retryAttempts = 0; // Reset retry attempts
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (onNotification) onNotification(data); // Handle incoming data
  };

  socket.onclose = () => {
    console.warn("WebSocket disconnected");
    if (retryAttempts < maxRetries) {
      retryAttempts++;
      setTimeout(() => initializeWebSocket(raffleId, onNotification), 2000);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket; // Return the socket instance if needed
};
