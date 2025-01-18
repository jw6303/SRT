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
      raffleName,
      entryFee,
      prizeDetails,
      participants,
      time,
      question,
      status,
      onChainDetails,
      offChainDetails,
      analytics,
    } = req.body;

    // Validate required fields
    if (
      !raffleId ||
      !entryFee ||
      !prizeDetails?.type ||
      !participants?.max ||
      !participants?.min ||
      !time?.start ||
      !time?.end ||
      !question?.text ||
      !question?.options?.length ||
      !question.correctAnswer
    ) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    const newRaffle = {
      raffleId,
      raffleName: raffleName || null,
      entryFee,
      prizeDetails: {
        type: prizeDetails.type,
        title: prizeDetails.title,
        amount: prizeDetails.amount || null,
        details: prizeDetails.details || "Exciting prize awaits!",
        imageUrl: prizeDetails.imageUrl || "https://example.com/default-image.jpg",
        requiresShipping: prizeDetails.requiresShipping || false,
        shippingFields: prizeDetails.shippingFields || {},
      },
      participants: {
        max: participants.max,
        min: participants.min,
        ticketsSold: participants.ticketsSold || 0,
        tickets: participants.tickets || [],
        correct: participants.correct || [],
        incorrect: participants.incorrect || [],
      },
      time: {
        start: new Date(time.start),
        end: new Date(time.end),
        created: new Date(),
      },
      question: {
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
      },
      status: {
        current: status?.current || "active",
        fulfillment: status?.fulfillment || "pending",
        isOnChain: status?.isOnChain || false,
      },
      onChainDetails: onChainDetails || {},
      offChainDetails: offChainDetails || {},
      analytics: {
        totalTickets: analytics?.totalTickets || participants.max,
        totalEntries: analytics?.totalEntries || 0,
        totalRefunds: analytics?.totalRefunds || 0,
        successfulRaffles: analytics?.successfulRaffles || 0,
        failedRaffles: analytics?.failedRaffles || 0,
      },
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
const sanitize = require("mongo-sanitize"); // To prevent NoSQL injection
const redis = require("redis"); // Redis client for caching

// Create a Redis client
const redisClient = redis.createClient();

exports.getActiveRaffles = async (req, res) => {
  try {
    // Redis caching key
    const cacheKey = "active_raffles";
    
    // Check Redis cache first
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (err) {
        console.error("[ERROR] Redis error:", err);
        return res.status(500).json({ error: "Failed to fetch raffles from cache." });
      }

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Query parameters for filtering and sorting
      const {
        prizeType,
        maxParticipants,
        fulfillment,
        sortField = "time.start",
        sortOrder = "asc",
        limit = 10,
        page = 1,
      } = req.query;

      // Construct query and sanitize inputs
      const query = { "status.current": "active" }; // Only fetch active raffles
      if (prizeType) query["prizeDetails.type"] = sanitize(prizeType);
      if (maxParticipants) query["participants.max"] = { $lte: parseInt(sanitize(maxParticipants)) };
      if (fulfillment) query["status.fulfillment"] = sanitize(fulfillment);

      // Sorting and pagination
      const sortOrderValue = sortOrder === "desc" ? -1 : 1;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const options = {
        sort: { [sortField]: sortOrderValue }, // Dynamic sorting
        limit: parseInt(limit),
        skip,
      };

      // Fetch raffles and total count
      const raffles = await req.db.collection("raffles").find(query, options).toArray();
      const totalCount = await req.db.collection("raffles").countDocuments(query);

      // Cache the result for future requests (1 hour expiration)
      redisClient.setex(cacheKey, 3600, JSON.stringify({ raffles, totalCount }));

      // Return the response
      res.status(200).json({
        message: "Active raffles fetched successfully.",
        data: raffles,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: raffles.length,
          totalCount, // Total raffles matching the query
        },
      });
    });
  } catch (err) {
    console.error("[ERROR] Failed to fetch active raffles:", err);
    res.status(500).json({ error: "Failed to fetch active raffles." });
  }
};



