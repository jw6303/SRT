const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { 
  getAllRaffles, 
  getRaffleById, 
  createRaffle, 
  endRaffle 
} = require("./dashboard.controller");

// Render the dashboard overview
router.get("/", getAllRaffles);

// Render the form for creating a new raffle
router.get("/raffles/create", (req, res) => {
  res.render("createRaffle");
});

// Handle the submission of a new raffle
router.post("/raffles/create", createRaffle);

// View details of a specific raffle
router.get("/raffles/:id", getRaffleById);

// Handle ending a raffle
router.post("/raffles/:id/end", endRaffle);

// Generate a MongoDB-compliant ID
router.get("/generate-id", (req, res) => {
  try {
    const generatedId = new ObjectId(); // Generate a new MongoDB ObjectId
    res.json({ generatedId: generatedId.toString() });
  } catch (err) {
    console.error("[ERROR] Failed to generate MongoDB ID:", err);
    res.status(500).json({ error: "Failed to generate MongoDB ID" });
  }
});

module.exports = router;
