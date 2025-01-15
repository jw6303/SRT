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
      imageUrl,
      prizeDetails,
      isOnChain,
      question,
      correctAnswer,
      questionOptions,
    } = req.body;

    if (
      !raffleId ||
      !entryFee ||
      !prizeAmount ||
      !startTime ||
      !endTime ||
      !maxParticipants ||
      !minParticipants ||
      !question ||
      !correctAnswer ||
      !questionOptions ||
      questionOptions.length < 2
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newRaffle = {
      raffleId,
      entryFee,
      prizeAmount,
      startTime,
      endTime,
      maxParticipants,
      minParticipants,
      tickets: [], // Added for storing purchased tickets
      participantsCorrect: [],
      participantsIncorrect: [],
      status: "active",
      createdAt: new Date(),
      imageUrl: imageUrl || "https://example.com/default-image.jpg",
      prizeDetails: prizeDetails || "Exciting prize awaits!",
      isOnChain: isOnChain || false,
      question,
      correctAnswer,
      questionOptions,
    };

    const result = await req.db.collection("raffles").insertOne(newRaffle);
    res.status(201).json({ message: "Raffle created successfully!", id: result.insertedId });
  } catch (err) {
    console.error("Error creating raffle:", err);
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
      return res.status(404).json({ error: "Raffle not found" });
    }
    res.status(200).json(raffle);
  } catch (err) {
    console.error("Error fetching raffle details:", err);
    res.status(500).json({ error: "Failed to fetch raffle details" });
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
  console.log("[DEBUG] Reached purchaseTicket endpoint"); // Debugging
  const { id } = req.params;
  const { participantId, name, pubkey } = req.body;

  if (!participantId || !pubkey) {
    return res.status(400).json({ error: "Participant ID, name, and public key are required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    if (raffle.tickets?.length >= raffle.maxParticipants) {
      return res.status(400).json({ error: "Maximum participants reached." });
    }

// If name is not provided, set a default value
const ticket = {
  participantId,
  name: name || "Anonymous", // Default to "Anonymous" if name is not provided
  pubkey,
  purchaseTime: new Date(),
};    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $push: { tickets: ticket } }
    );

    res.status(200).json({ message: "Ticket purchased successfully!" });
  } catch (err) {
    console.error("Error purchasing ticket:", err);
    res.status(500).json({ error: "Failed to purchase ticket." });
  }
};
