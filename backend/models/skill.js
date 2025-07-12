const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const skillOfferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    description: String
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  availability: [{
    type: String,
    enum: ['weekdays', 'weekends', 'mornings', 'evenings', 'flexible']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  requests: [requestSchema]
}, {
  timestamps: true
});

// Index for efficient querying
skillOfferSchema.index({ user: 1 });
skillOfferSchema.index({ 'skill.category': 1 });
skillOfferSchema.index({ 'skill.level': 1 });
skillOfferSchema.index({ isActive: 1 });

module.exports = mongoose.model('SkillOffer', skillOfferSchema); 