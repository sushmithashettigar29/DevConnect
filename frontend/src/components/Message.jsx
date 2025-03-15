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

  useEffect(() => {
    if (receiverId) {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios
        .get(
          `http://localhost:5000/api/messages/${userId}/${receiverId}`,
          config
        )
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      setMessages([]);
    }
  }, [receiverId, userId]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      if (
        newMessage.sender === receiverId ||
        newMessage.receiver === receiverId
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [receiverId]);

  const sendMessage = async (content) => {
    if (!receiverId) return;
    const newMessage = { sender: userId, receiver: receiverId, content };
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(
        "http://localhost:5000/api/messages/send",
        newMessage,
        config
      );
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
