const Notification = require("../models/Notification");

const createNotification = async (user, sender, type, post, onlineUsers) => {
  try {
    const notification = new Notification({
      user,
      sender,
      type,
      post,
    });
    await notification.save();

    // Emit real-time notification to the post owner
    const receiverSocketId = onlineUsers.get(user.toString());
    if (receiverSocketId) {
      const io = require("../server").io; // Import the Socket.IO instance
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = createNotification;
