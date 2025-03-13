import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import ConversationList from "./ConversationList";
import Chat from "./Chat";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";

const socket = io("http://localhost:5000");

function Message() {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [receiverId, setReceiverId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  // Fetch conversations for the logged-in user
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/conversations/${userId}`
        );
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Fetch messages between two users
  useEffect(() => {
    if (receiverId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/messages/${userId}/${receiverId}`
          );
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    } else {
      // Reset messages when no receiver is selected
      setMessages([]);
    }
  }, [userId, receiverId]);

  // Listen for real-time messages
  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (
        newMessage.sender === receiverId ||
        newMessage.receiver === receiverId
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [receiverId]);

  // Fetch following users
  useEffect(() => {
    const fetchFollowingUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/following/${userId}`
        );
        setFollowingUsers(response.data);
      } catch (error) {
        console.error("Error fetching following users:", error);
      }
    };

    if (userId) {
      fetchFollowingUsers();
    }
  }, [userId]);

  // Handle sending a message
  const sendMessage = async (content) => {
    if (!content.trim()) return;
  
    try {
      const newMessage = {
        sender: userId,
        receiver: receiverId,
        content,
      };
  
      console.log("Sending message:", newMessage); // Debugging
  
      // Emit the message to the server
      socket.emit("send-message", newMessage);
  
      // Add the message to the local state
      setMessages((prevMessages) => [...prevMessages, newMessage]);
  
      // Send the message to the backend API
      const response = await axios.post("http://localhost:5000/api/messages/send", newMessage);
      console.log("Backend response:", response.data); // Debugging
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{ width: "30%", borderRight: "1px solid #ccc", overflow: "auto" }}
      >
        <ConversationList
          conversations={conversations}
          onSelectConversation={(receiverId) => setReceiverId(receiverId)}
        />

        <Typography
          variant="h6"
          sx={{ padding: "10px", borderBottom: "1px solid #ccc" }}
        >
          Following
        </Typography>
        <List>
          {followingUsers.map((user) => (
            <ListItem
              button
              key={user._id}
              onClick={() => setReceiverId(user._id)}
              sx={{
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <ListItemAvatar>
              <Avatar
            src={
              user?.profilePicture
                ? `http://localhost:5000${user.profilePicture}`
                : ""
            }
            alt={user?.name}
            sx={{ width: 50, height: 50 }}
          />
              </ListItemAvatar>
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ width: "70%" }}>
        {receiverId ? (
          <Chat messages={messages} onSendMessage={sendMessage} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="textSecondary">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Message;
