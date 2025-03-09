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
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { getNotifications } from "../services/notificationService";

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

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
  }, []);

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
