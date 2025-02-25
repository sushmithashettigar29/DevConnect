const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Resource = require("../models/Resource");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    const user = await User.findById(id)
      .populate("followers", "name email")
      .populate("following", "name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ user: id }).sort({ createdAt: -1 });
    const resources = await Resource.find({ user: id }).sort({
      createdAt: -1,
    });

    res.json({
      user,
      posts,
      resources,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
});

module.exports = router;
