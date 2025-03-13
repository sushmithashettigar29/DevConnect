const express = require("express");
const Message = require("../models/Message");
const authenticate = require("../middleware/authenticate");

module.exports = (io) => {
  const router = express.Router();

  // Send message
  router.post("/send", authenticate, async (req, res) => {
    console.log("Send endpoint hit");
    try {

      const { sender, receiver, content } = req.body;
      console.log("Request payload:", req.body);
      if (!content) {
        return res.status(400).json({ message: "Message cannot be empty" });
      }
  
      // Save the message to the database
      const message = await Message.create({
        sender,
        receiver,
        content,
      });
      await message.save();
      console.log("Message saved to DB:", message); // Debugging
  
      // Emit the message to the receiver
      io.to(receiver).emit("receive-message", message);
  
      res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
      console.error("Error saving message to DB:", error); // Debugging
      res.status(500).json({ message: "Error sending message", error: error.message });
    }
  });

  // Mark Messages as read
  router.put(
    "/mark-as-read/:userId/:receiverId",
    authenticate,
    async (req, res) => {
      try {
        const { userId, receiverId } = req.params;

        await Message.updateMany(
          { sender: receiverId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        );

        res.json({ message: "Messages marked as read" });
      } catch (error) {
        res.status(500).json({
          message: "Error marking messages as read",
          error: error.message,
        });
      }
    }
  );

  // Get messages between two users
  router.get("/:user1/:user2", authenticate, async (req, res) => {
    try {
      const { user1, user2 } = req.params;
      const messages = await Message.find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      })
        .sort({ createdAt: 1 })
        .populate("sender", "name")
        .populate("receiver", "name");

      res.json(messages);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching messages", error: error.message });
    }
  });

  // Get all conversations for a user
  router.get("/conversations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name")
        .populate("receiver", "name");

      const conversations = {};
      messages.forEach((msg) => {
        const chatPartner =
          msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
        if (!conversations[chatPartner._id]) {
          conversations[chatPartner._id] = {
            user: chatPartner,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
          };
        }
      });

      res.json(Object.values(conversations));
    } catch (error) {
      res.status(500).json({
        message: "Error fetching conversations",
        error: error.message,
      });
    }
  });

  // Delete a single message
  router.delete("/delete/:messageId", async (req, res) => {
    try {
      const { messageId } = req.params;

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      await Message.findByIdAndDelete(messageId);
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting message", error: error.message });
    }
  });

  // Delete an entire conversation
  router.delete("/delete-conversation/:user1/:user2", async (req, res) => {
    try {
      const { user1, user2 } = req.params;

      const messages = await Message.deleteMany({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      });
      res.json({
        message: "Conversation deleted successfully",
        deletedCount: messages.deletedCount,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting conversation", error: error.message });
    }
  });

  // Unread message count
  router.get("/unread/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const unreadCount = await Message.countDocuments({
        receiver: userId,
        isRead: false,
      });

      res.json({ unreadMessages: unreadCount });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching unread messages count",
        error: error.message,
      });
    }
  });

  return router;
};
