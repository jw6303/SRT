const PROGRAM_ID = process.env.REACT_APP_SOLANA_PROGRAM_ID;

const poolsConfig = [
  {
    name: "WIN 90 SOL",
    priceInSol: 0.03,
    totalTickets: 50,
    programId: PROGRAM_ID, // Use the Program ID from .env
    duration: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    entryCap: 10,
    prize: "1 SOL",
    endTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // Calculate end time
  },
  {
    name: "WIN 3 SOL",
    priceInSol: 0.09,
    totalTickets: 100,
    programId: PROGRAM_ID, // Use the Program ID from .env
    duration: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    entryCap: 5,
    prize: "3 SOL",
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Bahamas Trip",
    priceInSol: 0.2599,
    totalTickets: 25,
    programId: PROGRAM_ID, // Use the Program ID from .env
    duration: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    entryCap: 2,
    prize: "Trip to Bahamas",
    endTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
  },
];

export default poolsConfig;


console.log(poolsConfig);
