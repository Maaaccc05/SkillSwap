const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users - MUST come before /:userId route
router.get('/search', async (req, res) => {
  try {
    const { q, skill, location, availability } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (skill) {
      query.$or = [
        { 'skillsOffered.name': { $regex: skill, $options: 'i' } },
        { 'skillsWanted.name': { $regex: skill, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (availability) {
      query.availability = availability;
    }

    const users = await User.find(query)
      .select('name avatar location bio skillsOffered skillsWanted availability rating totalReviews isOnline lastSeen')
      .sort({ rating: -1, totalReviews: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online users
router.get('/online', async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true })
      .select('name avatar location isOnline lastSeen')
      .sort({ lastSeen: -1 });

    res.json(onlineUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID (public) - MUST come after /search route
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar location bio skillsOffered skillsWanted availability rating totalReviews isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      name,
      location,
      bio,
      skillsOffered,
      skillsWanted,
      availability,
      preferences
    } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsWanted) user.skillsWanted = skillsWanted;
    if (availability) user.availability = availability;
    if (preferences) user.preferences = preferences;

    await user.save();
    const userResponse = await User.findById(user._id).select('-password');
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user online status
router.put('/online-status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await User.findById(req.user.id);

    user.isOnline = isOnline;
    user.lastSeen = new Date();
    await user.save();

    res.json({ isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate a user
router.post('/:userId/rate', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userToRate = await User.findById(req.params.userId);

    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToRate._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    // Calculate new average rating
    const newTotalReviews = userToRate.totalReviews + 1;
    const newRating = ((userToRate.rating * userToRate.totalReviews) + rating) / newTotalReviews;

    userToRate.rating = newRating;
    userToRate.totalReviews = newTotalReviews;
    await userToRate.save();

    res.json({ rating: userToRate.rating, totalReviews: userToRate.totalReviews });
  } catch (error) {
    console.error('Error rating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 