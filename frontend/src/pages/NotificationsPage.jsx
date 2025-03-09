import { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../services/notificationService";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data);
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async () => {
    await markNotificationsAsRead();
    const data = await getNotifications();
    setNotifications(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((notifications) => (
          <ListItem key={notifications._id}>
            <ListItemText
              primary={notifications.type}
              secondary={notifications.sender.name}
            />
          </ListItem>
        ))}
      </List>
      <button onClick={handleMarkAsRead}>Mark All as Read</button>
    </Box>
  );
};

export default NotificationsPage;
