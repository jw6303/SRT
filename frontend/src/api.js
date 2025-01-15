// Base URL for the backend
const API_BASE_URL = "http://localhost:5000/api/raffles";

/**
 * Fetch all active raffles
 * @returns {Promise<Array>} - List of active raffles
 */
export const fetchActiveRaffles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) throw new Error("Failed to fetch active raffles");
    return await response.json();
  } catch (error) {
    console.error("Error fetching active raffles:", error);
    throw error;
  }
};

/**
 * Fetch raffle details by ID
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Details of the specified raffle
 */
export const fetchRaffleDetails = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/${id}`);
    if (!response.ok) throw new Error("Failed to fetch raffle details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching raffle details:", error);
    throw error;
  }
};

/**
 * Register a participant in a raffle
 * @param {string} id - The ID of the raffle
 * @param {Object} participantData - The participant details (participantId, name, answer)
 * @returns {Promise<Object>} - Confirmation of registration
 */
export const registerParticipant = async (id, participantData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(participantData),
    });
    if (!response.ok) throw new Error("Failed to register participant");
    return await response.json();
  } catch (error) {
    console.error(`Error registering participant for raffle ${id}:`, error);
    throw error;
  }
};

/**
 * Conclude a raffle by ID
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Winner details or conclusion result
 */
export const concludeRaffle = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/conclude`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to conclude raffle");
    return await response.json();
  } catch (error) {
    console.error(`Error concluding raffle ${id}:`, error);
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
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/extend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ additionalTime }),
    });
    if (!response.ok) throw new Error("Failed to extend raffle");
    return await response.json();
  } catch (error) {
    console.error(`Error extending raffle ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new raffle
 * @param {Object} raffleData - The raffle details (raffleId, entryFee, prizeAmount, etc.)
 * @returns {Promise<Object>} - Confirmation of raffle creation
 */
export const createRaffle = async (raffleData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raffleData),
    });
    if (!response.ok) throw new Error("Failed to create raffle");
    return await response.json();
  } catch (error) {
    console.error("Error creating raffle:", error);
    throw error;
  }
};

/**
 * Fetch participants for a specific raffle
 * @param {string} id - The ID of the raffle
 * @returns {Promise<Object>} - Object with participantsCorrect and participantsIncorrect arrays
 */
export const fetchParticipants = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/participants`);
    if (!response.ok) throw new Error("Failed to fetch participants");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching participants for raffle ${id}:`, error);
    throw error;
  }
};

/**
 * Purchase a ticket for a specific raffle
 * @param {string} id - The ID of the raffle
 * @param {Object} purchaseData - Data related to the ticket purchase (participantId, name, pubkey)
 * @returns {Promise<Object>} - Confirmation of ticket purchase
 */
export const purchaseTicket = async (id, purchaseData) => {
  try {
    const response = await fetch(`http://localhost:5000/api/raffles/${id}/purchase-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchaseData), // Send the purchase data
    });

    if (!response.ok) {
      throw new Error(`Failed to purchase ticket: ${response.statusText}`);
    }

    return await response.json(); // Return the JSON response from the backend
  } catch (error) {
    console.error(`Error purchasing ticket for raffle ${id}:`, error); // Log any errors
    throw error; // Re-throw the error for the caller to handle
  }
};


/**
 * Fetch program information
 * @returns {Promise<Object>} - Program-level metadata or configuration
 */
export const fetchProgramInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/info`);
    if (!response.ok) throw new Error("Failed to fetch program info");
    return await response.json();
  } catch (error) {
    console.error("Error fetching program info:", error);
    throw error;
  }
};



