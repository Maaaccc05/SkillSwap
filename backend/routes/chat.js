const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('messages.sender', 'name avatar')
    .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific chat with messages
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Sort messages by timestamp to ensure proper order
    chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to chat
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content, messageType = 'text' } = req.body;
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      sender: req.user.id,
      content,
      messageType,
      timestamp: new Date()
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate the sender info for the response
    await chat.populate('messages.sender', 'name avatar');
    const savedMessage = chat.messages[chat.messages.length - 1];

    res.json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get existing chat between two users
router.post('/start', auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, otherUserId] },
      isActive: true
    });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user.id, otherUserId],
        messages: []
      });
      await chat.save();
    }

    await chat.populate('participants', 'name avatar isOnline lastSeen');
    await chat.populate('messages.sender', 'name avatar');

    res.json(chat);
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark all messages from other user as read
    chat.messages.forEach(message => {
      if (message.receiver.toString() === req.user.id && !message.read) {
        message.read = true;
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    let totalUnread = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (message.receiver.toString() === req.user.id && !message.read) {
          totalUnread++;
        }
      });
    });

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 