// Get Raffle by ID
exports.getRaffleById = async (req, res) => {
  const { id } = req.params;

  // Validate and sanitize ObjectId
  const sanitizedId = sanitize(id); // Use a library like mongo-sanitize
  if (!validateObjectId(sanitizedId, res)) return;

  try {
    // Fetch the raffle by ID
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(sanitizedId) });

    // Check if the raffle exists
    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Add derived or summary data
    const participantSummary = {
      totalParticipants: raffle.participants.tickets.length,
      totalCorrect: raffle.participants.correct.length,
      totalIncorrect: raffle.participants.incorrect.length,
    };

    // Add winner and refund details if applicable
    const winnerDetails = raffle.status.current === "completed" ? raffle.winner : null;
    const refundDetails = raffle.status.current === "refunded" ? raffle.refundList : null;

    // Response structure
    res.status(200).json({
      message: `Raffle details fetched successfully for ID: ${sanitizedId}`,
      data: raffle,
      meta: {
        participantSummary,
        ticketsSold: raffle.participants.ticketsSold,
        isOnChain: raffle.status.isOnChain,
        currentStatus: raffle.status.current,
        analytics: raffle.analytics || {}, // Ensure analytics are included
        winnerDetails, // Include winner details if the raffle is completed
        refundDetails, // Include refund details if the raffle is refunded
      },
    });
  } catch (err) {
    console.error(`[ERROR] Failed to fetch raffle with ID ${sanitizedId}:`, err);
    res.status(500).json({ error: "Failed to fetch raffle details." });
  }
};







// Register Participant
exports.registerParticipant = async (req, res) => {
  const { id } = req.params;
  const { participantId, name, pubkey, answer, amountPaid } = req.body;

  // Validate and sanitize ObjectId
  const sanitizedId = sanitize(id); // Use a library like mongo-sanitize
  if (!validateObjectId(sanitizedId, res)) return;

  // Validate required fields
  if (!participantId || !name || !pubkey || !answer || !amountPaid) {
    return res.status(400).json({ error: "All participant details are required." });
  }

  try {
    // Fetch the raffle
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(sanitizedId) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Check if the participant already exists
    const participantExists = raffle.participants.tickets.some(
      (ticket) => ticket.participantId === participantId
    );
    if (participantExists) {
      return res.status(400).json({ error: "Participant is already registered." });
    }

    // Determine if the answer is correct
    const isCorrect = answer === raffle.question.correctAnswer;

    // Update the raffle
    const updateData = {
      $push: {
        [`participants.${isCorrect ? "correct" : "incorrect"}`]: {
          participantId,
          pubkey,
          name,
          answer,
          amountPaid,
          registrationTime: new Date(),
        },
        "participants.tickets": {
          participantId,
          pubkey,
          purchaseTime: new Date(),
          amountPaid,
        },
      },
      $inc: { "participants.ticketsSold": 1 },
    };

    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(sanitizedId) },
      updateData
    );

    // Respond with success
    res.status(200).json({
      message: "Participant registered successfully!",
      isCorrect,
    });
  } catch (err) {
    console.error(`[ERROR] Failed to register participant for raffle ID ${sanitizedId}:`, err);
    res.status(500).json({ error: "Failed to register participant." });
  }
};

// Get Raffle Participants
exports.getRaffleParticipants = async (req, res) => {
  const { id } = req.params;
  const { filter = "all", page = 1, limit = 10 } = req.query;

  // Validate and sanitize ObjectId
  const sanitizedId = sanitize(id); // Use a library like mongo-sanitize
  if (!validateObjectId(sanitizedId, res)) return;

  try {
    // Fetch the raffle
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(sanitizedId) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Determine which participants to return based on the filter
    let participants = [];
    switch (filter) {
      case "correct":
        participants = raffle.participants.correct;
        break;
      case "incorrect":
        participants = raffle.participants.incorrect;
        break;
      default: // "all"
        participants = [...raffle.participants.correct, ...raffle.participants.incorrect];
        break;
    }

    // Paginate the results
    const startIndex = (page - 1) * limit;
    const paginatedParticipants = participants.slice(startIndex, startIndex + parseInt(limit));

    // Create a participant summary
    const participantSummary = {
      totalParticipants: raffle.participants.tickets.length,
      totalCorrect: raffle.participants.correct.length,
      totalIncorrect: raffle.participants.incorrect.length,
    };

    // Response structure
    res.status(200).json({
      message: "Participants fetched successfully.",
      data: paginatedParticipants,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: participants.length,
        participantSummary,
      },
    });
  } catch (err) {
    console.error(`[ERROR] Failed to fetch participants for raffle ID ${sanitizedId}:`, err);
    res.status(500).json({ error: "Failed to fetch participants." });
  }
};





// Conclude a Raffle
const { randomInt } = require("crypto");

