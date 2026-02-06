const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: Number,
  selectedAnswer: String,
  isCorrect: Boolean,
  timeTaken: Number
});

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu']
  },
  level: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  answers: [answerSchema]
});

module.exports = mongoose.model('Score', scoreSchema);