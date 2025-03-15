const Notification = require("../models/Notification");

const createNotification = async (user, sender, type, post, onlineUsers) => {
  try {
    console.log("Creating notification:", { user, sender, type, post });

    const notification = new Notification({
      user,
      sender,
      type,
      post,
    });
    await notification.save();

    console.log("Notification saved:", notification);

    const receiverSocketId = onlineUsers.get(user.toString());
    if (receiverSocketId) {
      const io = require("../server").io;
      io.to(receiverSocketId).emit("receive-notification", notification);
      console.log("Notification emitted to receiver:", receiverSocketId);
    } else {
      console.log("Receiver is offline. Notification saved but not emitted.");
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

module.exports = createNotification;