exports.concludeRaffle = async (req, res) => {
  const { id } = req.params;

  if (!validateObjectId(id, res)) return;

  try {
    // Fetch the raffle
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Check if the minimum number of participants with correct answers is met
    const eligibleParticipants = raffle.participants.correct || [];
    if (eligibleParticipants.length < raffle.participants.min) {
      return res.status(400).json({
        error: "Minimum participants with correct answers not met. Raffle cannot be concluded.",
      });
    }

    // Secure random selection of winner
    const randomIndex = randomInt(0, eligibleParticipants.length);
    const winner = eligibleParticipants[randomIndex];

    // Determine the fulfillment type (on-chain or off-chain)
    const fulfillmentStatus = raffle.status.isOnChain
      ? "fulfilled_on_chain"
      : "fulfilled_off_chain";

    // Update raffle with winner details and mark as completed
    const updateResult = await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "status.current": "completed",
          "status.fulfillment": fulfillmentStatus,
          winner: {
            raffleObjectId: id,
            participantId: winner.participantId,
            pubkey: winner.pubkey,
            amountWon: raffle.prizeDetails.type === "SOL" ? raffle.prizeDetails.amount : null,
          },
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update the raffle with winner details.");
    }

    // Emit real-time update via WebSocket
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("raffle-concluded", {
        raffleId: id,
        winner: {
          participantId: winner.participantId,
          pubkey: winner.pubkey,
          amountWon: raffle.prizeDetails.type === "SOL" ? raffle.prizeDetails.amount : "Physical prize",
        },
        fulfillmentStatus,
      });
    }

    // Send a success response
    res.status(200).json({
      message: "Raffle concluded successfully!",
      winner: {
        participantId: winner.participantId,
        pubkey: winner.pubkey,
        amountWon: raffle.prizeDetails.amount || "Physical prize",
      },
    });
  } catch (err) {
    console.error("[ERROR] Failed to conclude raffle:", err);
    res.status(500).json({ error: "Failed to conclude raffle." });
  }
};




// Extend a Raffle
exports.extendRaffle = async (req, res) => {
  const { id } = req.params;
  const { additionalTime } = req.body;

  // Validate ObjectId
  if (!validateObjectId(id, res)) return;

  // Validate `additionalTime`
  if (!additionalTime || typeof additionalTime !== "number" || additionalTime <= 0) {
    return res.status(400).json({ error: "Valid additional time (in minutes) is required." });
  }

  try {
    // Fetch the raffle
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    // Check if the raffle exists
    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Ensure the raffle is active
    if (raffle.status.current !== "active") {
      return res.status(400).json({ error: "Only active raffles can be extended." });
    }

    // Calculate the new end time
    const currentEndTime = new Date(raffle.time.end).getTime();
    const newEndTime = new Date(currentEndTime + additionalTime * 60 * 1000);

    // Update the raffle's end time
    await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { "time.end": newEndTime } }
    );

    // Emit real-time update via WebSocket
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("raffle-update", {
        raffleId: id,
        newEndTime,
      });
    }

    res.status(200).json({
      message: "Raffle extended successfully!",
      updatedEndTime: newEndTime,
    });
  } catch (err) {
    console.error("[ERROR] Failed to extend raffle:", err);
    res.status(500).json({ error: "Failed to extend raffle." });
  }
};





// Purchase Ticket
exports.purchaseTicket = async (req, res) => {
  console.log("[DEBUG] Reached purchaseTicket endpoint");

  const { id } = req.params; // Raffle ID
  const { participantId, pubkey, ticketCount } = req.body; // Request data

  // Validate required fields
  if (!participantId || !pubkey || !ticketCount) {
    return res.status(400).json({
      error: "Participant ID, public key, and ticket count are required.",
    });
  }

  // Validate and sanitize ObjectId
  if (!validateObjectId(id, res)) return;

  try {
    // Fetch the raffle details
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    // Check if the raffle exists
    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Check if the raffle is active
    if (raffle.status.current !== "active") {
      return res.status(400).json({ error: "This raffle is no longer active." });
    }

    // Check ticket availability
    const availableTickets = raffle.participants.max - raffle.participants.ticketsSold;
    if (ticketCount > availableTickets) {
      return res.status(400).json({
        error: `Only ${availableTickets} ticket(s) are available.`,
      });
    }

    // Create ticket entries
    const tickets = Array(ticketCount).fill().map(() => ({
      participantId,
      pubkey,
      purchaseTime: new Date(),
      amountPaid: raffle.entryFee,
      refundEligible: true, // Mark as eligible for refund if needed
    }));

    // Update the raffle in the database
    const updateResult = await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { "participants.tickets": { $each: tickets } },
        $inc: {
          "participants.ticketsSold": ticketCount,
          "analytics.totalEntries": ticketCount,
          "analytics.ticketsSold": ticketCount,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update the raffle with new ticket data.");
    }

    // Emit real-time update via WebSocket
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("raffle-update", {
        raffleId: id,
        ticketsSold: raffle.participants.ticketsSold + ticketCount,
        availableTickets: availableTickets - ticketCount,
      });
    }

    // Send a success response
    res.status(200).json({
      message: `${ticketCount} ticket(s) purchased successfully!`,
      data: {
        raffleId: id,
        participantId,
        ticketsPurchased: ticketCount,
        ticketsSold: raffle.participants.ticketsSold + ticketCount,
        availableTickets: availableTickets - ticketCount,
      },
    });
  } catch (err) {
    console.error("[ERROR] Error purchasing ticket(s):", err);
    res.status(500).json({ error: "Failed to purchase ticket(s)." });
  }
};





