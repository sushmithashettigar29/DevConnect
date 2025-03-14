const Message = require("../models/Message");
const mongoose = require("mongoose");
// Send a new message
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

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Validate senderId and receiverId
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

// Get conversations for a user
exports.getConversations = async (req, res) => {
  console.log("Function started"); // Debugging
  try {
    const { userId } = req.params;
    console.log("User ID from getconv:", userId); // Debugging

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId format"); // Debugging
      return res.status(400).json({ error: "Invalid userId format" });
    }

    console.log("Fetching messages from database"); // Debugging
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name _id")
      .populate("receiver", "name _id");

    console.log("Messages fetched:", messages); // Debugging

    if (!messages.length) {
      console.log("No conversations found"); // Debugging
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

    console.log("Conversations processed:", conversations); // Debugging
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
