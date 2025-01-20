const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  const clients = new Map(); // Map to store connected clients and their subscribed raffle IDs

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message);

        // Handle subscription to a specific raffle
        if (parsedMessage.type === "subscribe" && parsedMessage.raffleId) {
          console.log(`Client subscribed to raffle: ${parsedMessage.raffleId}`);
          clients.set(ws, parsedMessage.raffleId);

          ws.send(
            JSON.stringify({
              type: "subscribed",
              message: `You are now subscribed to raffle ${parsedMessage.raffleId}`,
            })
          );
        }

        // Echo message for testing
        ws.send(JSON.stringify({ message: `Echo: ${message}` }));
      } catch (error) {
        console.error("Failed to parse message:", message);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      console.log("WebSocket closed");
      clients.delete(ws); // Remove client from the map
    });
  });

  // Function to broadcast updates to all clients subscribed to a specific raffle
  const broadcastToRaffle = (raffleId, data) => {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        clients.get(client) === raffleId
      ) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Mock example: Periodically broadcast updates for a specific raffle
  setInterval(() => {
    const mockRaffleId = "001"; // Example raffle ID
    const mockData = {
      type: "raffleUpdate",
      raffleId: mockRaffleId,
      ticketsSold: Math.floor(Math.random() * 50),
    };
    broadcastToRaffle(mockRaffleId, mockData);
  }, 10000);

  console.log("WebSocket server initialized");
};
