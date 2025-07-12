// server.js
require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const http = require('http');
const loginRoutes = require('./routes/login');
const signupRoutes = require('./routes/signup');
const chatRoutes = require('./routes/chat');
const skillsRoutes = require('./routes/skills');
const usersRoutes = require('./routes/users');
const connectDB = require('./config/db');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Log environment variables for debugging
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
});

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/login', loginRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/users', usersRoutes);

// Socket.io connection handling
const connectedUsers = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user authentication
  socket.on("authenticate", async (token) => {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('./models/user');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        connectedUsers.set(socket.id, user._id.toString());
        userSockets.set(user._id.toString(), socket.id);
        
        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        
        socket.emit("authenticated", { userId: user._id, name: user.name });
        socket.broadcast.emit("user_online", { userId: user._id, name: user.name });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit("auth_error", { message: "Authentication failed" });
    }
  });

  // Handle real-time messaging
  socket.on("send_message", async (data) => {
    try {
      const { chatId, content, messageType } = data;
      const senderId = connectedUsers.get(socket.id);
      
      if (!senderId) {
        socket.emit("error", { message: "Not authenticated" });
        return;
      }

      // Save message to database
      const Chat = require('./models/chat');
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      const message = {
        sender: senderId,
        content,
        messageType: messageType || 'text',
        timestamp: new Date()
      };

      chat.messages.push(message);
      chat.lastMessage = new Date();
      await chat.save();

      // Broadcast to all participants in the chat
      chat.participants.forEach(participantId => {
        const participantSocketId = userSockets.get(participantId.toString());
        if (participantSocketId && participantSocketId !== socket.id) {
          io.to(participantSocketId).emit("message_received", {
            ...message,
            chatId: chatId
          });
        }
      });

      // Confirm message sent to sender
      socket.emit("message_sent", {
        ...message,
        chatId: chatId
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const { chatId } = data;
    const senderId = connectedUsers.get(socket.id);
    
    if (senderId) {
      const Chat = require('./models/chat');
      Chat.findById(chatId).then(chat => {
        if (chat) {
          chat.participants.forEach(participantId => {
            const participantSocketId = userSockets.get(participantId.toString());
            if (participantSocketId && participantSocketId !== socket.id) {
              io.to(participantSocketId).emit("user_typing", { 
                userId: senderId,
                chatId: chatId 
              });
            }
          });
        }
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const { chatId } = data;
    const senderId = connectedUsers.get(socket.id);
    
    if (senderId) {
      const Chat = require('./models/chat');
      Chat.findById(chatId).then(chat => {
        if (chat) {
          chat.participants.forEach(participantId => {
            const participantSocketId = userSockets.get(participantId.toString());
            if (participantSocketId && participantSocketId !== socket.id) {
              io.to(participantSocketId).emit("user_stopped_typing", { 
                userId: senderId,
                chatId: chatId 
              });
            }
          });
        }
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      try {
        const User = require('./models/user');
        const user = await User.findById(userId);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
          await user.save();
        }
        
        connectedUsers.delete(socket.id);
        userSockets.delete(userId);
        
        socket.broadcast.emit("user_offline", { userId, name: user?.name });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));