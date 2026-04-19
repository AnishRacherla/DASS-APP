const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu']
  },
  word: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: false
  },
  order: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
