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
    const { id } = req.params; // User to be followed
    const userId = req.userId; // Current logged-in user

    if (!id || !userId) {
      return res
        .status(400)
        .json({ message: "Invalid request. User ID missing." });
    }

    if (id === userId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (currentUser.following.includes(id)) {
      return res.status(400).json({ message: "Already following this user." });
    }

    currentUser.following.push(id);
    userToFollow.followers.push(userId);

    await currentUser.save();
    await userToFollow.save();

    return res.json({ success: true, message: "User followed successfully." });
  } catch (error) {
    console.error("Follow error:", error);
    return res
      .status(500)
      .json({ message: "Server error while following user." });
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

    if (currentUser.following.includes(id)) {
      currentUser.following = currentUser.following.filter(
        (uid) => uid.toString() !== id
      );

      userToUnfollow.followers = userToUnfollow.followers.filter(
        (uid) => uid.toString() !== userId
      );

      await currentUser.save();
      await userToUnfollow.save();

      return res.json({ message: "User unfollowed successfully" });
    } else {
      return res.status(400).json({ message: "Not following this user" });
    }
  } catch (error) {
    console.error("Unfollow error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get following list of a user
router.get("/following/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "following",
      "name profilePicture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get followers list of a user
router.get("/followers/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "followers",
      "name profilePicture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.followers);
  } catch (error) {
    console.error("Error fetching followers list : ", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
