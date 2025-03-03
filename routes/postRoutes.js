const express = require("express");
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const router = express.Router();

//Configure Multer for image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

//Create a post
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { userId, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      user: userId,
      content,
      image,
    });

    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
});

// Get all posts
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePicture") // Ensure profilePicture is populated
      .populate("comments.user", "name profilePicture") // Populate profilePicture for comments
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

// Like/Unlike Post
router.post("/like", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likeCount = post.likes.length; // Update likeCount
    } else {
      // Like the post
      post.likes.push(userId);
      post.likeCount = post.likes.length; // Update likeCount
    }

    await post.save(); // Save changes to DB

    return res.json({
      message: hasLiked ? "Post unliked" : "Post liked",
      liked: !hasLiked,
      likeCount: post.likeCount, // Send updated like count
    });
  } catch (error) {
    console.error("Error in like route:", error);
    res
      .status(500)
      .json({ message: "Error liking post", error: error.message });
  }
});

// Comment on a Post
router.post("/comment", async (req, res) => {
  try {
    const { userId, postId, text } = req.body;

    if (!text)
      return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: userId, text, createdAt: new Date() };
    post.comments.push(comment);
    post.commentCount = post.comments.length;
    await post.save();

    if (post.user.toString() !== userId) {
      const notification = new Notification({
        user: post.user,
        sender: userId,
        type: "comment",
        post: postId,
      });
      await notification.save();
    }
    res.status(201).json({ message: "Comment added successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

router.get("/comment/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .populate("comments.user", "name profilePicture") // Populate profilePicture for comments
      .populate("comments.replies.user", "name profilePicture"); // Populate profilePicture for replies

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
});

// Edit Post
router.put("/edit/:postId", upload.single("image"), async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own post" });
    }

    if (content) post.content = content;
    if (image) post.image = image; // Update image if uploaded

    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
});

// Delete Post
router.delete("/delete/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own post" });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
});

// Delete comment
router.delete("/comment/:postId/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment to delete
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is authorized to delete the comment
    const isCommentAuthor =
      post.comments[commentIndex].user.toString() === userId;
    const isPostOwner = post.user.toString() === userId;

    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the comment from the array
    post.comments.splice(commentIndex, 1);
    post.commentCount = post.comments.length; // Update comment count
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
});

// Comment reply
router.post("/comment/:postId/:commentId/reply", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, text } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the parent comment
    const parentComment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create the reply
    const newReply = {
      user: new mongoose.Types.ObjectId(userId), // Ensure ObjectId format
      text,
      createdAt: new Date(),
    };

    // Add reply inside the replies array
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.push(newReply);

    // Increment the comment count
    post.commentCount += 1;

    // Save the updated post with the new reply
    await post.save();

    res.status(201).json({
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (error) {
    console.error("Error replying to comment", error);
    res.status(500).json({ message: "Error replying to comment", error });
  }
});

// Delete replied comment
router.delete(
  "/comment/:postId/:commentId/reply/:replyId",
  async (req, res) => {
    const { postId, commentId, replyId } = req.params;
    const { userId } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Find the parent comment
      const parentComment = post.comments.find(
        (comment) => comment._id.toString() === commentId
      );

      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      // Find the reply to delete
      const replyIndex = parentComment.replies.findIndex(
        (reply) => reply._id.toString() === replyId
      );

      if (replyIndex === -1) {
        return res.status(404).json({ message: "Reply not found" });
      }

      // Check if the user is authorized to delete the reply
      if (parentComment.replies[replyIndex].user.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Remove the reply from the array
      parentComment.replies.splice(replyIndex, 1);

      // Decrement the comment count
      post.commentCount -= 1;

      // Save the updated post
      await post.save();

      res.status(200).json({ message: "Reply deleted successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Error deleting reply", error });
    }
  }
);
module.exports = router;
