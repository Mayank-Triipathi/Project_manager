require("dotenv").config({ path: __dirname + "/.env" });
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);


const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { connecttomdb } = require("./connections/connectomdb");

// --- Import Routes ---
const { router: userRoutes } = require("./routes/userRoutes.js");
const { router: projectRoutes } = require("./routes/projectRoutes.js");
const { router: taskRoutes } = require("./routes/taskRoutes.js");
const { router: inviteRoutes } = require("./routes/inviteRoutes.js");


const { Chat } = require("./models/chatSchema");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

connecttomdb(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invites", inviteRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Project Manager API is running...");
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  // When user joins (frontend emits this after login)
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // --- Project/Task Chat Messages ---
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, senderId, message } = data;

      // Save message in DB
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      if (!chat.messages) chat.messages = [];
      chat.messages.push({ sender: senderId, message, createdAt: new Date() });
      await chat.save();

      // Broadcast message to room
      io.to(chatId).emit("receiveMessage", { senderId, message, chatId });
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  // --- Join chat room ---
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // --- Invite notification ---
  socket.on("sendInvite", (data) => {
    const { invitedUserId, projectName } = data;
    const invitedSocketId = onlineUsers.get(invitedUserId);
    if (invitedSocketId) {
      io.to(invitedSocketId).emit("newInvite", {
        message: `You’ve been invited to join ${projectName}`
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

