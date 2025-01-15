import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { sendTransactionToProgram } from "../../utils/solana";

const TicketCounter = ({ pool, ticketCount, setTicketCount, maxTickets }) => {
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleBuyTickets = async () => {
    if (!publicKey) {
      setErrorMessage("Please connect your wallet.");
      return;
    }

    if (ticketCount <= 0) {
      setErrorMessage("You must select at least 1 ticket.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const signature = await sendTransactionToProgram({
        pool,
        ticketCount,
        publicKey,
        sendTransaction,
      });

      alert(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage(error.message || "Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ margin: "20px 0", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
        <button
          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
          disabled={isProcessing}
        >
          -
        </button>
        <span>{ticketCount}</span>
        <button
          onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
          disabled={isProcessing}
        >
          +
        </button>
      </div>
      <button onClick={handleBuyTickets} disabled={isProcessing}>
        {isProcessing ? "Processing..." : `Buy ${ticketCount} Ticket(s)`}
      </button>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </div>
  );
};

export default TicketCounter;
