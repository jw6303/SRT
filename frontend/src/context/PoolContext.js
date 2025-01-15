import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

// Create Pool Context
const PoolContext = createContext();

// Hook to use Pool Context
export const usePool = () => useContext(PoolContext);

// Pool Provider Component
export const PoolProvider = ({ children }) => {
  const [pools, setPools] = useState([]); // List of pools
  const [selectedPool, setSelectedPool] = useState(null); // Selected pool state
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch pools from the backend
  useEffect(() => {
    const fetchPools = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:5000/api/pools");
        const data = await response.json();
        setPools(data);
      } catch (err) {
        console.error("Failed to fetch pools:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, []);

  // Memoized context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({ pools, selectedPool, setSelectedPool, loading, error }),
    [pools, selectedPool, loading, error]
  );

  return <PoolContext.Provider value={contextValue}>{children}</PoolContext.Provider>;
};

// Prop validation
PoolProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
