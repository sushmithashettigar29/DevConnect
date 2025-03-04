const express = require("express");
const Resource = require("../models/Resource");
const upload = require("../middleware/upload");
const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports = (io) => {
  const router = express.Router();

  // Helper function to send notifications
  const sendNotifications = async (userId, resourceId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found");
        return;
      }

      const notifications = user.followers.map((followerId) => ({
        user: followerId,
        sender: userId,
        type: "resource",
        resource: resourceId,
      }));

      await Notification.insertMany(notifications);

      // Emit notifications to followers via Socket.IO
      notifications.forEach((notification) => {
        io.emit("send-notification", {
          receiver: notification.user,
          notification,
        });
      });

      console.log("✅ Notifications sent successfully.");
    } catch (error) {
      console.error("Failed to send notifications:", error);
    }
  };

  // Upload route
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const { userId, title, category } = req.body;

      // Validate required fields
      if (!userId || !title || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Save resource to the database
      const newResource = new Resource({
        user: userId,
        title,
        category: JSON.parse(category),
        fileUrl: `/uploads/${req.file.filename}`,
      });

      await newResource.save();

      // Respond to the client
      res.status(201).json({
        message: "Resource uploaded successfully",
        resource: newResource,
      });

      // Send notifications in the background
      process.nextTick(() => sendNotifications(userId, newResource._id));
    } catch (error) {
      console.error("Upload failed:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  });

  return router;
};
