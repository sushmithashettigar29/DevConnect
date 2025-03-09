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

    const receiverSocketId = onlineUsers.get(user.toString());
    if (receiverSocketId) {
      const io = require("../server").io;
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = createNotification;
