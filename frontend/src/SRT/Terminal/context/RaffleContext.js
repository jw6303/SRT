import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchActiveRaffles, fetchRaffleDetails } from "../../../api"; // Adjust the relative path

const RaffleContext = createContext();

export const RaffleProvider = ({ children }) => {
  // State for all raffles
  const [raffles, setRaffles] = useState([]);
  const [filteredRaffles, setFilteredRaffles] = useState([]); // Raffles after applying filters
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  // State for a selected raffle
  const [selectedRaffle, setSelectedRaffle] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    endingSoon: false,
    capacity: "",
    threshold: "",
    newRaffles: false,
  });

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
      setFilteredRaffles(raffles); // Initially, show all raffles
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
   * Apply filters to raffles
   */
  const applyFilters = () => {
    let filtered = [...raffles];

    // Raffles ending soon
    if (filters.endingSoon) {
      filtered = filtered.sort((a, b) => new Date(a.time.end) - new Date(b.time.end));
    }

    // Filter by capacity
    if (filters.capacity === "full") {
      filtered = filtered.filter((raffle) => raffle.participants.ticketsSold === raffle.participants.max);
    }
    if (filters.capacity === "partial") {
      filtered = filtered.filter((raffle) => raffle.participants.ticketsSold < raffle.participants.max);
    }
    if (filters.capacity === "low") {
      filtered = filtered.filter(
        (raffle) => raffle.participants.ticketsSold / raffle.participants.max < 0.5
      );
    }

    // Filter by threshold
    if (filters.threshold === "met") {
      filtered = filtered.filter((raffle) => raffle.participants.ticketsSold >= raffle.participants.min);
    }
    if (filters.threshold === "notMet") {
      filtered = filtered.filter((raffle) => raffle.participants.ticketsSold < raffle.participants.min);
    }

    // New raffles
    if (filters.newRaffles) {
      filtered = filtered.sort(
        (a, b) => new Date(b.time.created).getTime() - new Date(a.time.created).getTime()
      );
    }

    setFilteredRaffles(filtered);
  };

  /**
   * Reapply filters whenever raffles or filters change
   */
  useEffect(() => {
    applyFilters();
  }, [filters, raffles]);

  /**
   * Fetch all raffles on initial render
   */
  useEffect(() => {
    loadRaffles(); // Default: fetch the first page with default limit
  }, []);

  return (
    <RaffleContext.Provider
      value={{
        raffles: filteredRaffles, // Use filtered raffles in components
        meta,
        selectedRaffle,
        loading,
        error,
        loadRaffles,
        loadRaffleDetails,
        resetSelectedRaffle,
        setFilters, // Expose setFilters for components
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffle = () => useContext(RaffleContext);
