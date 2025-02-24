const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Resource = require("../models/Resource");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const users = await User.find({
      name: { $regex: query, $options: "i" },
    }).select("name email");

    const posts = await Post.find({
      content: { $regex: query, $options: "i" },
    }).populate("user", "name");

    const resources = await Resource.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("user", "name");

    res.json({ users, posts, resources });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error performin search", error: error.message });
  }
});

module.exports = router;