exports.getRaffleAnalytics = async (req, res) => {
  try {
    const analytics = await req.db.collection("raffles").aggregate([
      {
        $group: {
          _id: null,
          totalRaffles: { $sum: 1 },
          successfulRaffles: { $sum: "$analytics.successfulRaffles" },
          totalTicketsSold: { $sum: "$analytics.totalTickets" },
        },
      },
    ]).toArray();

    res.status(200).json({ analytics });
  } catch (err) {
    console.error("[ERROR] Failed to fetch analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};




io.on("connection", (socket) => {
  console.log(`[INFO] Client connected: ${socket.id}`);

  socket.on("join-raffle", (raffleId) => {
    socket.join(`raffle-${raffleId}`);
    console.log(`[INFO] Client joined room: raffle-${raffleId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[INFO] Client disconnected: ${socket.id}`);
  });
});


const raffleNamespace = io.of("/raffle");

raffleNamespace.on("connection", (socket) => {
  console.log(`[INFO] Raffle namespace client connected: ${socket.id}`);

  socket.on("join-raffle", (raffleId) => {
    socket.join(`raffle-${raffleId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[INFO] Client disconnected from raffle namespace: ${socket.id}`);
  });
});



exports.notifyParticipants = (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit notification to all participants
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("notification", { message });
    }

    res.status(200).json({ message: "Notification sent successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send notification:", err);
    res.status(500).json({ error: "Failed to send notification." });
  }
};



exports.notifyAllParticipants = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  // Validate input
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit notification to all participants in the raffle room
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("notification", {
        raffleId: id,
        message,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: "Notification sent to all participants successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send notification to all participants:", err);
    res.status(500).json({ error: "Failed to send notification to participants." });
  }
};


exports.notifyParticipant = async (req, res) => {
  const { id } = req.params; // Raffle ID
  const { participantId, message } = req.body;

  // Validate input
  if (!message || !participantId) {
    return res.status(400).json({ error: "Participant ID and message are required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit private notification to the specific participant
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("participant-notification", {
        participantId,
        raffleId: id,
        message,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: "Notification sent to the participant successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send notification to participant:", err);
    res.status(500).json({ error: "Failed to send notification to the participant." });
  }
};


exports.notifyWinner = async (req, res) => {
  const { id } = req.params; // Raffle ID
  const { winnerId, prizeDetails } = req.body;

  // Validate input
  if (!winnerId || !prizeDetails) {
    return res.status(400).json({ error: "Winner ID and prize details are required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit winner notification
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("winner-notification", {
        winnerId,
        raffleId: id,
        prizeDetails,
        message: "Congratulations! You are the winner of the raffle.",
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: "Winner notified successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to notify winner:", err);
    res.status(500).json({ error: "Failed to notify the winner." });
  }
};



exports.notifyRefunds = async (req, res) => {
  const { id } = req.params; // Raffle ID
  const { refundList } = req.body;

  // Validate input
  if (!refundList || !Array.isArray(refundList)) {
    return res.status(400).json({ error: "Refund list must be provided as an array." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit refund notification to participants
    if (req.io) {
      req.io.to(`raffle-${id}`).emit("refund-notification", {
        raffleId: id,
        refundList,
        message: "Refunds have been issued for the raffle.",
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: "Refund notifications sent successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send refund notifications:", err);
    res.status(500).json({ error: "Failed to send refund notifications." });
  }
};
