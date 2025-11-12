require("dotenv").config({ path: __dirname + "/.env" });
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);


const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { connecttomdb } = require("./connections/connectomdb");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const onlineUsers = new Map();
module.exports = { io, onlineUsers };

// --- Import Routes ---
const { router: userRoutes } = require("./routes/userRoutes.js");
const { router: projectRoutes } = require("./routes/projectRoutes.js");
const { router: taskRoutes } = require("./routes/taskRoutes.js");
const { router: inviteRoutes } = require("./routes/inviteRoutes.js");
const {router: chatRoutes} = require("./routes/chatRoutes.js");

const allowedOrigins = [
  // "http://localhost:5173",
  "https://projectmanager-frontend-h33lzflzh-minkut2005-3282s-projects.vercel.app",
  "https://projectmanager-frontend-kappa.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Project Manager API is running...");
});


io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);


  // --- Join chat room ---
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
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



const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

