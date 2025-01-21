const { ObjectId } = require("mongodb");
// Import the WebSocket broadcasting function
const { broadcastToRaffle } = require("../utils/websocket");

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

exports.getActiveRaffles = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("[ERROR] Failed to fetch active raffles:", err);
    res.status(500).json({ error: "Failed to fetch active raffles." });
  }
};


exports.getActiveRaffles = async (req, res) => {
  try {
    const {
      prizeType,
      maxParticipants,
      fulfillment,
      sortField = "time.start",
      sortOrder = "asc",
      limit = 10,
      page = 1,
    } = req.query;

    // Construct query
    const query = { "status.current": "active" };
    if (prizeType) query["prizeDetails.type"] = prizeType;
    if (maxParticipants) query["participants.max"] = { $lte: parseInt(maxParticipants) };
    if (fulfillment) query["status.fulfillment"] = fulfillment;

    // Sort and pagination
    const sortOrderValue = sortOrder === "desc" ? -1 : 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const options = { sort: { [sortField]: sortOrderValue } };

    // Fetch raffles
    console.log("[DEBUG] Query:", query);
    const raffles = await req.db.collection("raffles").find(query, options).skip(skip).limit(parseInt(limit)).toArray();
    console.log("[DEBUG] Fetched raffles:", raffles);

    // Fetch total count
    const totalCount = await req.db.collection("raffles").countDocuments(query);

    // Response
    res.status(200).json({
      message: "Active raffles fetched successfully.",
      data: raffles,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: raffles.length,
        totalCount,
      },
    });
  } catch (err) {
    console.error("[ERROR] Failed to fetch active raffles:", err);
    res.status(500).json({ error: "Failed to fetch active raffles." });
  }
};







