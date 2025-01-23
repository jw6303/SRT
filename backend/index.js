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
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error(`CORS policy does not allow access from ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
    db = client.db("solana_raffle_terminal");
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

  const serverEnvironment = process.env.NODE_ENV || "development";
  const serverURL =
    serverEnvironment === "production" && process.env.HOSTNAME
      ? `https://${process.env.HOSTNAME}`
      : `http://localhost:${PORT}`;
  
  httpServer.listen(PORT, () => {
    logger.info(`Server is running in ${serverEnvironment} mode at ${serverURL}`);
  });
}

startServer();
