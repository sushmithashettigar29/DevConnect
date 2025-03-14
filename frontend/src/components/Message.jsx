import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import ConversationList from "../components/ConversationList";
import Chat from "../components/Chat";
import { Box, Typography } from "@mui/material";

const socket = io("http://localhost:5000");

function Message() {
  const userId = localStorage.getItem("userId");
  const [receiverId, setReceiverId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch messages when receiverId changes
  useEffect(() => {
    if (receiverId) {
      axios
        .get(`http://localhost:5000/api/messages/${userId}/${receiverId}`)
        .then((res) => {
          console.log("Fetched messages:", res.data); // Debugging: Log fetched messages
          setMessages(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      setMessages([]);
    }
  }, [receiverId, userId]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      console.log("Received message via socket:", newMessage); // Debugging: Log received message
      // Only add the message if it belongs to the current conversation
      if (
        newMessage.sender === receiverId ||
        newMessage.receiver === receiverId
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    // Clean up the socket listener
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [receiverId]); // Add receiverId as a dependency

  // Send a message
  const sendMessage = async (content) => {
    if (!receiverId) return;

    const newMessage = { sender: userId, receiver: receiverId, content };

    try {
      console.log("Sending message:", newMessage); // Debugging: Log sent message
      // Send the message to the backend
      await axios.post("http://localhost:5000/api/messages/send", newMessage);

      // Emit the message via socket
      socket.emit("send-message", newMessage);

      // Add the message to the local state
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <ConversationList onSelectConversation={setReceiverId} />
      {receiverId ? (
        <Chat messages={messages} onSendMessage={sendMessage} userId={userId} />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>Select a chat to start messaging</Typography>
        </Box>
      )}
    </Box>
  );
}

export default Message;
