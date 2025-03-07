const express = require("express");
const Resource = require("../models/Resource");
const upload = require("../middleware/upload");

const router = express.Router();

// Upload route
router.post("/upload-resource", upload.single("file"), async (req, res) => {
  try {
    const { userId, title, category } = req.body;

    if (!userId || !title || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newResource = new Resource({
      user: userId,
      title,
      category: JSON.parse(category),
      fileUrl: `/uploads/${req.file.filename}`,
    });

    await newResource.save();

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
    const searchQuery = (req.query.search || "").trim();
    const sortOrder = req.query.sort || "newest";

    const matchStage = searchQuery
      ? {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
            { "user.name": { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const sortStage =
      sortOrder === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const resources = await Resource.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: matchStage },
      { $sort: sortStage },
      {
        $project: {
          title: 1,
          category: 1,
          fileUrl: 1,

          createdAt: 1,
          "user.name": 1,
          "user._id": 1,
        },
      },
    ]);

    res.status(200).json({ status: "ok", data: resources });
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch resources", error: error.message });
  }
});

// Delete reosurce
router.delete("/:id", async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { userId } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this resource" });
    }

    await Resource.findByIdAndDelete(resourceId);

    res
      .status(200)
      .json({ status: "ok", message: "Resource deleted successfully" });
  } catch (error) {
    console.log("Error deleting resource : ", error);
    res
      .status(500)
      .json({ message: "Failed to delete resource", error: error.message });
  }
});

module.exports = router;
