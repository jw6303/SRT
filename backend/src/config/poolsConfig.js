const poolsConfig = [
  {
    name: "WIN 50 SOL",
    priceInSol: 0.03,
    totalTickets: 50,
    duration: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    entryCap: 10,
    image: "/win1.png",
    prize: "1 SOL",
    endTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // Calculate end time
  },
  {
    name: "WIN 3 SOL",
    priceInSol: 0.09,
    totalTickets: 100,
    duration: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    entryCap: 5,
    image: "/win2.png",
    prize: "3 SOL",
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Bahamas Trip",
    priceInSol: 0.2599,
    totalTickets: 25,
    duration: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    entryCap: 2,
    image: "/win3.png",
    prize: "Trip to Bahamas",
    endTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
  },
];



export default poolsConfig;
