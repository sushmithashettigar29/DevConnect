const express = require("express");
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadMessages,
  getRecieverMessages,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Send a message
router.post("/send", authenticate, sendMessage);

// Get messages between two users
router.get("/:senderId/:receiverId", authenticate, getMessages);

// Get all conversations for a user
router.get("/conversations/:userId", authenticate, getConversations);

// Fetch unread messages count
router.get("/unread/:userId", authenticate, getUnreadMessages);

router.get("/:receiverId", protect, getRecieverMessages);

module.exports = router;
