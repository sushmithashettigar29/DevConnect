import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../services/notificationService";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await markNotificationsAsRead();
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification._id}>
            <ListItemText
              primary={notification.type}
              secondary={notification.sender?.name || "Unknown User"}
            />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={handleMarkAsRead}>
        Mark All as Read
      </Button>
    </Box>
  );
};

export default NotificationsPage;
