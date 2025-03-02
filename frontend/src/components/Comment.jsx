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
import PropTypes from "prop-types";

const Comment = ({ comment, userId, postOwnerId, onDelete, onReply }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Check if the current user can delete the comment
  const canDelete = userId === comment.user._id || userId === postOwnerId;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    await onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
        <Avatar
          src={comment.user.profilePicture}
          alt={comment.user.name}
          sx={{ width: 36, height: 36 }}
        />
        <Typography variant="body1" fontWeight="bold">
          {comment.user.name}
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: 6, color: "gray" }}>
          {moment(comment.createdAt).fromNow()}
        </Typography>

        {/* Three-dot menu for Delete & Reply */}
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

      {/* Reply Input */}
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
Comment.propTypes = {
    comment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
      }).isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
    userId: PropTypes.string.isRequired,
    postOwnerId: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onReply: PropTypes.func.isRequired,
  };
  
export default Comment;
