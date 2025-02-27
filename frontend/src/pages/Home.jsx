import { useEffect, useState } from "react";
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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";

function Home() {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [comments, setComments] = useState([]);
  const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);

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
    fetchPosts();
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
                  ? [...post.likes, userId]
                  : post.likes.filter((id) => id !== userId),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post", error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/user/follow/${userId}`);
      setFollowing((prev) => new Set([...prev, userId]));
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/user/unfollow/${userId}`);
      setFollowing((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
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
      setIsCommentsPopupOpen(true);
    } catch (error) {
      console.error("Error fetching comments", error);
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
                  {post.user._id !== userId && ( // Hide follow button for current user's posts
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
                      startIcon={<FavoriteIcon />}
                      color="primary"
                      onClick={() => handleLike(post._id)}
                    >
                      {post.likes.includes(userId) ? "Unlike" : "Like"}
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
      >
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} style={{ marginTop: "10px" }}>
                <Avatar
                  src={comment.user.profilePicture}
                  alt={comment.user.name}
                />
                <Typography variant="body1">{comment.user.name}</Typography>
                <Typography variant="body2">{comment.text}</Typography>
              </div>
            ))
          ) : (
            <Typography variant="body1">No comments yet.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCommentsPopupOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default Home;
