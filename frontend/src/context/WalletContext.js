// src/context/WalletContext.js
import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

// Import CSS for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContextProvider = ({ children }) => {
  // Select the network (e.g., 'devnet', 'testnet', or 'mainnet-beta')
  const network = clusterApiUrl('devnet');

  // Configure the wallets you want to support
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;