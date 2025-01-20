import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { fetchRaffleDetails, purchaseTicket, fetchRaffleTransactions } from "../../api";
import { getLogStyle } from "../utils/logStyling";
import ConnectWalletButton from "../components/ConnectWalletButton";
import "./RaffleDetails.css";




const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null); // Store raffle details
  const [logs, setLogs] = useState([]); // Store activity logs
  const [selectedAnswer, setSelectedAnswer] = useState(""); // Selected question answer
  const [ticketCount, setTicketCount] = useState(1); // Tickets to purchase
  const [maxTickets, setMaxTickets] = useState(1); // Maximum available tickets
  const [progress, setProgress] = useState(false); // Show progress during purchase
  const [countdown, setCountdown] = useState(""); // Countdown timer
  const logContainerRef = useRef(null); // For auto-scrolling logs
  const [transactions, setTransactions] = useState([]); // Start with an empty array
  const [txnError, setTxnError] = useState(null);
  const [txnLoading, setTxnLoading] = useState(true);  



 // Wallet connection state
 const { connected, publicKey } = useWallet();
 const [balance, setBalance] = useState(null);
 const connection = new Connection("https://api.devnet.solana.com");

 // Fetch wallet balance
 useEffect(() => {
   const fetchBalance = async () => {
     if (!connected || !publicKey) {
       setBalance(null);
       return;
     }

     try {
       const balanceInLamports = await connection.getBalance(publicKey);
       const balanceInSol = balanceInLamports / 1e9;
       setBalance(balanceInSol.toFixed(2));
     } catch (error) {
       console.error("Error fetching wallet balance:", error);
     }
   };

   fetchBalance();
 }, [connected, publicKey]);


