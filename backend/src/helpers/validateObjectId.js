const { ObjectId } = require("mongodb");

// Helper: Validate ObjectId
function validateObjectId(id, res) {
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid raffle ID" });
    return false;
  }
  return true;
}
module.exports = validateObjectId;
