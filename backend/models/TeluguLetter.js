const mongoose = require('mongoose');

// Telugu consonant (hallulu) stored in DB
const TeluguLetterSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true }, // e.g. 'ka', 'cha'
  symbol:  { type: String, required: true },               // e.g. 'క'
  name:    { type: String, required: true },               // e.g. 'ka'
  audioUrl: { type: String },                              // optional path to recorded letter audio
  audioFileName: { type: String },                         // optional filename under static audio folder
  audioData: { type: Buffer },                             // optional in-db binary audio
  audioContentType: { type: String, default: 'audio/mpeg' },
  type:    { type: String, default: 'consonant' },
  stage:   { type: Number, default: 1 },
  levelIntroduced: { type: Number },
});

module.exports = mongoose.model('TeluguLetter', TeluguLetterSchema, 'telugu_letters');
