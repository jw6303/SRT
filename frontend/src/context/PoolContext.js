import React, { createContext, useContext, useState } from "react";

// Create Pool Context
const PoolContext = createContext();

// Hook to use Pool Context
export const usePool = () => useContext(PoolContext);

// Pool Provider Component
export const PoolProvider = ({ children }) => {
  const [selectedPool, setSelectedPool] = useState(null); // Selected pool state

  return (
    <PoolContext.Provider value={{ selectedPool, setSelectedPool }}>
      {children}
    </PoolContext.Provider>
  );
};
