const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", "./src/dashboard/views");

// Serve static files (e.g., CSS for dashboard)
app.use(express.static("./src/dashboard/public"));

// MongoDB Connection
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admin";
let db; // Store the MongoDB connection here

async function connectToDatabase() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    console.log("[DEBUG] Attempting to connect to MongoDB...");
    await client.connect();
    console.log("[DEBUG] Successfully connected to MongoDB!");
    db = client.db(); // Use the default database
  } catch (err) {
    console.error("[ERROR] Failed to connect to MongoDB:", err);
    process.exit(1); // Exit if the database connection fails
  }
}

// Middleware to Attach Database to Requests
app.use((req, res, next) => {
  if (!db) {
    console.error("[ERROR] Database connection not established.");
    return res.status(500).json({ error: "Database not connected." });
  }
  req.db = db; // Attach the database connection to the request object
  next();
});

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running and connected to MongoDB!" });
});

// Import and Use API Routes
const raffleRoutes = require("./src/routes/raffle.routes");
app.use("/api/raffles", raffleRoutes);

// Import and Use Dashboard Routes
const dashboardRoutes = require("./src/dashboard/dashboard.routes");
app.use("/dashboard", dashboardRoutes);

// Fallback Route
app.use((req, res) => {
  console.error(`[DEBUG] 404 Error: Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// Start the Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectToDatabase(); // Initialize the database connection
  app.listen(PORT, () => {
    console.log(`[DEBUG] Server is running on http://localhost:${PORT}`);
    console.log(`[DEBUG] API available at http://localhost:${PORT}/api/raffles`);
    console.log(`[DEBUG] Admin Dashboard available at http://localhost:${PORT}/dashboard`);
  });
}

startServer();
