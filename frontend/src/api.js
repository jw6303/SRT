// Base URL for the backend
const API_BASE_URL = "http://localhost:5000/api/raffles";

/**
 * Fetch all active raffles
 * @param {Object} options - Query options for filtering and pagination
 * @returns {Promise<Object>} - Object containing raffles and metadata
 */
export const fetchActiveRaffles = async (options = {}) => {
  const {
    prizeType,
    maxParticipants,
    fulfillment,
    sortField = "time.start",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = options;

  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (prizeType) queryParams.append("prizeType", prizeType);
    if (maxParticipants) queryParams.append("maxParticipants", maxParticipants);
    if (fulfillment) queryParams.append("fulfillment", fulfillment);

    queryParams.append("sortField", sortField);
    queryParams.append("sortOrder", sortOrder);
    queryParams.append("page", page);
    queryParams.append("limit", limit);

    // Fetch data from API
    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    if (!response.ok) throw new Error(`Failed to fetch raffles: ${response.statusText}`);

    const data = await response.json();
    console.log("Fetched Active Raffles:", data); // Debugging: Log full response
    return {
      raffles: data?.data || [], // Map `data` to `raffles`
      meta: data?.meta || {},
    };
  } catch (error) {
    console.error("Error fetching active raffles:", error.message);
    throw error;
  }
};



/**
 * Fetch raffle details by ID
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Details of the specified raffle
 */
export const fetchRaffleDetails = async (id) => {
  if (!id) {
    console.error("Raffle ID is required.");
    throw new Error("Raffle ID is required.");
  }

  const url = `${API_BASE_URL}/${id}`;
  console.log(`Fetching raffle details from: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Backend Response Error: ${response.status} - ${errorMessage}`);
      throw new Error(`Failed to fetch raffle details: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Fetched raffle details:", data);
    
    
        // Ensure the response includes `requiresShipping`
    if (data?.data?.prizeDetails?.requiresShipping === true) {
      console.log("Shipping information is required for this raffle.");
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching details for raffle ID ${id}:`, error);
    throw error;
  }
};



/**
 * Register a participant in a raffle
 * @param {string} id - The ID of the raffle
 * @param {Object} participantData - The participant details (participantId, name, pubkey, answer, amountPaid, shippingInfo)
 * @returns {Promise<Object>} - Confirmation of registration
 */
export const registerParticipant = async (id, participantData) => {
  if (!id) {
    console.error("Raffle ID is required.");
    throw new Error("Raffle ID is required.");
  }

  if (
    !participantData ||
    !participantData.participantId ||
    !participantData.name ||
    !participantData.pubkey ||
    !participantData.answer ||
    !participantData.amountPaid
  ) {
    console.error("Participant data is incomplete.");
    throw new Error("All participant details (participantId, name, pubkey, answer, amountPaid) are required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participantData), // Include shippingInfo dynamically
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to register participant: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error registering participant for raffle ID ${id}:`, error);
    throw error;
  }
};



/**
 * Conclude a raffle by ID
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Winner details or conclusion result
 */
export const concludeRaffle = async (id) => {
  if (!id) {
    console.error("Raffle ID is required.");
    throw new Error("Raffle ID is required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}/conclude`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to conclude raffle: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error concluding raffle with ID ${id}:`, error);
    throw error;
  }
};



/**
 * Extend a raffle's end time
 * @param {string} id - The ID of the raffle
 * @param {number} additionalTime - Time to add in minutes
 * @returns {Promise<Object>} - Updated raffle details
 */
export const extendRaffle = async (id, additionalTime) => {
  if (!id || typeof additionalTime !== "number" || additionalTime <= 0) {
    console.error("Invalid input: Raffle ID and a positive additionalTime are required.");
    throw new Error("Invalid input: Raffle ID and a valid additional time (in minutes) are required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ additionalTime }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to extend raffle: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error extending raffle with ID ${id}:`, error.message);
    throw error;
  }
};



/**
 * Create a new raffle
 * @param {Object} raffleData - The raffle details (raffleId, entryFee, prizeDetails, participants, etc.)
 * @returns {Promise<Object>} - Confirmation of raffle creation
 */
