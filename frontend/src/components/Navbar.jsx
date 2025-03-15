import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { getNotifications } from "../services/notificationService";
import axios from "axios";

const Navbar = ({ setAuth, receiverId }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();

    const fetchUnreadMessageCount = async () => {
      if (!receiverId || !isValidObjectId(receiverId)) {
        console.error("Invalid receiverId:", receiverId);
        return;
      }

      try {
        const token = localStorage.getItem("token"); // Retrieve the token from localStorage
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        };

        const res = await axios.get(
          `http://localhost:5000/api/messages/unread/${receiverId}`,
          config // Pass the config with headers
        );

        if (res.data && typeof res.data.unreadMessages === "number") {
          setUnreadMessageCount(res.data.unreadMessages);
        } else {
          console.error("Invalid response structure:", res.data);
        }
      } catch (error) {
        console.error(
          "Error fetching unread message count:",
          error.response?.data || error.message
        );
      }
    };

    if (receiverId) {
      fetchUnreadMessageCount();
    }
  }, [receiverId, userId]);

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setAuth(false);
    navigate("/login");
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          DevConnect
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate("/resources")}>
            Resources
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate(`/profile/${userId}`)}
          >
            Profile
          </Button>
        </Box>

        <IconButton color="inherit" onClick={() => navigate("/chat")}>
          <Badge badgeContent={unreadMessageCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>

        <IconButton color="inherit" onClick={handleNotificationClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-end"
        >
          <ClickAwayListener onClickAway={handleCloseDropdown}>
            <Paper sx={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
              />
            </Paper>
          </ClickAwayListener>
        </Popper>

        <Button color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;