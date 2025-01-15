// src/dashboard/dashboard.routes.js

const express = require("express");
const router = express.Router();
const { getAllRaffles, getRaffleById } = require("./dashboard.controller");

// Route: View all raffles
router.get("/", getAllRaffles);

// Route: View details of a specific raffle
router.get("/raffles/:id", getRaffleById);

module.exports = router;
