import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "./context/WebSocketContext";
import ErrorPage from "./SRT/components/ErrorPage";
import { HelmetProvider } from "react-helmet-async";

const Raffle = React.lazy(() => import("./SRT/raffle"));
const RaffleDetails = React.lazy(() => import("./SRT/components/RaffleDetails"));

function App() {
  return (
    <WebSocketProvider>
      <HelmetProvider>
        <title>Raffle Platform</title>
        <meta name="description" content="Join exciting raffles and win amazing prizes!" />
      </HelmetProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Raffle />} />
            <Route path="/raffles/:raffleId" element={<RaffleDetails />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
