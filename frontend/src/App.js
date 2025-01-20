import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./context/WebSocketContext";
import ErrorPage from "./SRT/components/ErrorPage";
import { HelmetProvider } from "react-helmet-async";
import Raffle from "./SRT/raffle"; // Directly importing Raffle component
import RaffleDetails from "./SRT/components/RaffleDetails"; // Directly importing RaffleDetails component

function App() {
  return (
    <WebSocketProvider>
      <HelmetProvider>
        <title>Raffle Platform</title>
        <meta name="description" content="Join exciting raffles and win amazing prizes!" />
      </HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Raffle />} />
          <Route path="/raffles/:raffleId" element={<RaffleDetails />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
