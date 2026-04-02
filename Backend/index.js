// index.js
require("dotenv").config(); // load .env first

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Routers
const chatRouter = require("./routes/chat");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const eventRouter = require("./routes/events");
const notificationsRouter = require("./routes/notifications");
const googleAuthRouter = require("./routes/auth/google");
const paymentRoutes = require("./routes/payment");

// Models
const Message = require("./models/Message"); // Ensure this file exists

// Initialize Express & HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/auth/google", googleAuthRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/chat", chatRouter);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Event Management API with Real-time Chat is running!" });
});

// Socket.IO Real-time Logic
io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // Join a specific event room
  socket.on("join_event", (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`👥 User joined room: event_${eventId}`);
  });

  // Leave a specific event room
  socket.on("leave_event", (eventId) => {
    socket.leave(`event_${eventId}`);
    console.log(`👋 User left room: event_${eventId}`);
  });

  // Handle sending and saving messages
  socket.on("send_message", async (data) => {
    try {
      console.log("📩 Incoming message:", data); // DEBUG

      const { eventId, senderId, text, senderName } = data;

      if (!senderId || !senderName) {
        console.log("❌ senderId or senderName missing");
        return;
      }

      const newMessage = new Message({
        eventId,
        senderId,
        senderName,
        text,
      });

      const savedMessage = await newMessage.save();

      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(`event_${eventId}`).emit("receive_message", savedMessage);

      console.log(
        `💬 Message saved & sent to room event_${eventId} (excluding sender): ${text}`,
      );
    } catch (error) {
      console.error("❌ Error handling send_message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔥 User Disconnected");
  });
});

// Connect to MongoDB & start server
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    server.listen(3000, () => {
      console.log("✅ Server & Socket.IO running on port 3000");
    });
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
}

main();

// Scheduler (if any scheduled jobs)
require("./routes/scheduler");
