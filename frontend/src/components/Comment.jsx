import { useState } from "react";
import {
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  TextField,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import axios from "axios";

const Comment = ({
  comment,
  userId,
  postOwnerId,
  onDelete,
  onReply,
  selectedPostId,
  setComments,
  setPosts,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [replyAnchorEl, setReplyAnchorEl] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedReplyId, setSelectedReplyId] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleReplyMenuOpen = (event, replyId) => {
    setReplyAnchorEl(event.currentTarget);
    setSelectedReplyId(replyId);
  };
  const handleReplyMenuClose = () => {
    setReplyAnchorEl(null);
    setSelectedReplyId(null);
  };

  const canDelete = userId === comment.user._id || userId === postOwnerId;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    await onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/posts/comment/${selectedPostId}/${comment._id}/reply/${replyId}`,
        { data: { userId } }
      );

      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === comment._id
            ? {
                ...c,
                replies: c.replies.filter((reply) => reply._id !== replyId),
              }
            : c
        )
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedPostId
            ? { ...post, commentCount: post.commentCount - 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting reply", error);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
        <Avatar
          src={
            comment.user.profilePicture
              ? `http://localhost:5000${comment.user.profilePicture}`
              : ""
          }
          alt={comment.user.name}
          sx={{ width: 36, height: 36 }}
        />
        <Typography variant="body1" fontWeight="bold">
          {comment.user.name}
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: 6, color: "gray" }}>
          {moment(comment.createdAt).fromNow()}
        </Typography>

        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {canDelete && (
            <MenuItem
              onClick={() => {
                onDelete(comment._id);
                handleMenuClose();
              }}
            >
              Delete
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setShowReplyInput(!showReplyInput);
              handleMenuClose();
            }}
          >
            Reply
          </MenuItem>
        </Menu>
      </Box>

      <Typography variant="body2" sx={{ marginLeft: 6, mb: 2 }}>
        {comment.text}
      </Typography>

      {comment.replies &&
        comment.replies.map((reply) => (
          <Box key={reply._id} sx={{ marginLeft: 6, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={
                  reply.user.profilePicture
                    ? `http://localhost:5000${reply.user.profilePicture}`
                    : ""
                }
                alt={reply.user.name}
                sx={{ width: 24, height: 24 }}
              />

              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                {reply.user.name}: {reply.text}
              </Typography>

              <IconButton
                size="small"
                onClick={(e) => handleReplyMenuOpen(e, reply._id)}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={replyAnchorEl}
                open={Boolean(replyAnchorEl)}
                onClose={handleReplyMenuClose}
              >
                {userId === reply.user._id && (
                  <MenuItem
                    onClick={() => {
                      handleDeleteReply(reply._id);
                      handleReplyMenuClose();
                    }}
                  >
                    Delete
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setShowReplyInput(true);
                    handleReplyMenuClose();
                  }}
                >
                  Reply
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ))}

      {showReplyInput && (
        <Box sx={{ marginLeft: 6, mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mt: 1 }}
            onClick={handleReplySubmit}
          >
            Reply
          </Button>
        </Box>
      )}
    </div>
  );
};

export default Comment;