// Fetch Transactions
useEffect(() => {
  const loadTransactions = async () => {
    try {
      const data = await fetchRaffleTransactions(raffleId);
      setTransactions(data); // Ensure this API returns an array
    } catch (err) {
      setTxnError("Failed to load transactions.");
    } finally {
      setTxnLoading(false);
    }
  };

  loadTransactions();
}, [raffleId]);
  



  // Fetch raffle details
  useEffect(() => {
    const loadRaffleDetails = async () => {
      setLogs((prev) => [
        ...prev,
        { type: "info", message: "Fetching raffle details...", logTime: new Date().toISOString() },
      ]);

      try {
        const data = await fetchRaffleDetails(raffleId);
        setRaffle(data.data); // Assuming the API returns the raffle under `data`

        const availableTickets = Math.max(
          0,
          (data.data.participants?.max || 0) - (data.data.participants?.ticketsSold || 0)
        );
        setMaxTickets(Math.min(availableTickets, 10));

        setLogs((prev) => [
          ...prev,
          { type: "success", message: "Raffle details loaded successfully.", logTime: new Date().toISOString() },
        ]);
      } catch (error) {
        setLogs((prev) => [
          ...prev,
          { type: "error", message: "Failed to fetch raffle details.", logTime: new Date().toISOString() },
        ]);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  // Countdown Timer
  useEffect(() => {
    if (raffle?.time?.end) {
      const timer = setInterval(() => {
        const now = new Date();
        const endTime = new Date(raffle.time.end);
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
          clearInterval(timer);
          setCountdown("Raffle Ended");
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [raffle?.time?.end]);

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (!selectedAnswer) {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: "Please select an answer before purchasing tickets.", logTime: new Date().toISOString() },
      ]);
      return;
    }

    if (progress) {
      setLogs((prev) => [
        ...prev,
        { type: "info", message: "Ticket purchase is already in progress.", logTime: new Date().toISOString() },
      ]);
      return;
    }

    setProgress(true);
    setLogs((prev) => [
      ...prev,
      { type: "info", message: `Purchasing ${ticketCount} ticket(s)...`, logTime: new Date().toISOString() },
    ]);

    try {
      await purchaseTicket(raffleId, { participantId: "user123", ticketCount });
      setLogs((prev) => [
        ...prev,
        { type: "success", message: `${ticketCount} ticket(s) purchased successfully!`, logTime: new Date().toISOString() },
      ]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        { type: "error", message: "Failed to purchase tickets. Please try again.", logTime: new Date().toISOString() },
      ]);
    } finally {
      setProgress(false);
    }
  };

  // Auto-scroll log box
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);


  return (
    <div className="raffle-details-container">
      {/* Wallet Section */}
      <div className="wallet-section">
        <ConnectWalletButton />
        {connected ? (
          <div className="wallet-info">
            <p>
              <strong>Connected as:</strong>{" "}
              <span>{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</span>
            </p>
            <p>
              <strong>Balance:</strong>{" "}
              <span>{balance !== null ? `${balance} SOL` : "Loading..."}</span>
            </p>
          </div>
        ) : (
          <p className="wallet-error">Please connect your wallet to view details.</p>
        )}
      </div>
  
      {/* Divider */}
      <div className="divider" />
  
      {/* Raffle Info Section */}
      {raffle ? (
        <div className="raffle-info-container">
          {/* Text Section */}
          <div className="raffle-info-text">
            <h2>Raffle Details</h2>
            <pre>
              > Raffle Name: {raffle.raffleName || "N/A"}
              {"\n"}> Raffle ID: {raffle.raffleId || "N/A"}
              {"\n"}> Entry Fee: {raffle.entryFee || "N/A"} SOL
              {"\n"}> Prize Type: {raffle.prizeDetails?.type || "N/A"}
              {"\n"}> Prize: {raffle.prizeDetails?.title || "N/A"}
              {"\n"}> Participants: {raffle.participants?.ticketsSold || 0} / {raffle.participants?.max || "N/A"}
              {"\n"}> Start Time: {raffle.time?.start ? new Date(raffle.time.start).toLocaleString() : "N/A"}
              {"\n"}> End Time: {raffle.time?.end ? new Date(raffle.time.end).toLocaleString() : "N/A"}
              {"\n"}> Countdown: {countdown || "N/A"}
            </pre>
          </div>
  
          {/* Image Section */}
          {raffle.prizeDetails?.imageUrl && (
            <div className="raffle-info-image">
              <img
                src={raffle.prizeDetails.imageUrl}
                alt={`Prize for ${raffle.raffleName}`}
              />
            </div>
          )}
        </div>
      ) : (
        <p className="loading-message">Loading raffle details...</p>
      )}
  
      {/* Question Section */}
      <div className="raffle-question">
        <h3>Question</h3>
        {raffle?.question?.text ? (
          <>
            <p className="question-text">{raffle.question.text}</p>
            <div className="answer-options">
              {raffle.question.options.map((option, index) => (
                <label key={index} className="answer-option">
                  <input
                    type="radio"
                    name="question"
                    value={option}
                    onChange={() => setSelectedAnswer(option)}
                    checked={selectedAnswer === option}
                  />
                  {option}
                </label>
              ))}
            </div>
            {selectedAnswer && (
              <p className="selected-answer">
                Selected Answer: <strong>{selectedAnswer}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="no-question">No question available for this raffle.</p>
        )}
      </div>
  
      {/* Ticket Purchase Section */}
      <div className="raffle-purchase">
        <label>
          Tickets:
          <select
            value={ticketCount}
            onChange={(e) => setTicketCount(Number(e.target.value))}
          >
            {[...Array(maxTickets)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleBuyTicket} disabled={progress}>
          {progress ? "Processing..." : "Buy Tickets"}
        </button>
      </div>
  
      {/* Activity Logs */}
      <div className="raffle-logs" ref={logContainerRef}>
        <h3>Activity Logs</h3>
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} style={getLogStyle(log.type)}>
              [{new Date(log.logTime).toLocaleTimeString()}] {log.message}
            </div>
          ))
        ) : (
          <p>No logs available.</p>
        )}
      </div>
  
      {/* Transactions Section */}
      <div className="raffle-transactions">
        <h3>Transactions</h3>
        {txnLoading ? (
          <p className="terminal-loading">> Loading transactions...</p>
        ) : txnError ? (
          <p className="txn-error">> {txnError}</p>
        ) : transactions.length > 0 ? (
          <table className="txn-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Tickets</th>
                <th>Wallet</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index}>
                  <td>
                    {txn.timestamp
                      ? new Date(txn.timestamp).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{txn.type || "N/A"}</td>
                  <td>{txn.tickets || 0}</td>
                  <td>
                    {txn.pubkey
                      ? `${txn.pubkey.slice(0, 4)}...${txn.pubkey.slice(-4)}`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-transactions">> No transactions found.</p>
        )}
      </div>
  
      {/* Back Link */}
      <div className="back-link-container">
        <Link to="/" className="back-link">
          Back to Raffles
        </Link>
      </div>
    </div>
  );
  
  
  
  
  };
  
  export default RaffleDetails;
  