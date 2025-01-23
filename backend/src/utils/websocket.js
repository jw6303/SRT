const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  const clients = new Map(); // Map to store connected clients and their subscribed raffle IDs

  // Keep connections alive using ping-pong
  const pingInterval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("connection", (ws, req) => {
    console.log(`New WebSocket connection from ${req.socket.remoteAddress}`);
    ws.isAlive = true; // Mark the connection as alive

    ws.on("pong", () => {
      ws.isAlive = true; // Mark as alive on pong response
    });

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
      } catch (error) {
        console.error("Failed to parse message:", message);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      console.log(`WebSocket connection closed for raffle ${clients.get(ws)}`);
      clients.delete(ws); // Remove client from the map
    });

    ws.onerror = (error) => {
      console.error("WebSocket error:", error.message);
    };
  });

  // Cleanup on server close
  wss.on("close", () => {
    clearInterval(pingInterval);
    console.log("WebSocket server closed");
  });

  // Function to broadcast updates to all clients subscribed to a specific raffle
  const broadcastToRaffle = (raffleId, data) => {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        clients.get(client) === raffleId
      ) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          console.error(`Failed to send message to client: ${error.message}`);
        }
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

  return broadcastToRaffle; // Export the broadcast function for use elsewhere
};
