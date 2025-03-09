const express = require("express");
const Notification = require("../models/Notification");
const authenticate = require("../middleware/authenticate");

module.exports = (io, onlineUsers) => {
  const router = express.Router();

  // Get user notifications
  router.get("/:userId", authenticate, async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "name");

      res.json(notifications);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching notifications",
        error: error.message,
      });
    }
  });

  // Mark Notifications as read
  router.put("/mark-as-read/:userId", authenticate, async (req, res) => {
    try {
      const { userId } = req.params;
      await Notification.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true } }
      );

      const userSocketId = onlineUsers.get(userId);
      if (userSocketId) {
        io.to(userSocketId).emit("notifications-read");
      }

      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      res.status(500).json({
        message: "Error marking notifications as read",
        error: error.message,
      });
    }
  });

  return router;
};
