const { ObjectId } = require("mongodb");

// Fetch all raffles
exports.getAllRaffles = async (req, res) => {
  try {
    const raffles = await req.db.collection("raffles").find().toArray();
    res.render("overview", { raffles });
  } catch (err) {
    console.error("[ERROR] Failed to fetch raffles:", err);
    res.status(500).send("Failed to load raffles.");
  }
};

// Fetch specific raffle details
exports.getRaffleById = async (req, res) => {
  const { id } = req.params;

  try {
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).send("Raffle not found.");
    }

    res.render("raffleDetails", { raffle });
  } catch (err) {
    console.error(`[ERROR] Failed to fetch raffle with ID ${id}:`, err);
    res.status(500).send("Failed to load raffle details.");
  }
};

// Create a new raffle
exports.createRaffle = async (req, res) => {
  const {
    raffleId,
    entryFee,
    prizeAmount,
    maxParticipants,
    minParticipants,
    startTime,
    endTime,
    question,
    questionOptions,
    correctAnswer,
    imageUrl,
    prizeDetails,
    isOnChain,
  } = req.body;

  try {
    // Validate required fields
    if (
      !raffleId ||
      !entryFee ||
      !prizeAmount ||
      !maxParticipants ||
      !minParticipants ||
      !startTime ||
      !endTime ||
      !question ||
      !questionOptions ||
      questionOptions.length < 2 ||
      !correctAnswer
    ) {
      return res.status(400).send("All required fields must be provided.");
    }

    // Prepare new raffle data
    const newRaffle = {
      raffleId,
      entryFee: parseFloat(entryFee), // Ensure numbers
      prizeAmount: parseFloat(prizeAmount),
      maxParticipants: parseInt(maxParticipants),
      minParticipants: parseInt(minParticipants),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      question,
      questionOptions: Array.isArray(questionOptions) ? questionOptions : questionOptions.split(",").map((opt) => opt.trim()),
      correctAnswer,
      imageUrl: imageUrl || "https://via.placeholder.com/150",
      prizeDetails: prizeDetails || "Exciting prize awaits!",
      status: "active", // Default
      isOnChain: isOnChain === "true", // Parse boolean
      participants: [], // Default
      participantsCorrect: [], // Default
      participantsIncorrect: [], // Default
      tickets: [], // Default
      ticketsSold: 0, // Default
      createdAt: new Date(), // Auto-set
    };

    const result = await req.db.collection("raffles").insertOne(newRaffle);

    console.log("[INFO] Raffle created:", result.insertedId);
    res.redirect("/dashboard");
  } catch (err) {
    console.error("[ERROR] Failed to create raffle:", err);
    res.status(500).send("Failed to create raffle.");
  }
};



// End a Raffle
exports.endRaffle = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid Raffle ID.");
  }

  try {
    const result = await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id), status: "active" },
      { $set: { status: "ended" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Raffle not found or already ended.");
    }

    console.log(`[SUCCESS] Raffle ${id} marked as ended.`);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(`[ERROR] Failed to end raffle with ID ${id}:`, err);
    res.status(500).send("Failed to end raffle.");
  }
};
