const express = require('express');
const router = express.Router();
const SkillOffer = require('../models/skill');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get all skill offers
router.get('/', async (req, res) => {
  try {
    const { category, level, availability } = req.query;
    let query = { isActive: true };

    if (category) query['skill.category'] = category;
    if (level) query['skill.level'] = level;
    if (availability) query.availability = availability;

    const skillOffers = await SkillOffer.find(query)
      .populate('user', 'name avatar location rating totalReviews')
      .sort({ createdAt: -1 });

    res.json(skillOffers);
  } catch (error) {
    console.error('Error fetching skill offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received requests for current user
router.get('/requests/received', auth, async (req, res) => {
  try {
    const skillOffers = await SkillOffer.find({ user: req.user.id })
      .populate('requests.requester', 'name avatar location rating totalReviews')
      .sort({ createdAt: -1 });

    res.json(skillOffers);
  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request a skill
router.post('/:skillOfferId/request', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const skillOffer = await SkillOffer.findById(req.params.skillOfferId);

    if (!skillOffer) {
      return res.status(404).json({ message: 'Skill offer not found' });
    }

    if (skillOffer.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot request your own skill' });
    }

    const request = {
      requester: req.user.id,
      message: message || '',
      status: 'pending',
      createdAt: new Date()
    };

    skillOffer.requests.push(request);
    await skillOffer.save();

    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error sending skill request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (accept/decline)
router.put('/:skillOfferId/request/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const skillOffer = await SkillOffer.findById(req.params.skillOfferId);

    if (!skillOffer) {
      return res.status(404).json({ message: 'Skill offer not found' });
    }

    if (skillOffer.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = skillOffer.requests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await skillOffer.save();

    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 