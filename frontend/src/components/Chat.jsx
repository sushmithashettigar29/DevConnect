import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

function Chat({ messages, onSendMessage, userId }) {
  const [inputMessage, setInputMessage] = useState("");
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      console.log("Sending message:", inputMessage); // Debugging
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          borderBottom: "1px solid #ccc",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              marginBottom: "10px",
              textAlign: message.sender === userId ? "right" : "left",
            }}
          >
            <Box
              sx={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "10px",
                backgroundColor:
                  message.sender === userId ? "primary.main" : "grey.300",
                color: message.sender === userId ? "white" : "black",
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={messageEndRef} />
      </Box>

      <Box sx={{ padding: "10px", display: "flex", gap: "10px" }}>
        <TextField
          fullWidth
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
