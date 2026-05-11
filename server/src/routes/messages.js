const router = require("express").Router();
const { protect, memberOnly, trainerOnly } = require("../middleware/auth");
const {
  broadcast,
  getBroadcasts,
} = require("../controllers/trainerController");
const { getInbox, markAsRead } = require("../controllers/messageController");

// Trainer routes
router.post("/broadcast", protect, trainerOnly, broadcast);
router.post("/send", protect, trainerOnly, broadcast); // Uses same broadcast function with recipientIds
router.get("/sent", protect, trainerOnly, getBroadcasts);

// Member routes
router.get("/inbox", protect, memberOnly, getInbox);
router.put("/:id/read", protect, memberOnly, markAsRead);

module.exports = router;
