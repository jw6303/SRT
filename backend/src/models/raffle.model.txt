const raffleSchema = {
    raffleId: String,
    entryFee: Number,
    prizeAmount: Number,
    startTime: Date,
    endTime: Date,
    maxParticipants: Number,
    minParticipants: Number,
    participants: Array, // Holds participant IDs
    status: String, // active, completed, or failed
  };
  
  module.exports = raffleSchema;
  