const Message = require("../models/Message");
const mongoose = require("mongoose");

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    const message = new Message({ sender, receiver, content, isRead: false });
    await message.save();
    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid senderId or receiverId format" });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name _id")
      .populate("receiver", "name _id");

    if (!messages.length) {
      return res.status(404).json({ message: "No conversations found" });
    }

    const conversations = {};
    messages.forEach((msg) => {
      const chatPartner =
        msg.sender._id.toString() === userId ? msg.receiver : msg.sender;

      if (!conversations[chatPartner._id]) {
        conversations[chatPartner._id] = {
          user: {
            _id: chatPartner._id,
            name: chatPartner.name,
          },
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
        };
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

exports.getUnreadMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const unreadMessages = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });

    res.json({ unreadMessages });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRecieverMessages = async (req, res) => {
  const { receiverId } = req.params;
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const currentUserId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
