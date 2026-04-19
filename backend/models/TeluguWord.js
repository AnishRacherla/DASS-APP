const mongoose = require('mongoose');

// Telugu vocabulary word used in game levels 5-8
const TeluguWordSchema = new mongoose.Schema({
  combined:  { type: String, required: true, unique: true }, // full word: 'పూల'
  parts:     [String],
  meaning:   { type: String, required: true },
  emoji:     { type: String },
  category:  { type: String },
  keyIdx:    { type: Number, default: 0 },
  keyMatra:  { type: String },
  keyCons:   { type: String },
  levelIntroduced: { type: Number, default: 6 },
});

module.exports = mongoose.model('TeluguWord', TeluguWordSchema, 'telugu_words');
