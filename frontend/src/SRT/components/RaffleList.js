import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchActiveRaffles } from "../../api";
import "./RaffleList.css";

const RaffleList = () => {
  const [raffles, setRaffles] = useState([]);
  const [displayedRaffles, setDisplayedRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("time.start");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Static limit
  const [totalRaffles, setTotalRaffles] = useState(0);

  // Fetch all raffles initially
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

  // Handle sorting and pagination
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
              <p>> <span className="key">Raffle ID:</span> {raffle.raffleId}</p>
              <p>> <span className="key">Entry Fee:</span> {raffle.entryFee || "N/A"} SOL</p>
              <p>> <span className="key">Prize Amount:</span> {raffle.prizeDetails?.amount || "N/A"} SOL</p>
              <p>> <span className="key">Participants:</span>
                {raffle.participants?.ticketsSold || 0} / {raffle.participants?.max || "N/A"}
              </p>
              <p>> <span className="key">End Time:</span> {new Date(raffle.time?.end).toLocaleString()}</p>
              {raffle.imageUrl && (
                <p>> <span className="key">Image:</span>
                  <img
                    src={raffle.imageUrl}
                    alt={`Raffle ${raffle.raffleId}`}
                    className="raffle-image"
                  />
                </p>
              )}
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