exports.registerParticipant = async (req, res) => {
  const { id } = req.params; // Raffle ID from route parameters
  const { participantId, name, pubkey, answer, amountPaid, shippingInfo } = req.body; // Include shipping info in request body

  // Validate and sanitize ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid raffle ID provided." });
  }

  // Validate required fields
  if (!participantId || !name || !pubkey || !answer || !amountPaid) {
    return res.status(400).json({ error: "All participant details are required." });
  }

  try {
    // Fetch the raffle
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Check if the participant is already registered
    const participantExists = raffle.participants.tickets.some(
      (ticket) => ticket.participantId === participantId
    );
    if (participantExists) {
      return res.status(400).json({ error: "Participant is already registered." });
    }

    // If the raffle requires shipping, validate the shipping info
    if (raffle.prizeDetails.requiresShipping) {
      const requiredFields = ["fullName", "email", "phone", "addressLine1", "city", "postalCode", "country"];
      const missingFields = requiredFields.filter((field) => !shippingInfo?.[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required shipping information: ${missingFields.join(", ")}`,
        });
      }
    }

    // Determine if the answer is correct
    const isCorrect = answer === raffle.question.correctAnswer;

    // Prepare the new participant data
    const newParticipant = {
      participantId,
      pubkey,
      name,
      answer,
      amountPaid,
      registrationTime: new Date(),
      shippingInfo: raffle.prizeDetails.requiresShipping ? shippingInfo : null, // Attach shipping info if required
    };

    // Prepare the new ticket data
    const newTicket = {
      participantId,
      pubkey,
      purchaseTime: new Date(),
      amountPaid,
    };

    // Update the raffle in the database
    const updateResult = await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          [`participants.${isCorrect ? "correct" : "incorrect"}`]: newParticipant,
          "participants.tickets": newTicket,
        },
        $inc: { "participants.ticketsSold": 1 },
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update the raffle with participant data.");
    }

    // Emit WebSocket update to all clients subscribed to the raffle
    broadcastToRaffle(id, {
      type: "participantUpdate",
      participant: newParticipant,
      ticket: newTicket,
      ticketsSold: raffle.participants.ticketsSold + 1, // Updated tickets sold count
    });

    // Respond with success
    res.status(200).json({
      message: "Participant registered successfully!",
      isCorrect,
    });
  } catch (err) {
    console.error(`[ERROR] Failed to register participant for raffle ID ${id}:`, err);
    res.status(500).json({ error: "Failed to register participant." });
  }
};


// Get Raffle Participants
exports.getRaffleParticipants = async (req, res) => {
  const { id } = req.params;
  const { filter = "all", page = 1, limit = 10 } = req.query;

  // Validate and sanitize ObjectId
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
    broadcastToRaffle(id, {
      type: "raffleConcluded",
      raffleId: id,
      winner: {
        participantId: winner.participantId,
        pubkey: winner.pubkey,
        amountWon: raffle.prizeDetails.type === "SOL" ? raffle.prizeDetails.amount : "Physical prize",
      },
      fulfillmentStatus,
    });

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

    // Update the raffle's end time in the database
    const updateResult = await req.db.collection("raffles").updateOne(
      { _id: new ObjectId(id) },
      { $set: { "time.end": newEndTime } }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update the raffle end time.");
    }

    // Emit real-time update via WebSocket
    broadcastToRaffle(id, {
      type: "raffleUpdate",
      raffleId: id,
      updatedEndTime: newEndTime,
    });

    // Send a success response
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
    const updatedTicketsSold = raffle.participants.ticketsSold + ticketCount;
    broadcastToRaffle(id, {
      type: "raffleUpdate",
      raffleId: id,
      ticketsSold: updatedTicketsSold,
      availableTickets: availableTickets - ticketCount,
    });

    // Send a success response
    res.status(200).json({
      message: `${ticketCount} ticket(s) purchased successfully!`,
      data: {
        raffleId: id,
        participantId,
        ticketsPurchased: ticketCount,
        ticketsSold: updatedTicketsSold,
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









exports.notifyParticipants = (req, res) => {
  const { id } = req.params; // Raffle ID
  const { message } = req.body; // Notification message

  // Validate input
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit notification to all participants
    broadcastToRaffle(id, {
      type: "notification",
      raffleId: id,
      message,
      timestamp: new Date(),
    });

    // Send success response
    res.status(200).json({ message: "Notification sent successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send notification:", err);
    res.status(500).json({ error: "Failed to send notification." });
  }
};




exports.notifyAllParticipants = async (req, res) => {
  const { id } = req.params; // Raffle ID
  const { message } = req.body; // Notification message

  // Validate input
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit notification to all participants using broadcastToRaffle
    broadcastToRaffle(id, {
      type: "notification",
      raffleId: id,
      message,
      timestamp: new Date(),
    });

    // Send success response
    res.status(200).json({ message: "Notification sent to all participants successfully!" });
  } catch (err) {
    console.error("[ERROR] Failed to send notification to all participants:", err);
    res.status(500).json({ error: "Failed to send notification to participants." });
  }
};



exports.notifyParticipant = async (req, res) => {
  const { id } = req.params; // Raffle ID
  const { participantId, message } = req.body; // Participant ID and message

  // Validate input
  if (!message || !participantId) {
    return res.status(400).json({ error: "Participant ID and message are required." });
  }

  if (!validateObjectId(id, res)) return;

  try {
    // Emit private notification to the specific participant using broadcastToRaffle
    broadcastToRaffle(id, {
      type: "participantNotification",
      raffleId: id,
      participantId,
      message,
      timestamp: new Date(),
    });

    // Send success response
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



exports.getRaffleById = async (req, res) => {
  const { id } = req.params;

  // Validate and sanitize ObjectId
  if (!validateObjectId(id, res)) return;

  try {
    // Log the incoming request
    console.log(`[INFO] Fetching raffle with ID: ${id}`);

    // Fetch raffle details
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      console.log(`[WARN] Raffle with ID ${id} not found.`);
      return res.status(404).json({ error: `Raffle with ID ${id} not found.` });
    }

    // Validate necessary fields and provide fallback values if missing
    const formattedRaffle = {
      _id: raffle._id,
      raffleId: raffle.raffleId || "N/A",
      raffleName: raffle.raffleName || "N/A",
      entryFee: raffle.entryFee || 0,
      prizeDetails: {
        type: raffle.prizeDetails?.type || "N/A",
        title: raffle.prizeDetails?.title || "N/A",
        amount: raffle.prizeDetails?.amount || "N/A",
        details: raffle.prizeDetails?.details || "N/A",
        imageUrl: raffle.prizeDetails?.imageUrl || "",
        requiresShipping: raffle.prizeDetails?.requiresShipping || false,
        shippingFields: raffle.prizeDetails?.shippingFields || {},
      },
      participants: {
        max: raffle.participants?.max || 0,
        min: raffle.participants?.min || 0,
        ticketsSold: raffle.participants?.ticketsSold || 0,
        tickets: raffle.participants?.tickets || [],
        correct: raffle.participants?.correct || [],
        incorrect: raffle.participants?.incorrect || [],
      },
      time: {
        start: raffle.time?.start || null,
        end: raffle.time?.end || null,
        created: raffle.time?.created || null,
      },
      question: {
        text: raffle.question?.text || "No question available.",
        options: raffle.question?.options || [],
        correctAnswer: raffle.question?.correctAnswer || null,
      },
      status: {
        current: raffle.status?.current || "unknown",
        fulfillment: raffle.status?.fulfillment || "pending",
        isOnChain: raffle.status?.isOnChain || false,
      },
      onChainDetails: raffle.onChainDetails || {},
      offChainDetails: raffle.offChainDetails || {},
      analytics: {
        totalTickets: raffle.analytics?.totalTickets || 0,
        totalEntries: raffle.analytics?.totalEntries || 0,
        totalRefunds: raffle.analytics?.totalRefunds || 0,
        successfulRaffles: raffle.analytics?.successfulRaffles || 0,
        failedRaffles: raffle.analytics?.failedRaffles || 0,
      },
      createdAt: raffle.createdAt || null,
    };

    console.log(`[INFO] Raffle fetched successfully:`, formattedRaffle);

    // Respond with the formatted raffle details
    res.status(200).json({ message: "Raffle fetched successfully.", data: formattedRaffle });
  } catch (err) {
    console.error(`[ERROR] Failed to fetch raffle with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to fetch raffle." });
  }
};




/**
 * Fetch live transactions for a specific raffle
 * @route GET /api/raffles/:raffleId/transactions
 */
exports.getRaffleTransactions = async (req, res) => {
  const { raffleId } = req.params;

  // Validate raffleId
  if (!ObjectId.isValid(raffleId)) {
    return res.status(400).json({ error: "Invalid raffle ID provided." });
  }

  try {
    // Fetch the raffle by ID
    const raffle = await req.db.collection("raffles").findOne({ _id: new ObjectId(raffleId) });

    if (!raffle) {
      return res.status(404).json({ error: "Raffle not found." });
    }

    // Aggregate transactions from different parts of the schema
    const transactions = [
      ...(raffle.participants?.tickets || []).map((ticket) => ({
        type: "purchase",
        participantId: ticket.participantId,
        pubkey: ticket.pubkey,
        amountPaid: ticket.amountPaid,
        timestamp: ticket.purchaseTime,
      })),
      ...(raffle.onChainDetails?.refundList || []).map((refund) => ({
        type: "refund",
        participantId: refund.participantId,
        pubkey: refund.pubkey,
        amountPaid: refund.amountPaid,
        timestamp: refund.timestamp || null,
      })),
      ...(raffle.offChainDetails?.refundList || []).map((refund) => ({
        type: "refund",
        participantId: refund.participantId,
        pubkey: refund.pubkey,
        amountPaid: refund.amountPaid,
        timestamp: refund.timestamp || null,
      })),
    ];

    // Sort transactions by timestamp (most recent first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results for performance (optional)
    const limitedTransactions = transactions.slice(0, 100);

    return res.status(200).json({
      message: "Transactions fetched successfully.",
      data: limitedTransactions,
    });
  } catch (error) {
    console.error(`[ERROR] Failed to fetch transactions for raffle ${raffleId}:`, error);
    return res.status(500).json({ error: "Failed to fetch transactions." });
  }
};
