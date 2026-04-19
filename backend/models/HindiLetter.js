const mongoose = require('mongoose');

// Hindi consonant (vyanjan) stored in DB
const HindiLetterSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true }, // e.g. 'ka', 'kha'
  symbol:  { type: String, required: true },               // e.g. 'क'
  name:    { type: String, required: true },               // e.g. 'ka'
  audioUrl: { type: String },                              // optional path to recorded letter audio
  audioFileName: { type: String },                         // optional filename under static audio folder
  audioData: { type: Buffer },                             // optional in-db binary audio
  audioContentType: { type: String, default: 'audio/mpeg' },
  type:    { type: String, default: 'consonant' },
  stage:   { type: Number, default: 1 },                   // 1=stage1, 2=stage2, 3=all
  levelIntroduced: { type: Number },                       // which game level first uses it
});

module.exports = mongoose.model('HindiLetter', HindiLetterSchema, 'hindi_letters');
