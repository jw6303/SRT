import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Raffle from "./SRT/raffle"; // Import Raffle component
import RaffleDetails from "./SRT/components/RaffleDetails"; // Import RaffleDetails component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Raffle />} /> {/* Main raffles page */}
        <Route path="/raffles/:raffleId" element={<RaffleDetails />} /> {/* Raffle details page */}
      </Routes>
    </Router>
  );
}

export default App;
