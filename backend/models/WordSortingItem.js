const mongoose = require('mongoose');

const WordSortingItemSchema = new mongoose.Schema({
  language: { type: String, required: true, enum: ['hindi', 'telugu'] },
  word: { type: String, required: true },
  category: { type: String, required: true },
  meaning: { type: String, required: true },
  emoji: { type: String },
  order: { type: Number, default: 0 },
  levelIntroduced: { type: Number, default: 1 },
}, { timestamps: true });

WordSortingItemSchema.index({ language: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('WordSortingItem', WordSortingItemSchema, 'word_sorting_items');