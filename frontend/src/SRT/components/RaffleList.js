import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchActiveRaffles } from "../../api";
import "./RaffleList.css";

const RaffleList = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  

  useEffect(() => {
    const loadRaffles = async () => {
      try {
        const activeRaffles = await fetchActiveRaffles();
        setRaffles(activeRaffles || []);
      } catch (err) {
        setError("Failed to fetch raffles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadRaffles();
  }, []);

  if (loading) return <p className="terminal-loading">> Loading active raffles...</p>;
  if (error) return <p className="terminal-error">> {error}</p>;

  return (
    <div className="raffle-terminal">
      <h1 className="terminal-header">Active Raffles</h1>
      <div className="terminal-output">
        {raffles.length > 0 ? (
          raffles.map((raffle) => (
            <div key={raffle._id} className="raffle-entry">
              <p>> <span className="key">Raffle ID:</span> {raffle.raffleId}</p>
              <p>> <span className="key">Entry Fee:</span> {raffle.entryFee} SOL</p>
              <p>> <span className="key">Prize Amount:</span> {raffle.prizeAmount} SOL</p>
              <p>> <span className="key">Participants:</span> {raffle.participantsCorrect.length + raffle.participantsIncorrect.length}</p>
              
              <Link to={`/raffles/${raffle._id}`} className="details-link">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="terminal-info">No active raffles found.</p>
        )}
      </div>
    </div>
  );
};

export default RaffleList;
