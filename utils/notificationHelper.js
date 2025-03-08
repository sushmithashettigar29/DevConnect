const Notification = require("../models/Notification");

const createNotification = async (
  userId,
  senderId,
  type,
  postId = null,
  resourceId = null
) => {
  try {
    const notification = new Notification({
      user: userId,
      sender: senderId,
      type,
      post: postId,
      resource: resourceId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.log("Error creating notification : ", error);
    throw error;
  }
};

module.exports = createNotification;
