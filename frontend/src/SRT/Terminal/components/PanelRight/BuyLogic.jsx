import React, { useState, useEffect } from "react";
import { useLogs } from "../../../../context/LogContext";
import { useRaffle } from "../../context/RaffleContext";
import CLIShippingForm from "../../../components/CLIShippingForm";
import "../../Terminal.styles.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const COOLDOWN_TIME = 10 * 1000;
const OWNERSHIP_CAP_PERCENTAGE = 0.1;
const BUSINESS_WALLET_ADDRESS = "RiNv49qHTyD42fZ2SRwqqnGjZLbi5dP8ub2Nj9RLr3c";

// Alchemy RPC URLs (HTTP & WebSocket)
const ALCHEMY_HTTP_RPC = "https://solana-devnet.g.alchemy.com/v2/pseVdFLkUV2LXg-uoYqUfodPinyEEeBD";
const ALCHEMY_WS_RPC = "wss://solana-devnet.g.alchemy.com/v2/pseVdFLkUV2LXg-uoYqUfodPinyEEeBD";

const connection = new Connection(ALCHEMY_HTTP_RPC, {
  commitment: "confirmed",
  wsEndpoint: ALCHEMY_WS_RPC, // Ensure WebSocket connection works properly
});


const BuyLogic = () => {
  const { selectedRaffle } = useRaffle();
  const { addLog } = useLogs();
  const wallet = useWallet();

  const [ticketCount, setTicketCount] = useState(1);
  const [progress, setProgress] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shippingInfo, setShippingInfo] = useState({});
  const [isShippingProvided, setIsShippingProvided] = useState(false);
  const [maxTickets, setMaxTickets] = useState(1);
  const [collapsedSections, setCollapsedSections] = useState({
    prize: false,
    tickets: false,
    selection: false,
    question: false,
    shipping: false,
  });

  const { prizeDetails = {}, participants = {}, question = {} } = selectedRaffle || {};
  const totalTickets = participants.max || 0;
  const ticketsSold = participants.ticketsSold || 0;
  const remainingTickets = totalTickets - ticketsSold;
  const isQuestionRequired = !!question.text;
  const isShippingRequired = prizeDetails.requiresShipping;
  const chainType = prizeDetails.type === "onChain" ? "onChain" : "offChain";

  const calculateUserMaxTickets = () => {
    const userTicketsOwned = participants.tickets?.filter((p) => p.participantId === wallet.publicKey?.toBase58()).length || 0;
    return Math.min(Math.floor(totalTickets * OWNERSHIP_CAP_PERCENTAGE) - userTicketsOwned, remainingTickets);
  };

  useEffect(() => {
    if (selectedRaffle) {
      setMaxTickets(calculateUserMaxTickets());
      setTicketCount(1);
    }
  }, [selectedRaffle, ticketsSold, remainingTickets]);

  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTicketCountChange = (value) => {
    if (value > remainingTickets) {
      addLog("Invalid ticket count. Please select a valid amount.", "error");
      return;
    }
    setTicketCount(value);
    addLog(`You selected ${value} ticket(s).`, "info");
  };

  const handleShippingSubmit = (info) => {
    setShippingInfo(info);
    setIsShippingProvided(true);
    addLog("Shipping details provided successfully.", "success");
  };

  let ws;

  const handleBuyTicket = async () => {
    if (!wallet || !wallet.connected) {
      addLog("Please connect your wallet first.", "error");
      return;
    }

    if (ticketCount < 1 || ticketCount > maxTickets || ticketCount > remainingTickets) {
      addLog("Invalid ticket count. Please select a valid amount.", "error");
      return;
    }

    if (isQuestionRequired && !selectedAnswer) {
      addLog("You must answer the question before purchasing.", "error");
      return;
    }

    if (isShippingRequired && !isShippingProvided) {
      addLog("Please provide shipping details before purchasing.", "error");
      return;
    }

    setProgress(true);

    try {
      const sender = wallet.publicKey;
      const recipient = new PublicKey(BUSINESS_WALLET_ADDRESS);
      const amountInLamports = ticketCount * selectedRaffle.entryFee * 1e9;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: amountInLamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      const signedTransaction = await wallet.signTransaction(transaction);
      const rawTransaction = signedTransaction.serialize();
      const signature = await connection.sendRawTransaction(rawTransaction);

      addLog(`Transaction submitted! Tx Hash: ${signature}`, "info");

      // Close any previous WebSocket connection
      if (ws) ws.close();

      ws = new WebSocket(ALCHEMY_WS_RPC);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "signatureSubscribe",
          params: [signature, { commitment: "confirmed" }],
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === "signatureNotification") {
          ws.close();
          addLog(`✅ Transaction confirmed! Tx Hash: ${signature}`, "success");
        }
      };

      ws.onerror = (error) => {
        addLog(`WebSocket error: ${error.message}`, "error");
        ws.close();
      };

    } catch (error) {
      addLog(`Transaction failed: ${error.message}`, "error");
    } finally {
      setProgress(false);
    }
  };

  return (
    <div className="buy-logic">
      {!selectedRaffle ? (
        <p className="no-raffle">Select a raffle to start buying tickets.</p>
      ) : (
        <>
          <h3 className="section-title tree-key">Buy Tickets</h3>
  
          {/* Prize Section */}
          <div className="tree-branch">
            <h3 className="section-title" onClick={() => toggleCollapse("prize")}>
              Prize {collapsedSections["prize"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["prize"] && (
              <ul className="tree-sublist">
                <li><span className="tree-key">Prize:</span> {prizeDetails.title || "N/A"}</li>
                <li><span className="tree-key">Entry Fee:</span> {selectedRaffle.entryFee || "0"} SOL</li>
                <li><span className="tree-key">On-Chain Status:</span> {chainType === "onChain" ? "Yes" : "No"}</li>
              </ul>
            )}
          </div>
  
          {/* Ticket Availability Section */}
          <div className="tree-branch">
            <h3 className="section-title" onClick={() => toggleCollapse("tickets")}>
              Ticket Availability {collapsedSections["tickets"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["tickets"] && (
              <ul className="tree-sublist">
                <li><span className="tree-key">Tickets Sold:</span> {ticketsSold}/{totalTickets}</li>
                <li><span className="tree-key">Tickets Remaining:</span> {remainingTickets}</li>
              </ul>
            )}
          </div>
  
          {/* Ticket Selection Section */}
          <div className="tree-branch">
            <h3 className="section-title" onClick={() => toggleCollapse("selection")}>
              Select Tickets {collapsedSections["selection"] ? "▶" : "▼"}
            </h3>
            {!collapsedSections["selection"] && (
              <div className="ticket-buttons">
                {[...Array(Math.min(10, remainingTickets))].map((_, i) => (
                  <button key={i} className={`ticket-button ${ticketCount === i + 1 ? "selected" : ""}`} onClick={() => handleTicketCountChange(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button className="bulk-button" onClick={() => handleTicketCountChange(remainingTickets)}>
                  Max
                </button>
              </div>
            )}
          </div>
  
          {/* Question Section */}
          {isQuestionRequired && (
            <div className="tree-branch">
              <h3 className="section-title" onClick={() => toggleCollapse("question")}>
                Question {collapsedSections["question"] ? "▶" : "▼"}
              </h3>
              {!collapsedSections["question"] && (
                <ul className="tree-sublist">
                  <li><span className="tree-key">Question:</span> {question.text}</li>
                  {question.options?.map((option, index) => (
                    <label key={index} className="answer-option">
                      <input
                        type="radio"
                        name="question"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => {
                          setSelectedAnswer(option);
                          addLog(`Answer selected: ${option}`, "info");
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </ul>
              )}
            </div>
          )}
  
          {/* Shipping Section */}
          {isShippingRequired && (
            <div className="tree-branch">
              <h3 className="section-title" onClick={() => toggleCollapse("shipping")}>
                Shipping Information {collapsedSections["shipping"] ? "▶" : "▼"}
              </h3>
              {!collapsedSections["shipping"] && (
                <CLIShippingForm onSubmit={handleShippingSubmit} />
              )}
            </div>
          )}
  
          {/* Buy Button */}
          <button
            onClick={handleBuyTicket}
            disabled={progress || (isQuestionRequired && !selectedAnswer) || (isShippingRequired && !isShippingProvided)}
            className="tree-toggle"
          >
            {progress ? "Processing..." : `Buy ${ticketCount} Ticket(s)`}
          </button>
        </>
      )}
    </div>
  );
  };

export default BuyLogic;
