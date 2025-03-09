import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { markNotificationsAsRead } from "../services/notificationService";

const NotificationDropdown = ({ notifications, onMarkAsRead }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleMarkAsRead = async () => {
    await markNotificationsAsRead();
    onMarkAsRead();
    setUnreadCount(0);
  };

  return (
    <Box sx={{ width: 300, padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Notifications</Typography>
        <IconButton onClick={handleMarkAsRead}>
          <Typography variant="body2">Mark as Read</Typography>
        </IconButton>
      </Box>

      <List>
        {notifications.map((notification) => (
          <ListItem key={notification._id}>
            <ListItemText
              primary={notification.type}
              secondary={notification.sender.name}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationDropdown;
