const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Log errors to a file
    new transports.File({ filename: "logs/combined.log" }), // Log all messages to a file
  ],
});

module.exports = logger;
