import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Comment from "../components/Comment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FaSearch, FaFilter } from "react-icons/fa";

function Home() {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPostIdForMenu, setSelectedPostIdForMenu] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    console.log("Search Query Sent to Backend:", searchQuery);
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all", {
          params: {
            search: searchQuery,
            sort: sortOrder,
          },
        });
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else {
          console.error("Expected an array of posts, but got:", res.data);
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching posts", error);
      }
    };
    const fetchFollowing = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await axios.get(
          `http://localhost:5000/api/users/following/${userId}`
        );
        if (Array.isArray(res.data)) {
          setFollowing(new Set(res.data.map((user) => user._id)));
        } else {
          console.error("Expected an array of users, but got:", res.data);
        }
      } catch (error) {
        console.error("Error fetching following list", error);
      }
    };

    fetchPosts();
    fetchFollowing();
  }, [searchQuery, sortOrder]);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/posts/like", {
        userId,
        postId,
      });
  
      console.log("Backend Response:", res.data); // Debugging
  
      // Update the posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.liked
                  ? [...post.likes, userId] // Add user to likes
                  : post.likes.filter((id) => id !== userId), // Remove user from likes
                likeCount: res.data.likeCount, // Update like count
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post", error);
    }
  };

  const handleFollow = async (followerUserId) => {
    const token = localStorage.getItem("token");

    console.log("🔹 Attempting to follow user:", followerUserId);
    console.log("🔹 Token being sent:", token);

    if (!token) {
      console.error("🚨 No token found in localStorage!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/follow/${followerUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Follow success:", response.data);
      setFollowing((prev) => new Set([...Array.from(prev), followerUserId]));
    } catch (error) {
      console.error("🚨 Error following user:", error.response?.data || error);
    }
  };

  const handleUnfollow = async (followedUserId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/unfollow/${followedUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(followedUserId);
        return new Set(newSet);
      });
    } catch (error) {
      console.error("Error unfollowing user", error);
    }
  };

  const handleCommentClick = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/comment/${postId}`
      );
      setComments(res.data);
      setSelectedPostId(postId);
      setIsCommentsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleCommentSubmit = async () => {
    try {
      if (!newComment.trim()) {
        alert("Comment conanot be empty");
        return;
      }

      await axios.post(`http://localhost:5000/api/posts/comment`, {
        userId,
        postId: selectedPostId,
        text: newComment,
      });

      setComments((prevComments) => [
        ...prevComments,
        { user: { _id: userId, name: "You" }, text: newComment },
      ]);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPostId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );
      setNewComment("");
    } catch (error) {
      console.log("Error submitting comment", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/posts/comment/${selectedPostId}/${commentId}`,
        {
          data: { userId },
        }
      );

      // Remove the deleted comment from UI
      setComments((prevComments) =>
        prevComments.filter((c) => c._id !== commentId)
      );

      // Update comment count on post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPostId
            ? { ...post, commentCount: post.commentCount - 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment", error);
    }
  };

  const handleReplyComment = async (commentId, replyText) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/comment/${selectedPostId}/${commentId}/reply`,
        { userId, text: replyText }
      );

      // Update the UI with the new reply
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), res.data.reply], // Append new reply
              }
            : comment
        )
      );

      // Update the comment count in the posts list
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPostId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error replying to comment", error);
    }
  };

  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostIdForMenu(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostIdForMenu(null);
    setNewImage(null);
  };

  const handleEditPost = (postId) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) ReadableStreamDefaultController;
      setEditedContent(post.content);
      setIsEditDialogOpen(true);
      setSelectedPostIdForMenu(postId);
    } catch (error) {
      console.log("Error preparing to edit post", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("content", editedContent);

      // Find the selected post from the `posts` state
      const selectedPost = posts.find(
        (post) => post._id === selectedPostIdForMenu
      );

      if (!selectedPost) {
        console.error("Selected post not found");
        return;
      }

      if (newImage) {
        formData.append("image", newImage); // Add new image if uploaded
      } else if (!newImage && selectedPost.image) {
        formData.append("deleteImage", "true"); // Flag to delete existing image
      }

      const res = await axios.put(
        `http://localhost:5000/api/posts/edit/${selectedPostIdForMenu}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );

      // Update the posts state with the edited post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPostIdForMenu
            ? { ...post, content: editedContent, image: res.data.post.image }
            : post
        )
      );

      setIsEditDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error("Error editing post", error);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`, {
        data: { userId },
      });

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

      setIsDeleteDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting post", error);
    }
  };

  const handleSharePost = (postId) => {
    const postLink = `http://localhost:5173/posts/${postId}`;
    navigator.clipboard
      .writeText(postLink)
      .then(() => {
        alert("Post link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link.");
      });
    handleMenuClose();
  };

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
      <div className="max-w-3xl max-auto mt-4 p-4">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch className="text-gray-500" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                  }
                >
                  <FaFilter className="text-gray-600" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
      {posts.length > 0 ? (
        posts.map((post) => (
          <Grid item xs={12} sm={6} key={post._id}>
            <Card sx={{ marginBottom: 2, borderRadius: 2, overflow: "hidden" }}>
              <CardContent>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item display="flex" alignItems="center">
                    <Grid
                      container
                      alignItems="center"
                      spacing={1}
                      sx={{ marginBottom: 2 }}
                    >
                      <Grid item>
                        <Avatar
                          src={
                            post.user?.profilePicture
                              ? `http://localhost:5000${post.user.profilePicture}`
                              : ""
                          }
                          alt={post.user?.name || "User"}
                        />
                      </Grid>
                      <Grid item>
                        <Typography variant="h6">
                          {post.user?.name || "Unknown User"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {post.user._id !== userId ? (
                    following.has(post.user._id) ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleUnfollow(post.user._id)}
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleFollow(post.user._id)}
                      >
                        Follow
                      </Button>
                    )
                  ) : (
                    <IconButton
                      onClick={(event) => handleMenuOpen(event, post._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => handleEditPost(selectedPostIdForMenu)}
                    >
                      Edit
                    </MenuItem>
                    <Dialog
                      open={isEditDialogOpen}
                      onClose={() => setIsEditDialogOpen(false)}
                      fullWidth
                    >
                      <DialogTitle>Edit Post</DialogTitle>
                      <DialogContent>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Edit your post..."
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          sx={{ marginBottom: 2 }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewImage(e.target.files[0])}
                          style={{ marginBottom: 2 }}
                        />
                        {post.image && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setNewImage(null)} // Clear the image
                            sx={{ marginBottom: 2 }}
                          >
                            Delete Image
                          </Button>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} color="primary">
                          Save
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <MenuItem
                      onClick={() => handleDeletePost(selectedPostIdForMenu)}
                    >
                      Delete
                    </MenuItem>
                    <Dialog
                      open={isDeleteDialogOpen}
                      onClose={() => setIsDeleteDialogOpen(false)}
                      fullWidth
                    >
                      <DialogTitle>Delete Post</DialogTitle>
                      <DialogContent>
                        <Typography>
                          Are you sure you want to delete this post?
                        </Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeletePost(selectedPostIdForMenu)
                          }
                          color="error"
                        >
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <MenuItem
                      onClick={() => handleSharePost(selectedPostIdForMenu)}
                    >
                      Share
                    </MenuItem>
                  </Menu>
                </Grid>

                {/* Post Content */}
                <Typography variant="body1" sx={{ marginTop: 1 }}>
                  {post.content}
                </Typography>

                {post.image &&
                  post.image.trim() &&
                  post.image !== "null" &&
                  post.image !== "undefined" && (
                    <img
                      src={`http://localhost:5000${post.image}`}
                      alt="Post"
                      style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
                      onError={(e) => e.target.remove()}
                    />
                  )}

                <Grid container spacing={1} sx={{ marginTop: 1 }}>
                  <Grid item>
                    <Button
                      startIcon={
                        post.likes.includes(userId) ? (
                          <FavoriteIcon color="error" /> // Filled red heart if liked
                        ) : (
                          <FavoriteBorderIcon /> // Outlined heart if not liked
                        )
                      }
                      onClick={() => handleLike(post._id)}
                    >
                      {post.likeCount}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      startIcon={<CommentIcon />}
                      onClick={() => handleCommentClick(post._id)}
                    >
                      {post.commentCount}
                    </Button>
                  </Grid>
                </Grid>
                <Typography
                  variant="body2"
                  sx={{ color: "gray", marginTop: 1 }}
                >
                  {moment(post.createdAt).fromNow()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography variant="h6" sx={{ marginTop: 4 }}>
          No posts available.
        </Typography>
      )}

      {/* Comments Popup */}
      <Dialog
        open={isCommentsPopupOpen}
        onClose={() => setIsCommentsPopupOpen(false)}
        fullWidth
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                userId={userId}
                postOwnerId={
                  posts.find((p) => p._id === selectedPostId)?.user?._id
                }
                onDelete={handleDeleteComment}
                onReply={handleReplyComment}
                selectedPostId={selectedPostId}
                setComments={setComments} // Pass setComments
                setPosts={setPosts} // Pass setPosts
              />
            ))
          ) : (
            <Typography variant="body1">No comments yet.</Typography>
          )}

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)} // Corrected here
            sx={{ marginTop: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCommentsPopupOpen(false)}>Close</Button>
          <Button onClick={handleCommentSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default Home;
