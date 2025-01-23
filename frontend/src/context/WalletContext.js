// src/context/WalletContext.js
import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase'; // Coinbase Wallet Adapter
import { clusterApiUrl } from '@solana/web3.js';

// Import CSS for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContextProvider = ({ children }) => {
  // Select the network (e.g., 'devnet', 'testnet', or 'mainnet-beta')
  const network = clusterApiUrl('devnet'); // Change to 'mainnet-beta' in production

  // Configure the wallets you want to support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new GlowWalletAdapter(),
      new CoinbaseWalletAdapter(), // Add Coinbase Wallet
    ],
    [network]
  );

  return (
    <ConnectionProvider
      endpoint={network}
      config={{ commitment: 'confirmed' }} // Set commitment level for transaction stability
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
