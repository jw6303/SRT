const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { createServer } = require("http"); // Create HTTP server for WebSocket support
const { Server } = require("socket.io"); // Import Socket.IO for WebSocket functionality
const logger = require("./src/utils/logger"); // Import Winston logger
require("dotenv").config();

const app = express();
const httpServer = createServer(app); // Wrap Express app with HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI || "mongodb+srv://bws:Passwordforthis2035!@solanaraffleterminal.xdyet.mongodb.net/<database-name>?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db;

async function connectToDatabase() {
  try {
    logger.info("Connecting to MongoDB...");
    await client.connect();
    logger.info("Successfully connected to MongoDB!");
    db = client.db("<database-name>"); // Replace <database-name> with your database name
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

// Attach WebSocket to Express Requests
app.use((req, res, next) => {
  req.io = io; // Attach WebSocket instance to `req` for use in controllers
  next();
});

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running and connected to MongoDB!" });
  logger.info("Base route accessed.");
});

// WebSocket Connection Event
io.on("connection", (socket) => {
  logger.info(`New WebSocket connection: ${socket.id}`);

  // Example: Join specific raffle room
  socket.on("joinRaffle", (raffleId) => {
    socket.join(`raffle-${raffleId}`);
    logger.info(`Socket ${socket.id} joined room: raffle-${raffleId}`);
  });

  // Example: Handle disconnections
  socket.on("disconnect", () => {
    logger.info(`Socket ${socket.id} disconnected.`);
  });
});

// Import and Use API Routes
const raffleRoutes = require("./src/routes/raffle.routes");
app.use("/api/raffles", (req, res, next) => {
  if (!db) {
    logger.error("Database not connected!");
    return res.status(500).json({ error: "Database connection not established." });
  }
  req.db = db; // Attach MongoDB connection to the request object
  next();
}, raffleRoutes);

// Fallback Route
app.use((req, res) => {
  logger.warn(`404 Error: Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Start the Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectToDatabase();
  httpServer.listen(PORT, () => { // Use httpServer to enable WebSocket support
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`API available at http://localhost:${PORT}/api/raffles`);
  });
}

startServer();
