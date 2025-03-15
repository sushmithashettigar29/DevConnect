import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

function Chat({ messages, onSendMessage, userId }) {
  const [inputMessage, setInputMessage] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((message) => (
          <Box
            key={message._id}
            sx={{
              textAlign: message.sender === userId ? "right" : "left",
              marginBottom: "8px",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                background: message.sender === userId ? "blue" : "gray",
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                display: "inline-block",
                maxWidth: "60%",
              }}
            >
              {message.content}
            </Typography>
          </Box>
        ))}
        <div ref={messageEndRef} />
      </Box>

      <Box
        sx={{
          padding: "10px",
          display: "flex",
          gap: "10px",
          borderTop: "1px solid #ddd",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
