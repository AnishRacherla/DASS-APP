const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  audioText: {
    type: String,
    required: true
  },
  audioFileName: {
    type: String,
    required: true
  },
  audioData: {
    type: Buffer,
    required: false
  },
  audioContentType: {
    type: String,
    default: 'audio/mpeg'
  },
  correctAnswer: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  }
});

const quizSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu']
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  planetName: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);