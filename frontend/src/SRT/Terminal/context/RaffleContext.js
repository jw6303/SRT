import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchActiveRaffles, fetchRaffleDetails } from "../../../api"; // Adjust the relative path

const RaffleContext = createContext();

export const RaffleProvider = ({ children }) => {
  // ---------------------------
  // Existing states
  // ---------------------------
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

  // ---------------------------
  // NEW: Logging system
  // ---------------------------
  const [logs, setLogs] = useState([]);

  /**
   * Add a log entry to the logs array
   * @param {string} type - "info", "success", "error", etc.
   * @param {string} message - The text of the log message
   */
  const addLog = (type, message) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      {
        type,
        message,
        logTime: new Date().toISOString(),
      },
    ]);
  };

  // ---------------------------
  // Existing functions
  // ---------------------------

  /**
   * Fetch all raffles with optional filters and pagination
   * @param {Object} options - Filtering and pagination options
   */
  const loadRaffles = async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      addLog("info", "Loading raffles from API...");
      const { raffles, meta } = await fetchActiveRaffles(options); // Fetch raffles from API

      setRaffles(raffles);
      setFilteredRaffles(raffles); // Initially, show all raffles
      setMeta(meta); // Update pagination metadata

      addLog("success", "Raffles loaded successfully.");
    } catch (err) {
      const errMsg = err.message || "Failed to load raffles.";
      setError(errMsg);
      addLog("error", `Error loading raffles: ${errMsg}`);
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
      const errMsg = "Raffle ID is required.";
      setError(errMsg);
      addLog("error", errMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      addLog("info", `Loading raffle details for ID: ${id}`);
      const { data } = await fetchRaffleDetails(id); // Fetch details for a specific raffle
      setSelectedRaffle(data); // Update selected raffle state

      addLog("success", `Raffle details loaded (ID: ${id}).`);
    } catch (err) {
      const errMsg = err.message || "Failed to load raffle details.";
      setError(errMsg);
      addLog("error", `Error loading details (ID: ${id}): ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the selected raffle
   */
  const resetSelectedRaffle = () => {
    setSelectedRaffle(null);
    addLog("info", "Selected raffle has been reset.");
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
      filtered = filtered.filter(
        (raffle) => raffle.participants.ticketsSold === raffle.participants.max
      );
    }
    if (filters.capacity === "partial") {
      filtered = filtered.filter(
        (raffle) => raffle.participants.ticketsSold < raffle.participants.max
      );
    }
    if (filters.capacity === "low") {
      filtered = filtered.filter(
        (raffle) =>
          raffle.participants.ticketsSold / raffle.participants.max < 0.5
      );
    }

    // Filter by threshold
    if (filters.threshold === "met") {
      filtered = filtered.filter(
        (raffle) => raffle.participants.ticketsSold >= raffle.participants.min
      );
    }
    if (filters.threshold === "notMet") {
      filtered = filtered.filter(
        (raffle) => raffle.participants.ticketsSold < raffle.participants.min
      );
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
        // Expose the existing states and methods
        raffles: filteredRaffles,
        meta,
        selectedRaffle,
        loading,
        error,
        loadRaffles,
        loadRaffleDetails,
        resetSelectedRaffle,
        setFilters,

        // NEW: Expose logs and addLog
        logs,
        addLog,
      }}
    >
      {children}
    </RaffleContext.Provider>
  );
};

export const useRaffle = () => useContext(RaffleContext);
