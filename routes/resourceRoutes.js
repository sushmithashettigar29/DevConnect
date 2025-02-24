const express = require("express");
const Resource = require("../models/Resource");
const upload = require("../middleware/upload");
const fs = require("fs");
const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports = (io) => {
  const router = express.Router();

  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const { userId, title, category } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newResource = new Resource({
        user: userId,
        title,
        category,
        fileUrl: `/uploads/${req.file.filename}`,
      });

      await newResource.save();

      // Get io instance from app
      const io = req.app.get("io");
      if (!io) {
        console.error("Socket.io instance not found");
      } else {
        // Send real-time notifications
        const notifications = user.followers.map((followerId) => ({
          user: followerId,
          sender: userId,
          type: "resource",
          resource: newResource._id,
        }));

        await Notification.insertMany(notifications);

        notifications.forEach((notification) => {
          io.emit("send-notification", {
            receiver: notification.user,
            notification,
          });
        });
      }

      res.status(201).json({
        message: "Resource uploaded successfully",
        resource: newResource,
      });
    } catch (error) {
      console.error("Error uploading resource:", error);
      res
        .status(500)
        .json({ message: "Error uploading resource", error: error.message });
    }
  });

  return router;
};
