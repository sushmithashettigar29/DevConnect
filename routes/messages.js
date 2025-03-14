const express = require("express");
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadMessages,
} = require("../controllers/messageController");
const router = express.Router();

// Send a message
router.post("/send", sendMessage);

// Get messages between two users
router.get("/:senderId/:receiverId", getMessages);

// Get all conversations for a user
router.get("/conversations/:userId", getConversations);

// Fetch unread messages count
router.get("/unread/:userId", getUnreadMessages);

module.exports = router;
