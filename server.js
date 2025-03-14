const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers = new Map();

app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/search", require("./routes/search"));
app.use("/api/messages", require("./routes/messages"));
app.use(
  "/api/notifications",
  require("./routes/notifications")(io, onlineUsers)
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
  });

  socket.on("send-message", async ({ sender, receiver, content }) => {
    try {
      const message = new Message({ sender, receiver, content, isRead: false });
      await message.save();

      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", message);
      }

      io.to(socket.id).emit("message-sent", { success: true, message });
    } catch (error) {
      io.to(socket.id).emit("message-sent", {
        success: false,
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} went offline`);
      }
    }
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
