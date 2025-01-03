// src/index.js
import React from 'react';
import reportWebVitals from './reportWebVitals';

import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import WalletContextProvider from './context/WalletContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);
