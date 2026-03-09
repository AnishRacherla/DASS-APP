const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  language: { type: String, required: true },
  score: { type: Number, required: true },
  stars: { type: Number, default: 0 },
  levelsCompleted: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
}, { timestamps: true });

leaderboardSchema.index({ score: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
