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
  gameType: {
    type: String,
    default: 'quiz'
  },
  gameId: {
    type: String,
    required: false
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: false
  },
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu', 'english']
  },
  level: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  stars: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 5
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  answers: [answerSchema]
});

module.exports = mongoose.model('Score', scoreSchema);