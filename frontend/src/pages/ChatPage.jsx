import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/conversations/${userId}`
        );
        setConversations(res.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [userId]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Chats
      </Typography>
      <List>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.user._id}
            button
            onClick={() => navigate(`/chat/${conversation.user._id}`)}
          >
            <ListItemText
              primary={conversation.user.name}
              secondary={conversation.lastMessage}
            />
            <Badge
              badgeContent={conversation.unreadCount || 0}
              color="error"
              sx={{ marginLeft: 2 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ChatPage;
