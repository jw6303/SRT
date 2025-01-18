const express = require("express");
const router = express.Router();
const {
  getActiveRaffles,
  getRaffleById,
  createRaffle, // Using your provided `createRaffle` controller
  registerParticipant,
  getRaffleParticipants,
  concludeRaffle,
  extendRaffle,
  purchaseTicket,
  getRaffleAnalytics,
} = require("../controllers/raffle.controller");

// Fetch all active raffles
router.get("/", getActiveRaffles);

// Fetch details of a specific raffle by ID
router.get("/:id", getRaffleById);

// Create a new raffle
router.post("/", createRaffle); // Ensure frontend is hitting POST /api/raffles correctly

// Register a participant for a raffle
router.post("/:id/register", registerParticipant);

// Fetch all participants of a specific raffle
router.get("/:id/participants", getRaffleParticipants);

// Conclude an ongoing raffle
router.post("/:id/conclude", concludeRaffle);

// Extend a raffle's duration
router.post("/:id/extend", extendRaffle);

// Purchase tickets for a raffle
router.post("/:id/purchase-ticket", purchaseTicket);

// Fetch analytics for all raffles
router.get("/analytics", getRaffleAnalytics);

module.exports = router;
