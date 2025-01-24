import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./context/WebSocketContext";
import { HelmetProvider } from "react-helmet-async";
import { RaffleProvider } from "./SRT/Terminal/context/RaffleContext"; // Import RaffleProvider
import ErrorPage from "./SRT/components/ErrorPage";
import Raffle from "./SRT/raffle";
import RaffleDetails from "./SRT/components/RaffleDetails";
import SolChart from "./SRT/3D/solchart";
import PrivacyPolicy from "./SRT/terms/pp";
import TermsAndConditions from "./SRT/terms/tc";
import TestPage from "./SRT/components/test";
import Terminal from "./SRT/Terminal/Terminal";

function App() {
  return (
    <WebSocketProvider>
      <HelmetProvider>
        <RaffleProvider>
          <Router>
            <Routes>
              {/* Home route */}
              <Route path="/" element={<Raffle />} />

              {/* Raffle details route */}
              <Route path="/raffles/:raffleId" element={<RaffleDetails />} />

              {/* Terminal route */}
              <Route path="/terminal" element={<Terminal />} />

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
        </RaffleProvider>
      </HelmetProvider>
    </WebSocketProvider>
  );
}

export default App;
