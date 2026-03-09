const mongoose = require('mongoose');

// Telugu consonant (hallulu) stored in DB
const TeluguLetterSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true }, // e.g. 'ka', 'cha'
  symbol:  { type: String, required: true },               // e.g. 'క'
  name:    { type: String, required: true },               // e.g. 'ka'
  type:    { type: String, default: 'consonant' },
  stage:   { type: Number, default: 1 },
  levelIntroduced: { type: Number },
});

module.exports = mongoose.model('TeluguLetter', TeluguLetterSchema, 'telugu_letters');
