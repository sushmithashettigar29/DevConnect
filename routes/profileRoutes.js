const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Resource = require("../models/Resource");
const multer = require("multer");
const path = require("path");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      bio,
      profilePicture,
      gender,
      linkedin,
      github,
      instagram,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, bio, profilePicture, gender, linkedin, github, instagram },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// Upload Profile Picture
router.post(
  "/upload-profile-picture",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("Received file:", req.file);
      console.log("User ID from authentication:", req.userId);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();

      console.log("Profile picture updated for user:", user);

      res.json({
        message: "Profile picture uploaded successfully",
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      console.log("Error uploading profile picture:", error);
      res.status(500).json({
        message: "Error uploading profile picture",
        error: error.message,
      });
    }
  }
);

module.exports = router;
