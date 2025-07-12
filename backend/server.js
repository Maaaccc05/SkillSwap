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
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
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
      
      if (!token) {
        socket.emit("auth_error", { message: "No token provided" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        // Remove any existing connection for this user
        const existingSocketId = userSockets.get(user._id.toString());
        if (existingSocketId && existingSocketId !== socket.id) {
          const existingSocket = io.sockets.sockets.get(existingSocketId);
          if (existingSocket) {
            existingSocket.disconnect();
          }
        }

        connectedUsers.set(socket.id, user._id.toString());
        userSockets.set(user._id.toString(), socket.id);
        
        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        
        socket.emit("authenticated", { userId: user._id, name: user.name });
        socket.broadcast.emit("user_online", { userId: user._id, name: user.name });
        
        console.log(`User ${user.name} (${user._id}) authenticated on socket ${socket.id}`);
      } else {
        socket.emit("auth_error", { message: "User not found" });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit("auth_error", { message: "Authentication failed: " + error.message });
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

      if (!chatId || !content) {
        socket.emit("error", { message: "Missing chatId or content" });
        return;
      }

      // Save message to database
      const Chat = require('./models/chat');
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        socket.emit("error", { message: "Chat not found" });
        return;
      }

      // Check if user is participant in this chat
      if (!chat.participants.includes(senderId)) {
        socket.emit("error", { message: "Not a participant in this chat" });
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

      // Populate sender info for broadcasting
      await chat.populate('messages.sender', 'name avatar');
      const savedMessage = chat.messages[chat.messages.length - 1];

      // Broadcast to all participants in the chat
      chat.participants.forEach(participantId => {
        const participantSocketId = userSockets.get(participantId.toString());
        if (participantSocketId && participantSocketId !== socket.id) {
          io.to(participantSocketId).emit("message_received", {
            ...savedMessage.toObject(),
            chatId: chatId
          });
        }
      });

      // Confirm message sent to sender
      socket.emit("message_sent", {
        ...savedMessage.toObject(),
        chatId: chatId
      });

      console.log(`Message sent in chat ${chatId} by user ${senderId}`);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit("error", { message: "Failed to send message: " + error.message });
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const { chatId } = data;
    const senderId = connectedUsers.get(socket.id);
    
    if (senderId && chatId) {
      const Chat = require('./models/chat');
      Chat.findById(chatId).then(chat => {
        if (chat && chat.participants.includes(senderId)) {
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
      }).catch(error => {
        console.error('Error handling typing start:', error);
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const { chatId } = data;
    const senderId = connectedUsers.get(socket.id);
    
    if (senderId && chatId) {
      const Chat = require('./models/chat');
      Chat.findById(chatId).then(chat => {
        if (chat && chat.participants.includes(senderId)) {
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
      }).catch(error => {
        console.error('Error handling typing stop:', error);
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
        console.log(`User ${user?.name} (${userId}) disconnected from socket ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));