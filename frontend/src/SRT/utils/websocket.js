let retryAttempts = 0;
const maxRetries = 5;

export const initializeWebSocket = (raffleId, onNotification) => {
  if (!raffleId) {
    console.error("Raffle ID is required to initialize WebSocket.");
    return null;
  }

  const socket = new WebSocket(`ws://localhost:5000/ws/raffle/${raffleId}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
    retryAttempts = 0; // Reset retry attempts

    // Subscribe to the raffle
    const subscriptionMessage = JSON.stringify({
      type: "subscribe",
      raffleId,
    });
    socket.send(subscriptionMessage);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      if (onNotification) onNotification(data); // Trigger the callback with the data
    } catch (error) {
      console.error("Failed to parse WebSocket message:", event.data);
    }
  };

  socket.onclose = (event) => {
    console.warn("WebSocket disconnected", event.reason || "");
    if (retryAttempts < maxRetries) {
      retryAttempts++;
      console.log(`Retrying WebSocket connection (${retryAttempts}/${maxRetries})...`);
      setTimeout(() => initializeWebSocket(raffleId, onNotification), 2000);
    } else {
      console.error("Max retries reached. Could not reconnect WebSocket.");
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket; // Return the WebSocket instance
};
