const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const levelEntrySchema = new mongoose.Schema({
  levelId: Number,
  stars: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  bestAccuracy: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const playerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  playerName: { type: String, required: true, trim: true },
  language: { type: String, enum: ['hindi', 'telugu'], default: 'hindi' },
  totalScore: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  highestLevel: { type: Number, default: 1 },
  // Per-language level tracking
  langProgress: {
    hindi:  { type: [levelEntrySchema], default: [] },
    telugu: { type: [levelEntrySchema], default: [] },
  },
  // Legacy flat (kept for backward compat, not actively used)
  levelsCompleted: [{
    levelId: Number,
    stars: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  }],
  achievements: [{
    id: String,
    name: String,
    unlockedAt: { type: Date, default: Date.now },
  }],
  stats: {
    totalRoundsPlayed: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 },
  },
  settings: {
    soundEnabled: { type: Boolean, default: true },
    musicEnabled: { type: Boolean, default: true },
    difficulty: { type: String, enum: ['easy', 'normal', 'hard'], default: 'normal' },
  },
}, { timestamps: true });

// Hash password before saving
playerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

playerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Player', playerSchema);

