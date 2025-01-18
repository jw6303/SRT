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
  purchaseTicket,
  notifyParticipants,
  notifyAllParticipants,
  notifyParticipant,
  notifyWinner,
  notifyRefunds,
  getRaffleAnalytics, // Analytics route
} = require("../controllers/raffle.controller");

// Routes for raffle operations

// Fetch active raffles
router.get("/", getActiveRaffles);

// Fetch details of a specific raffle
router.get("/:id", getRaffleById);

// Register a participant
router.post("/:id/register", registerParticipant);

// Fetch participants for a specific raffle
router.get("/:id/participants", getRaffleParticipants);

// Conclude a raffle
router.post("/:id/conclude", concludeRaffle);

// Extend a raffle's end time
router.post("/:id/extend", extendRaffle);

// Create a new raffle
router.post("/", createRaffle);

// Purchase tickets for a raffle
router.post("/:id/purchase-ticket", purchaseTicket);

// Notifications for participants
router.post("/:id/notify", notifyParticipants);

// Notify all participants in a raffle
router.post("/:id/notify-all", notifyAllParticipants);

// Notify a specific participant
router.post("/:id/notify-participant", notifyParticipant);

// Notify the winner of the raffle
router.post("/:id/notify-winner", notifyWinner);

// Notify participants about refunds
router.post("/:id/notify-refunds", notifyRefunds);

// Fetch analytics for all raffles
router.get("/analytics", getRaffleAnalytics);

module.exports = router;
