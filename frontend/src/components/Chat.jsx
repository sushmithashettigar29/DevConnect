import { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

function Chat({ messages, onSendMessage, userId }) {
  const [inputMessage, setInputMessage] = useState("");
  const messageEndRef = useRef(null);

  // Auto-scroll to the bottom when messages are updated
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    console.log("Send button clicked"); // Debugging: Log when the button is clicked
    if (inputMessage.trim()) {
      console.log("Sending message:", inputMessage); // Debugging: Log the message being sent
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
      {/* Display messages */}
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

      {/* Input field and send button */}
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
