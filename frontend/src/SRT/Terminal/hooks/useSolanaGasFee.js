import { Connection, Transaction, PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const ALCHEMY_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/SGmbTUJRNqvnYYE4UQow8Rmt8gbtQ214";

const useSolanaGasFee = () => {
  const { publicKey } = useWallet(); // ✅ Get connected wallet
  const [priorityFee, setPriorityFee] = useState(null);
  const [congestionLevel, setCongestionLevel] = useState("Normal");

  useEffect(() => {
    const connection = new Connection(ALCHEMY_RPC_URL, "confirmed");

    const fetchGasFees = async () => {
      if (!publicKey) {
        setPriorityFee(null);
        setCongestionLevel("⚠️ Connect Wallet");
        return;
      }

      try {
        const { blockhash } = await connection.getLatestBlockhash();

        // ✅ Create a dummy transaction with a valid fee payer (current wallet)
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: publicKey,
            lamports: 0,
          })
        );
        transaction.feePayer = publicKey; // ✅ Assign the connected wallet as fee payer
        transaction.recentBlockhash = blockhash;

        const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage());

        if (feeEstimate?.value === null) throw new Error("Fee estimation failed");

        const estimatedFee = feeEstimate.value; // In lamports

        const baseFee = 5000; // 0.000005 SOL base fee

        if (estimatedFee <= baseFee) {
          setCongestionLevel("🟢 Low (Normal Fee)");
        } else if (estimatedFee <= baseFee * 2) {
          setCongestionLevel("🟡 Medium (Moderate Fee)");
        } else {
          setCongestionLevel("🔴 High (Congested)");
        }

        setPriorityFee(estimatedFee / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error("❌ Error fetching gas fees:", error);
        setCongestionLevel("⚠️ Error Fetching Data");
      }
    };

    fetchGasFees();
    const interval = setInterval(fetchGasFees, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [publicKey]);

  return { priorityFee, congestionLevel };
};

export default useSolanaGasFee;
