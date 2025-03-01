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
  Box,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

function Home() {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newComment, setNewComment] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts/all");
        console.log("Fetched posts:", res.data);

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
        console.log("Fetching following list for user ID:", userId);

        const res = await axios.get(
          `http://localhost:5000/api/users/following/${userId}`
        );

        console.log("Following list response:", res.data);

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
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/posts/like", {
        userId,
        postId,
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.liked
                  ? [...post.likes, userId] // Add user to likes
                  : post.likes.filter((id) => id !== userId), // Remove user from likes
                likeCount: res.data.likeCount, // ✅ Update the like count from backend
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post", error);
    }
  };

  const handleFollow = async (followerUserId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/users/follow/${followerUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setFollowing((prev) => new Set([...Array.from(prev), followerUserId]));
    } catch (error) {
      console.error("Error following user", error);
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
        `http://localhost:5000/api/posts/comments/${postId}`
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

      setNewComment("");
    } catch (error) {
      console.log("Error submitting comment", error);
    }
  };
  return (
    <Grid container spacing={2} justifyContent="center">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Grid item xs={12} md={6} key={post._id}>
            <Card sx={{ marginBottom: 2 }}>
              <CardContent>
                {/* User Info and Follow Button */}
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Avatar
                          src={post.user?.profilePicture || ""}
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
                  {post.user._id !== userId && (
                    <Grid item>
                      {following.has(post.user._id) ? (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleUnfollow(post.user._id)}
                        >
                          Following
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleFollow(post.user._id)}
                        >
                          Follow
                        </Button>
                      )}
                    </Grid>
                  )}
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
                      src={post.image}
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
                      {post.likeCount} {/* ✅ Display correct like count */}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      startIcon={<CommentIcon />}
                      color="secondary"
                      onClick={() => handleCommentClick(post._id)}
                    >
                      Comment
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
              <div key={comment._id} style={{ marginTop: "10px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    mb: 1,
                  }}
                >
                  <Avatar
                    src={comment.user.profilePicture}
                    alt={comment.user.name}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {comment.user.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ marginLeft: 6, color: "gray" }}
                  >
                    {moment(comment.createdAt).fromNow()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ marginLeft: 6, mb: 2 }}>
                  {comment.text}
                </Typography>
              </div>
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
