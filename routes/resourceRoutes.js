const express = require("express");
const Resource = require("../models/Resource");
const upload = require("../middleware/upload");

const router = express.Router();

// Upload route
router.post("/upload-resource", upload.single("file"), async (req, res) => {
  try {
    const { userId, title, category } = req.body;

    // Validate required fields
    if (!userId || !title || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save resource to the database
    const newResource = new Resource({
      user: userId,
      title,
      category: JSON.parse(category),
      fileUrl: `/upload/${req.file.filename}`,
    });

    await newResource.save();

    // Respond to the client
    res.status(201).json({
      message: "Resource uploaded successfully",
      resource: newResource,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// Get all resources route
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find({}).populate("user", "name");;
    res.status(200).json({ status: "ok", data: resources });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch resources", error: error.message });
  }
});

module.exports = router;
