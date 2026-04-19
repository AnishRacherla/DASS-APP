const mongoose = require('mongoose');

const crosswordProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      default: 'crossword',
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['hi', 'te'],
      default: 'hi',
    },
    level: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    score: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedWords: {
      type: [String],
      default: [],
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastPlayed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to separate progress by user, game, language, and level
crosswordProgressSchema.index({ userId: 1, gameId: 1, language: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('CrosswordProgress', crosswordProgressSchema);