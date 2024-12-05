const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true, // Allow cookies or credentials to be sent with requests
  },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Allow cross-origin requests from frontend
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Chat server is running");
});

// Socket.io setup
let users = [];

io.on("connection", (socket) => {
  console.log("New client connected");

  // Handle new user joining the chat
  socket.on("join", (username) => {
    users.push({ id: socket.id, username });
    io.emit("userJoined", users);
  });

  // Handle sending messages
  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    users = users.filter((user) => user.id !== socket.id);
    io.emit("userLeft", users);
  });
});

// Server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
