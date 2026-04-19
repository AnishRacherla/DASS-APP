const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    orientation: { type: String, enum: ['across', 'down'], required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    maxLen: { type: Number, required: true },
    wordId: { type: String, required: true },
  },
  { _id: false }
);

const levelSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false }
);

const wordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    clue: { type: String, required: true },
    hi: { type: String, required: true },
    te: { type: String, required: true },
  },
  { _id: false }
);

const crosswordContentSchema = new mongoose.Schema(
  {
    gameKey: { type: String, required: true, unique: true },
    totalLevels: { type: Number, required: true, default: 5 },
    levels: [levelSchema],
    wordBank: [wordSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crossword', crosswordContentSchema);
