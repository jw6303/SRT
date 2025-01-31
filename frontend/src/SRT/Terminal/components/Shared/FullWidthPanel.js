import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useSolanaGasFee from "../../hooks/useSolanaGasFee"; // Import gas fee hook

const FullWidthPanel = () => {
  const { priorityFee, congestionLevel } = useSolanaGasFee(); // Get gas fee data

  return (
    <div className="full-width-panel">
      
      {/* Wallet Section */}
      <div className="panel-left">
        <WalletMultiButton className="wallet-button" />
      </div>

      {/* Center: Solana Gas Fee Indicator */}
      <div className="panel-center">
        <p className="solana-gas-indicator">
          Network: <span className="fee-level">{congestionLevel}</span> | Priority Fee:{" "}
          <span className="fee-amount">{priorityFee ? `${priorityFee.toFixed(6)} SOL` : "Loading..."}</span>
        </p>
      </div>

    </div>
  );
};

export default FullWidthPanel;
