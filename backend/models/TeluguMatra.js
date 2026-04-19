const mongoose = require('mongoose');

// Telugu matra (gunintamu / vowel sign) stored in DB
const TeluguMatraSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true }, // e.g. 'aa', 'ee', 'oo'
  symbol:  { type: String, required: true },               // e.g. 'ా'
  name:    { type: String, required: true },               // e.g. 'aa gunintam'
  vowel:   { type: String },                               // standalone vowel: 'ఆ'
  stage:   { type: Number, default: 1 },
  levelIntroduced: { type: Number },
});

module.exports = mongoose.model('TeluguMatra', TeluguMatraSchema, 'telugu_matras');
