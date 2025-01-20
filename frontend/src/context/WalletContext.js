import React, { useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";

// Import CSS for wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletContextProvider = ({ children }) => {
  const network = clusterApiUrl("devnet");
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    // Explicitly check for Phantom Wallet
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      console.log("Phantom Wallet detected!");
    } else {
      console.warn("Phantom Wallet not detected.");
    }
  }, []);

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
