import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchActiveRaffles, fetchRaffleDetails } from "../../../api"; // Adjust the relative path

const RaffleContext = createContext();

export const RaffleProvider = ({ children }) => {
  // State for all raffles
  const [raffles, setRaffles] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 }); // Metadata for pagination

  // State for a selected raffle
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all raffles with optional filters and pagination
   * @param {Object} options - Filtering and pagination options
   */
  const loadRaffles = async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { raffles, meta } = await fetchActiveRaffles(options); // Fetch raffles from API
      setRaffles(raffles);
      setMeta(meta); // Update pagination metadata
    } catch (err) {
      setError(err.message || "Failed to load raffles.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch details for a specific raffle by ID
   * @param {string} id - The ID of the raffle to fetch
   */
  const loadRaffleDetails = async (id) => {
    if (!id) {
      setError("Raffle ID is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await fetchRaffleDetails(id); // Fetch details for a specific raffle
      setSelectedRaffle(data); // Update selected raffle state
    } catch (err) {
      setError(err.message || "Failed to load raffle details.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the selected raffle
   */
  const resetSelectedRaffle = () => {
    setSelectedRaffle(null);
  };

  /**
   * Fetch all raffles on initial render
   */
  useEffect(() => {
    loadRaffles(); // Default: fetch the first page with default limit
  }, []);

  return (
    <RaffleContext.Provider
      value={{
        raffles,
        meta,
        selectedRaffle,
        loading,
        error,
        loadRaffles,
        loadRaffleDetails,
        resetSelectedRaffle,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffle = () => useContext(RaffleContext);
