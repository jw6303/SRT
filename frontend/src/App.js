import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Raffle from './SRT/raffle'; // Import Raffle component

function App() {
    return (
        <Router>
            <Routes>
                {/* Serve Raffle at the root path */}
                <Route path="/" element={<Raffle />} />
                {/* Add other routes if needed */}
            </Routes>
        </Router>
    );
}

export default App;
