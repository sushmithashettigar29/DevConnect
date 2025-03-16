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
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { getNotifications } from "../services/notificationService";
import axios from "axios";
import MenuIcon from "@mui/icons-material/Menu";
const Navbar = ({ setAuth, receiverId }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
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
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const res = await axios.get(
          `http://localhost:5000/api/messages/unread/${receiverId}`,
          config
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

    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}`
        );
        if (response.data && response.data.profilePicture) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
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
    setNotificationAnchorEl(notificationAnchorEl ? null : event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setNotificationAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#F0BB78" }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ display: { xs: "block", md: "none" } }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h4"
          sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer", ml:2 }}
          onClick={() => navigate("/")}
        >
          DevConnect
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          <Button color="inherit" onClick={() => navigate("/")}>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
            >
              Home
            </Typography>
          </Button>
          <Button color="inherit" onClick={() => navigate("/resources")}>
          <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
            >
              Resources
            </Typography>
          </Button>
        </Box>

        <IconButton
          color="inherit"
          sx={{ ml: 3, mr: 3 }}
          onClick={() => navigate("/chat")}
        >
          <Badge badgeContent={unreadMessageCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>

        <IconButton
          color="inherit"
          sx={{ mr: 3 }}
          onClick={handleNotificationClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Popper
          open={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
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
        <div>
          <IconButton
            onClick={(e) => setProfileAnchorEl(e.currentTarget)}
            color="inherit"
          >
            <Avatar
              src={
                userProfile?.profilePicture
                  ? `http://localhost:5000${userProfile.profilePicture}`
                  : ""
              }
              alt={userProfile?.name}
            />
          </IconButton>
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={() => setProfileAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => navigate(`/profile/${userId}`)}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List sx={{ width: 250 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/")}>
              {" "}
              <ListItemText primary="Home" />{" "}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/resources")}>
              {" "}
              <ListItemText primary="Resources" />{" "}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/chat")}>
              {" "}
              <ListItemText primary="Chat" />{" "}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate(`/profile/${userId}`)}>
              {" "}
              <ListItemText primary="Profile" />{" "}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              {" "}
              <ListItemText primary="Logout" />{" "}
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
