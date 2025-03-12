import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import axios from "axios";

const ChatWindow = ({ receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${userId}/${receiverId}`
        );
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages : ", error);
      }
    };
    fetchMessages();
  }, [userId, receiverId]);

  const handleSendMessage = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/messages/send", {
        senderId: userId,
        receiverId,
        content: newMessage,
      });
      setMessages([...messages, res.data.data]);
      setMessages("");
    } catch (error) {
      console.error("Error sending message : ", error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Chat with User
      </Typography>
      <List>
        {messages.map((message) => (
          <ListItem key={message._id}>
            <ListItemText
              primary={message.sender.name}
              secondary={message.content}
            />
          </ListItem>
        ))}
      </List>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <Button variant="contained" onClick={handleSendMessage}>
        Send
      </Button>
    </Box>
  );
};

export default ChatWindow;
