import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./context/WebSocketContext";
import ErrorPage from "./SRT/components/ErrorPage";
import { HelmetProvider } from "react-helmet-async";
import Raffle from "./SRT/raffle"; // Main Raffle Component
import RaffleDetails from "./SRT/components/RaffleDetails"; // Raffle Details Component
import SolChart from "./SRT/3D/solchart"; // SolChart Component
import PrivacyPolicy from "./SRT/terms/pp"; // Privacy Policy Component
import TermsAndConditions from "./SRT/terms/tc"; // Terms and Conditions Component
import TestPage from "./SRT/components/test"; // Import the new TestPage component

function App() {
  return (
    <WebSocketProvider>
      <HelmetProvider>
        <Router>
          <Routes>
            {/* Home route */}
            <Route path="/" element={<Raffle />} />

            {/* Raffle details route */}
            <Route path="/raffles/:raffleId" element={<RaffleDetails />} />

            {/* SolChart route */}
            <Route path="/solchart" element={<SolChart />} />

            {/* Privacy Policy route */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Terms and Conditions route */}
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Test page for testing styles */}
            <Route path="/test" element={<TestPage />} />

            {/* Fallback for unknown routes */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </HelmetProvider>
    </WebSocketProvider>
  );
}

export default App;
