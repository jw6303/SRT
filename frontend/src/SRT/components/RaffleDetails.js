import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRaffleDetails, purchaseTicket } from "../../api";
import "./RaffleDetails.css";

const RaffleDetails = () => {
  const { raffleId } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [typedLog, setTypedLog] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [maxTickets, setMaxTickets] = useState(1);
  const [progress, setProgress] = useState(false);
  const logContainerRef = useRef(null);

  // Simulated CLI effect for logs
  useEffect(() => {
    let logIndex = 0;

    const typeLog = () => {
      if (logIndex < logs.length) {
        const currentLog = logs[logIndex];
        setTypedLog((prev) => prev + currentLog + "\n");
        logIndex++;
        setTimeout(typeLog, 50); // Typing speed
      }
    };

    typeLog();
  }, [logs]);

  // Fetch raffle details with "data dump" simulation
  useEffect(() => {
    const loadRaffleDetails = async () => {
      setLogs((prev) => [...prev, ">> Fetching raffle details..."]);
      try {
        const data = await fetchRaffleDetails(raffleId);
        setRaffle(data);

        const availableTickets = data.maxParticipants - data.ticketsSold;
        setMaxTickets(Math.min(availableTickets, 10));

        const raffleInfoDump = `
        >>> Raffle Details Loaded
        Raffle ID: ${data.raffleId}
        Prize Amount: ${data.prizeAmount} SOL
        Entry Fee: ${data.entryFee} SOL
        Tickets Sold: ${data.ticketsSold} / ${data.maxParticipants}
        Status: ${data.status}
        Prize Details: ${data.prizeDetails}
        >>> Data Complete.
        `;
        setTypedLog((prev) => prev + raffleInfoDump);
      } catch (error) {
        setLogs((prev) => [...prev, ">> [ERROR] Failed to fetch raffle details."]);
      }
    };

    loadRaffleDetails();
  }, [raffleId]);

  // Handle ticket purchase
  const handleBuyTicket = async () => {
    if (progress) return;
    setProgress(true);
    setLogs((prev) => [...prev, ">> Processing ticket purchase..."]);

    try {
      await purchaseTicket(raffleId, {
        participantId: "dynamic-participant-id",
        ticketCount,
      });
      setLogs((prev) => [...prev, `>> [SUCCESS] Purchased ${ticketCount} ticket(s)!`]);
    } catch (error) {
      setLogs((prev) => [...prev, ">> [ERROR] Ticket purchase failed."]);
    } finally {
      setProgress(false);
    }
  };

  // Auto-scroll log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [typedLog]);

  return (
    <div className="raffle-details-container">
      <div className="raffle-columns">
        {/* Left: Raffle Info */}
        <div className="raffle-info">
          <pre>
            <span className="cli-keyword">Raffle Details</span>
            {raffle ? (
              <>
                {"\n"}ID: {raffle.raffleId}
                {"\n"}Prize: {raffle.prizeAmount} SOL
                {"\n"}Entry Fee: {raffle.entryFee} SOL
                {"\n"}Tickets: {raffle.ticketsSold} / {raffle.maxParticipants}
                {"\n"}Status: {raffle.status}
              </>
            ) : (
              "Loading..."
            )}
          </pre>
          {raffle?.imageUrl && (
            <img src={raffle.imageUrl} alt="Raffle" className="raffle-image" />
          )}
        </div>

        {/* Right: Logs */}
        <div className="raffle-logs" ref={logContainerRef}>
          <pre>{typedLog}</pre>
        </div>
      </div>

      {/* Bottom: Question and Ticket Purchase */}
      <div className="raffle-question-purchase">
        <div>
          <pre>
            <span className="cli-keyword">Question</span>
            {"\n"}{raffle?.question || "Loading..."}
          </pre>
          <div className="answer-options">
            {raffle?.questionOptions?.map((option, index) => (
              <label key={index} className="answer-option">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  onChange={() => setSelectedAnswer(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div>
          <pre>
            <span className="cli-keyword">Select Tickets</span>
          </pre>
          <select
            value={ticketCount}
            onChange={(e) => setTicketCount(e.target.value)}
          >
            {[...Array(maxTickets)].map((_, i) => (
              <option key={i}>{i + 1}</option>
            ))}
          </select>
          <button onClick={handleBuyTicket} disabled={progress}>
            {progress ? "Processing..." : "Buy Tickets"}
          </button>
        </div>
      </div>

      <Link to="/" className="back-link">Back to Raffles</Link>
    </div>
  );
};

export default RaffleDetails;
