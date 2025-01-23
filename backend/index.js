const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { createServer } = require("http");
const logger = require("./src/utils/logger");
const initializeWebSocket = require("./src/utils/websocket");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);

// CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", // Allow specific origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Enable credentials
};
app.use(cors(corsOptions)); // Apply CORS to all routes
app.options("*", cors(corsOptions)); // Handle preflight requests

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI || "your-mongodb-uri";
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  try {
    logger.info("Connecting to MongoDB...");
    await client.connect();
    logger.info("Successfully connected to MongoDB!");
    db = client.db("solana_raffle_terminal"); // Replace with your actual database name
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

// Attach WebSocket to requests
initializeWebSocket(httpServer);

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Raffle API!" });
});

// Import and use routes
const raffleRoutes = require("./src/routes/raffle.routes");
app.use(
  "/api/raffles",
  (req, res, next) => {
    if (!db) {
      logger.error("Database not connected!");
      return res.status(500).json({ error: "Database connection not established." });
    }
    req.db = db;
    next();
  },
  raffleRoutes
);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
async function startServer() {
  await connectToDatabase();
  httpServer.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
}
startServer();
