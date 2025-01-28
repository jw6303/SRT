// helpers.js
export const calculateUserMaxTickets = (totalTickets, userTicketsOwned, remainingTickets) => {
  const userMaxTickets = Math.floor(totalTickets * 0.1) - userTicketsOwned;
  return Math.min(userMaxTickets, remainingTickets);
};

export const calculateRoi = (ticketCount, totalTickets, prizeValue) => {
  if (!totalTickets || !prizeValue) return null;

  const chance = ticketCount / totalTickets;
  const roiMultiplier = prizeValue * chance;

  return {
    chance: (chance * 100).toFixed(2),
    roi: roiMultiplier.toFixed(2),
  };
};

export const validateShippingInfo = (info, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !info[field]);
  return missingFields.length > 0 ? missingFields : null;
};
