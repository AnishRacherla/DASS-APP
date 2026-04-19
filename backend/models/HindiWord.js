const mongoose = require('mongoose');

// Hindi vocabulary word used in game levels 5-8
const HindiWordSchema = new mongoose.Schema({
  combined:  { type: String, required: true, unique: true }, // full word: 'आम'
  parts:     [String],                                        // syllable parts: ['आम']
  meaning:   { type: String, required: true },               // English: 'mango'
  emoji:     { type: String },                               // '🥭'
  category:  { type: String },                               // 'nature','animals','family','food','body','objects'
  keyIdx:    { type: Number, default: 0 },                   // which part is the key syllable
  keyMatra:  { type: String },                               // matra id of the key syllable
  keyCons:   { type: String },                               // consonant id of the key syllable
  levelIntroduced: { type: Number, default: 6 },
});

module.exports = mongoose.model('HindiWord', HindiWordSchema, 'hindi_words');
