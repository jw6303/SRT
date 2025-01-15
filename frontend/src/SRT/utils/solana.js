import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    clusterApiUrl,
  } from "@solana/web3.js";
  
  export const sendTransactionToProgram = async ({
    pool,
    ticketCount,
    publicKey,
    sendTransaction,
  }) => {
    if (!publicKey) throw new Error("Wallet not connected.");
  
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Devnet connection
  
    const programId = new PublicKey(pool.programId); // Get the program ID from the pool
    const lamports = Math.round(ticketCount * pool.priceInSol * 1e9); // Convert SOL to lamports and ensure integer
  
    // Create a Solana transaction to transfer SOL to the program
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey, // User's wallet
        toPubkey: programId, // Solana program's public key
        lamports, // Total amount to transfer
      })
    );
  
    // Send the transaction
    const signature = await sendTransaction(transaction, connection);
    console.log("Transaction Signature:", signature);
  
    // Confirm the transaction
    await connection.confirmTransaction(signature, "confirmed");
  
    return signature;
  };
  