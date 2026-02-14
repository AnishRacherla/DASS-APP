const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu']
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  totalScore: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', progressSchema);