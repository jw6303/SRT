import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react"; // Import wallet adapter
import { syntaxHighlight } from "../utils/syntaxHighlighter";
import { sendTransactionToProgram } from "../utils/solana";
import "./TerminalProgressBar.css";

const Modal = ({ pool, onClose }) => {
  const { publicKey, sendTransaction, connected } = useWallet(); // Get wallet info
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [warning, setWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(""); // Live draw countdown

  // Dynamic Data
  const ticketsSold = pool.ticketsSold || 0;
  const remainingTickets = pool.totalTickets - ticketsSold;
  const progress = (ticketsSold / pool.totalTickets) * 100;

  // Handle Confirm Button Logic
  const handleConfirm = async () => {
    if (!connected) {
      setErrorMessage("Please connect your wallet to proceed.");
      return;
    }

    if (!selectedAnswer) {
      setWarning(true);
      setTimeout(() => setWarning(false), 3000);
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Send transaction to the Solana program
      await sendTransactionToProgram({
        pool,
        ticketCount,
        publicKey,
        sendTransaction,
      });

      alert(
        `Successfully purchased ${ticketCount} ticket(s) for "${pool.name}"!`
      );
      onClose(); // Close modal after transaction
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage(
        error.message || "Transaction failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSliderChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setTicketCount(value);
  };

  // Calculate time remaining for the live draw
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const drawTime = new Date(pool.endTime);
      const diff = drawTime - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [pool.endTime]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {/* Pool Image */}
        <img src={pool.image} alt={pool.name} style={styles.image} />

        {/* Pool Details */}
        <h2 style={styles.title}>{pool.name}</h2>
        <div style={styles.section}>
          <p style={styles.detail}>
            <strong>Live Draw:</strong>{" "}
            {timeRemaining === "Expired" ? "Expired" : timeRemaining}
          </p>
          <p style={styles.detail}>
            <strong>Tickets Sold:</strong> {ticketsSold} / {pool.totalTickets}
          </p>
          <p style={styles.detail}>
            <strong>Remaining Tickets:</strong> {remainingTickets}
          </p>
          <p style={styles.detail}>
            <strong>Ticket Cost:</strong> {pool.priceInSol} SOL
          </p>

          {/* Progress Bar Section */}
          <div className="terminal-progress-bar" style={styles.progressBar}>
            <div
              className="terminal-progress-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: progress > 75 ? "#28a745" : "#007BFF",
              }}
            />
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Question Section */}
        <div style={styles.section}>
          <p style={styles.question}>
            <strong>What is the capital city of England?</strong>
          </p>
          <div style={styles.answerOptions}>
            {["Belfast", "London", "Dublin"].map((answer, index) => (
              <button
                key={index}
                style={{
                  ...styles.answerButton,
                  backgroundColor:
                    selectedAnswer === answer ? "#007BFF" : "#ddd",
                  color: selectedAnswer === answer ? "#fff" : "#000",
                }}
                onClick={() => setSelectedAnswer(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Ticket Selection Section */}
        <div style={styles.section}>
          <p>
            <strong>{syntaxHighlight("number", ticketCount)} Tickets</strong>
          </p>
          <input
            type="range"
            min="1"
            max={pool.entryCap}
            value={ticketCount}
            onChange={handleSliderChange}
            style={styles.slider}
          />
          <div style={styles.ticketButtons}>
            <button
              style={styles.ticketButton}
              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
            >
              -
            </button>
            <button
              style={styles.ticketButton}
              onClick={() =>
                setTicketCount(Math.min(pool.entryCap, ticketCount + 1))
              }
            >
              +
            </button>
          </div>
        </div>

        {/* Warnings and Errors */}
        {warning && (
          <p style={styles.warningText}>
            Please select an answer to proceed.
          </p>
        )}

        {errorMessage && (
          <p style={styles.errorMessage}>
            <strong>Error:</strong> {errorMessage}
          </p>
        )}

        {/* Confirm Button */}
        <button
          style={styles.confirmButton}
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Buy Tickets"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#1E1E1E",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "500px",
    width: "90%", // Mobile-friendly width
    color: "#CCCCCC",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "20px",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "auto", // Ensures responsive scaling
    maxHeight: "300px", // Limits height on mobile
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: "15px",
  },
  section: {
    marginBottom: "20px",
  },
  detail: {
    fontSize: "14px",
    marginBottom: "10px",
  },
  progressBar: {
    height: "10px", // Mobile-friendly height
    backgroundColor: "#444",
    borderRadius: "5px",
    overflow: "hidden",
    marginTop: "10px",
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    margin: "20px 0",
  },
  slider: {
    width: "100%",
    margin: "10px 0",
  },
  ticketButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  ticketButton: {
    padding: "10px",
    backgroundColor: "#333",
    border: "1px solid #555",
    borderRadius: "5px",
    color: "#FFF",
    cursor: "pointer",
  },
  warningText: {
    color: "#FF0000",
    fontSize: "14px",
    marginTop: "10px",
  },
  errorMessage: {
    color: "#FF0000",
    fontSize: "14px",
    marginTop: "10px",
  },
  confirmButton: {
    padding: "12px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%", // Full-width for mobile
  },
};

export default Modal;