export const createRaffle = async (raffleData) => {
  // Input validation to ensure critical fields are present
  if (
    !raffleData ||
    !raffleData.raffleId ||
    !raffleData.entryFee ||
    !raffleData.prizeDetails?.type ||
    !raffleData.participants?.max ||
    !raffleData.participants?.min ||
    !raffleData.time?.start ||
    !raffleData.time?.end ||
    !raffleData.question?.text ||
    !raffleData.question?.correctAnswer
  ) {
    console.error("Invalid input: Raffle data is incomplete or missing required fields.");
    throw new Error("Invalid input: Please provide all required raffle details.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raffleData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to create raffle: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating raffle:", error.message);
    throw error;
  }
};



/**
 * Fetch participants for a specific raffle
 * @param {string} id - The ID of the raffle
 * @param {Object} options - Options for fetching participants (e.g., filter, page, limit)
 * @param {string} [options.filter="all"] - Filter by type of participants ("all", "correct", "incorrect")
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of participants per page
 * @returns {Promise<Object>} - Object containing filtered participants and metadata
 */
export const fetchParticipants = async (id, options = {}) => {
  const { filter = "all", page = 1, limit = 10 } = options;

  // Validate required ID
  if (!id) {
    console.error("Raffle ID is required to fetch participants.");
    throw new Error("Raffle ID is required.");
  }

  try {
    const queryParams = new URLSearchParams({
      filter,
      page: String(page),
      limit: String(limit),
    }).toString();

    const response = await fetch(`${API_BASE_URL}/${id}/participants?${queryParams}`);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch participants: ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching participants for raffle ${id}:`, error.message);
    throw error;
  }
};



/**
 * Purchase a ticket for a specific raffle
 * @param {string} id - The ID of the raffle
 * @param {Object} purchaseData - Data related to the ticket purchase (e.g., participantId, name, pubkey, ticketCount)
 * @param {string} purchaseData.participantId - Unique ID of the participant
 * @param {string} purchaseData.name - Name of the participant
 * @param {string} purchaseData.pubkey - Public key of the participant
 * @param {number} purchaseData.ticketCount - Number of tickets to purchase
 * @returns {Promise<Object>} - Confirmation of ticket purchase and updated raffle details
 */
export const purchaseTicket = async (id, purchaseData) => {
  // Validate input parameters
  if (!id) {
    throw new Error("Raffle ID is required to purchase a ticket.");
  }

  if (!purchaseData || !purchaseData.participantId || !purchaseData.pubkey || !purchaseData.ticketCount) {
    throw new Error("Valid purchase data (participantId, pubkey, ticketCount) is required.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}/purchase-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to purchase ticket: ${errorMessage}`);
    }

    const data = await response.json();
    return data; // Return the JSON response from the backend
  } catch (error) {
    console.error(`Error purchasing ticket for raffle ${id}:`, error.message);
    throw error; // Re-throw the error for the caller to handle
  }
};


/**
 * Fetch program information
 * @returns {Promise<Object>} - Program-level metadata or configuration
 */
export const fetchProgramInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch program info: ${errorMessage}`);
    }

    const programInfo = await response.json();
    return programInfo;
  } catch (error) {
    console.error("Error fetching program info:", error.message);
    throw error;
  }
};


/**
 * Fetch raffle analytics
 * @returns {Promise<Object>} - Analytics summary
 */
export const fetchAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch analytics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};


/**
 * Notify a specific participant
 * @param {string} raffleId - The ID of the raffle
 * @param {string} participantId - The participant's unique ID
 * @param {string} message - Notification message
 * @returns {Promise<Object>} - Confirmation of notification
 */
export const notifyParticipant = async (raffleId, participantId, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${raffleId}/notify-participant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, message }),
    });

    if (!response.ok) throw new Error("Failed to notify participant");
    return await response.json();
  } catch (error) {
    console.error(`Error notifying participant ${participantId}:`, error);
    throw error;
  }
};



/**
 * Fetch winner details for a concluded raffle
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Winner details
 */
export const fetchWinnerDetails = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/winner`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to fetch winner details");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching winner details for raffle ${id}:`, error);
    throw error;
  }
};


/**
 * Fetch live transactions for a specific raffle
 * @param {string} raffleId - The ID of the raffle
 * @returns {Promise<Object[]>} - Array of transactions related to the raffle
 */
export const fetchRaffleTransactions = async (raffleId) => {
  if (!raffleId) {
    throw new Error("Raffle ID is required to fetch transactions.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${raffleId}/transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch transactions: ${errorMessage}`);
    }

    const data = await response.json();
    console.log(`Fetched transactions for raffle ID ${raffleId}:`, data); // Debugging
    return data.data || []; // Return transaction array
  } catch (error) {
    console.error(`Error fetching transactions for raffle ${raffleId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
};