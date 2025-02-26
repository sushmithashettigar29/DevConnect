const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Follow User
router.post("/follow/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (id === userId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(id.toString())) {
      currentUser.following.push(id);
      userToFollow.followers.push(userId);

      await currentUser.save();
      await userToFollow.save();

      const notification = new Notification({
        user: id,
        sender: userId,
        type: "follow",
      });
      await notification.save();

      res.json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "You already follow this user" });
    }
  } catch (error) {
    console.error("Error following user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while following the user" });
  }
});

// Unfollow User
router.post("/unfollow/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(id.toString())) {
      currentUser.following = currentUser.following.filter(
        (uid) => uid.toString() !== id
      );
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (uid) => uid.toString() !== userId
      );
      await currentUser.save();
      await userToUnfollow.save();
      res.json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You are not following this user" });
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while unfollowing the user" });
  }
});

module.exports = router;
