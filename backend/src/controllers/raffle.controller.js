const { ObjectId } = require("mongodb");

// Helper: Validate ObjectId
function validateObjectId(id, res) {
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid raffle ID" });
    return false;
  }
  return true;
}

// Create a Raffle
exports.createRaffle = async (req, res) => {
  try {
    const {
      raffleId,
      entryFee,
      prizeAmount,
      startTime,
      endTime,
      maxParticipants,
      minParticipants,
      question,
      questionOptions,
      correctAnswer,
      imageUrl,
      prizeDetails,
      isOnChain,
    } = req.body;

    // Validate required fields
    if (
      !raffleId ||
      !entryFee ||
      !prizeAmount ||
      !startTime ||
      !endTime ||
      !maxParticipants ||
      !minParticipants ||
      !question ||
      !questionOptions ||
      questionOptions.length < 2 ||
      !correctAnswer
    ) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const newRaffle = {
      raffleId,
      entryFee,
      prizeAmount,
      startTime,
      endTime,
      maxParticipants,
      minParticipants,
      participants: [],
      status: "active",
      createdAt: new Date(),
      imageUrl: imageUrl || "https://example.com/default-image.jpg", // Default image URL
      isOnChain: isOnChain || false, // Default is off-chain
      prizeDetails: prizeDetails || "Exciting prize awaits!", // Default prize description
      question,
      questionOptions,
      correctAnswer,
      participantsCorrect: [],
      participantsIncorrect: [],
      tickets: [],
      ticketsSold: 0,
    };

    const result = await req.db.collection("raffles").insertOne(newRaffle);

    res.status(201).json({
      message: "Raffle created successfully!",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("[ERROR] Failed to create raffle:", err);
    res.status(500).json({ error: "Failed to create raffle." });
  }
};



// Get Active Raffles
exports.getActiveRaffles = async (req, res) => {
  try {
    const raffles = await req.db.collection("raffles").find({ status: "active" }).toArray();
    res.status(200).json(raffles);
  } catch (err) {
    console.error("Error fetching raffles:", err);
    res.status(500).json({ error: "Failed to fetch raffles." });
  }
};

// Get Raffle by ID
exports.getRaffleById = async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id, res)) return;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    res.status(200).json(raffle); // This will include `ticketsSold`
  } catch (err) {
    console.error(`[ERROR] Failed to fetch raffle with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to fetch raffle details." });
  }
};

// Register Participant
exports.registerParticipant = async (req, res) => {
  const { id } = req.params;
  const { participantId, name, answer } = req.body;

  if (!validateObjectId(id, res)) return;

  if (!participantId || !name || !answer) {
    return res.status(400).json({ error: "All participant details are required." });
  }

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    const isCorrect = answer === raffle.correctAnswer;

    const updateField = isCorrect ? "participantsCorrect" : "participantsIncorrect";

    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $push: { [updateField]: { participantId, name } } }
    );

    res.status(200).json({
      message: "Participant registered successfully!",
      isCorrect,
    });
  } catch (err) {
    console.error("Error registering participant:", err);
    res.status(500).json({ error: "Failed to register participant." });
  }
};

// Get Raffle Participants
exports.getRaffleParticipants = async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id, res)) return;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    res.status(200).json({
      participantsCorrect: raffle.participantsCorrect,
      participantsIncorrect: raffle.participantsIncorrect,
    });
  } catch (err) {
    console.error("Error fetching participants:", err);
    res.status(500).json({ error: "Failed to fetch participants." });
  }
};

// Conclude a Raffle
exports.concludeRaffle = async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id, res)) return;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    if (raffle.participantsCorrect.length < raffle.minParticipants) {
      return res.status(400).json({
        error: "Minimum participants with correct answers not met. Raffle cannot be concluded.",
      });
    }

    const winner =
      raffle.participantsCorrect[
        Math.floor(Math.random() * raffle.participantsCorrect.length)
      ];

    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "completed", winner } }
    );

    res.status(200).json({ message: "Raffle concluded successfully!", winner });
  } catch (err) {
    console.error("Error concluding raffle:", err);
    res.status(500).json({ error: "Failed to conclude raffle." });
  }
};

// Extend a Raffle
exports.extendRaffle = async (req, res) => {
  const { id } = req.params;
  const { additionalTime } = req.body;

  if (!validateObjectId(id, res)) return;

  if (!additionalTime) {
    return res.status(400).json({ error: "Additional time is required." });
  }

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    const newEndTime = new Date(new Date(raffle.endTime).getTime() + additionalTime * 60 * 1000);

    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { endTime: newEndTime } }
    );

    res.status(200).json({ message: "Raffle extended successfully!", newEndTime });
  } catch (err) {
    console.error("Error extending raffle:", err);
    res.status(500).json({ error: "Failed to extend raffle." });
  }
};

// Purchase Ticket
exports.purchaseTicket = async (req, res) => {
  console.log("[DEBUG] Reached purchaseTicket endpoint");
  const { id } = req.params;
  const { participantId, pubkey, ticketCount } = req.body;

  if (!participantId || !pubkey || !ticketCount) {
    return res.status(400).json({ error: "Participant ID, public key, and ticket count are required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    const availableTickets = raffle.maxParticipants - (raffle.ticketsSold || 0);
    if (ticketCount > availableTickets) {
      return res.status(400).json({ error: `Only ${availableTickets} tickets are available.` });
    }

    // Create ticket entries
    const tickets = Array(ticketCount).fill().map(() => ({
      participantId,
      pubkey,
      purchaseTime: new Date(),
    }));

    // Update the raffle in the database
    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { tickets: { $each: tickets } },
        $inc: { ticketsSold: ticketCount },
      }
    );

    res.status(200).json({ message: `${ticketCount} ticket(s) purchased successfully!` });
  } catch (err) {
    console.error("Error purchasing ticket(s):", err);
    res.status(500).json({ error: "Failed to purchase ticket(s)." });
  }
};
