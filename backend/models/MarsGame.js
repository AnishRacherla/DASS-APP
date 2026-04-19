const mongoose = require('mongoose');

const marsGameSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu']
  },
  level: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [{
    word: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: false
    },
    images: [{
      type: String,
      required: true
    }],
    correctImageIndex: {
      type: Number,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MarsGame', marsGameSchema);
