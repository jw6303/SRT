import React from "react";
import { useRaffle } from "../../context/RaffleContext";
import "./RaffleList.styles.css";

const RaffleList = () => {
  const { raffles, loading, error, loadRaffleDetails } = useRaffle();

  if (loading) return <p>Loading raffles...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="raffle-list">
      {raffles.length === 0 ? (
        <p>No raffles available.</p>
      ) : (
        <ul>
          {raffles.map((raffle) => (
            <li
              key={raffle._id} // Use MongoDB `_id` as the unique key
              className="raffle-item"
              onClick={() => loadRaffleDetails(raffle._id)} // Load details on click
            >
              <h3>{raffle.raffleName}</h3>
              <p>Entry Fee: {raffle.entryFee} SOL</p>
              <p>Tickets Sold: {raffle.participants?.ticketsSold}/{raffle.participants?.max}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RaffleList;
