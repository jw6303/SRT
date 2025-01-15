const express = require("express");
const path = require("path");
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Views folder relative to this file

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const dashboardRoutes = require("./dashboard.routes");

// Mount dashboard routes
app.use("/dashboard", dashboardRoutes);

module.exports = app;
