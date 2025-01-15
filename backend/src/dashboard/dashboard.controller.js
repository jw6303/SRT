const { ObjectId } = require("mongodb"); // Import ObjectId

// Fetch all raffles for admin dashboard
exports.getAllRaffles = async (req, res) => {
  try {
    const raffles = await req.db.collection("raffles").find().toArray();
    res.render("overview", { raffles }); // Pass raffles data to overview.ejs
  } catch (err) {
    console.error("[ERROR] Failed to fetch raffles:", err);
    res.status(500).send("Failed to load raffles.");
  }
};

// Fetch specific raffle details
exports.getRaffleById = async (req, res) => {
  const { id } = req.params;

  if (!req.db || !id) {
    return res.status(400).send("Invalid request or database not connected.");
  }

  try {
    const raffle = await req.db
      .collection("raffles")
      .findOne({ _id: new ObjectId(id) });

    if (!raffle) {
      return res.status(404).send("Raffle not found.");
    }

    res.render("raffleDetails", { raffle }); // Pass raffle data to raffleDetails.ejs
  } catch (err) {
    console.error(`[ERROR] Failed to fetch raffle with ID ${id}:`, err);
    res.status(500).send("Failed to load raffle details.");
  }
};
