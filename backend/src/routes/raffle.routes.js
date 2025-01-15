const express = require("express");
const router = express.Router();
const {
  getActiveRaffles,
  getRaffleById,
  registerParticipant,
  getRaffleParticipants,
  concludeRaffle,
  extendRaffle,
  createRaffle,
  purchaseTicket, // Import the new purchaseTicket function
} = require("../controllers/raffle.controller");

// Get Active Raffles
router.get("/", getActiveRaffles);

// Get Raffle by ID
router.get("/:id", getRaffleById);

// Register Participant
router.post("/:id/register", registerParticipant);

// Get Raffle Participants
router.get("/:id/participants", getRaffleParticipants);

// Conclude a Raffle
router.post("/:id/conclude", concludeRaffle);

// Extend a Raffle
router.post("/:id/extend", extendRaffle);

// Create a Raffle
router.post("/", createRaffle);

// Purchase Ticket
router.post("/:id/purchase-ticket", purchaseTicket); // Add the new route here

module.exports = router;
