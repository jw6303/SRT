import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchActiveRaffles } from "../../api";
import "./RaffleList.css";

const RaffleList = () => {
  const [raffles, setRaffles] = useState([]); // Stores all raffles
  const [displayedRaffles, setDisplayedRaffles] = useState([]); // For pagination
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [sortBy, setSortBy] = useState("time.start"); // Default sorting
  const [sortOrder, setSortOrder] = useState("asc"); // Default order
  const [page, setPage] = useState(1); // Current page
  const [limit] = useState(5); // Items per page
  const [totalRaffles, setTotalRaffles] = useState(0); // Total raffles count
  const [countdowns, setCountdowns] = useState({}); // Store countdowns for raffles

  // Fetch raffles on component load or when dependencies change
  useEffect(() => {
    const loadRaffles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchActiveRaffles({
          sortField: sortBy,
          sortOrder,
          page,
          limit,
        });

        console.log("API Response:", response); // Debugging
        setRaffles(response?.raffles || []); // All fetched raffles
        setTotalRaffles(response?.meta?.totalCount || 0); // Total count of raffles
      } catch (err) {
        setError("Failed to fetch raffles. Please try again later.");
        console.error("Error fetching raffles:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRaffles();
  }, [sortBy, sortOrder, page, limit]);

  // Sorting and pagination logic
  useEffect(() => {
    const sortedRaffles = [...raffles].sort((a, b) => {
      const aField = a[sortBy] || "";
      const bField = b[sortBy] || "";
      if (typeof aField === "string" && typeof bField === "string") {
        return sortOrder === "asc" ? aField.localeCompare(bField) : bField.localeCompare(aField);
      }
      return sortOrder === "asc" ? aField - bField : bField - aField;
    });

    const paginatedRaffles = sortedRaffles.slice((page - 1) * limit, page * limit);
    setDisplayedRaffles(paginatedRaffles);
  }, [raffles, sortBy, sortOrder, page, limit]);

  // Update countdowns for each raffle
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = {};
      displayedRaffles.forEach((raffle) => {
        const endTime = new Date(raffle.time?.end).getTime();
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
          newCountdowns[raffle._id] = "Raffle Ended";
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          newCountdowns[raffle._id] = `${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setCountdowns(newCountdowns);
    };

    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [displayedRaffles]);

  // Loading or error states
  if (loading) return <p className="terminal-loading">> Loading active raffles...</p>;
  if (error) return <p className="terminal-error">> {error}</p>;

  return (
    <div className="raffle-terminal">
      <h1 className="terminal-header">Active Raffles</h1>

      {/* Total Raffles */}
      <div className="raffle-summary">
        <p>> Total Active Raffles: {totalRaffles}</p>
      </div>

      {/* Sorting Controls */}
      <div className="controls">
        <label>
          Sort By:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="time.start">Start Time</option>
            <option value="prizeDetails.amount">Prize Amount</option>
            <option value="entryFee">Entry Fee</option>
          </select>
        </label>
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          Order: {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      {/* Render Raffles */}
      <div className="terminal-output">
        {displayedRaffles.length > 0 ? (
          displayedRaffles.map((raffle) => (
            <div key={raffle._id} className="raffle-entry">
              <p>> <span className="key">Raffle Name:</span> {raffle.raffleName || "N/A"}</p>
              <p>> <span className="key">Raffle ID:</span> {raffle.raffleId || "N/A"}</p>
              <p>> <span className="key">Entry Fee:</span> {raffle.entryFee || "N/A"} SOL</p>
              <p>> <span className="key">Prize Type:</span> {raffle.prizeDetails?.type || "N/A"}</p>
              <p>> <span className="key">Prize:</span> {raffle.prizeDetails?.title || "N/A"}</p>
              <p>> <span className="key">Participants:</span>
                {raffle.participants?.ticketsSold || 0} / {raffle.participants?.max || "N/A"}
              </p>
              <p>> <span className="key">End Time:</span> {new Date(raffle.time?.end).toLocaleString()}</p>
              <p>> <span className="key">Countdown:</span> {countdowns[raffle._id] || "Loading..."}</p>
              <Link to={`/raffles/${raffle._id}`} className="details-link">
                > View Details
              </Link>
            </div>
          ))
        ) : (
          <p className="terminal-info">No active raffles found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={displayedRaffles.length < limit}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RaffleList;
