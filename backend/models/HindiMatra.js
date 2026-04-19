const mongoose = require('mongoose');

// Hindi matra (vowel sign) stored in DB
const HindiMatraSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true }, // e.g. 'aa', 'i', 'ii'
  symbol:  { type: String, required: true },               // e.g. 'ा'
  name:    { type: String, required: true },               // e.g. 'aa matra'
  vowel:   { type: String },                               // standalone vowel: 'आ'
  stage:   { type: Number, default: 1 },
  levelIntroduced: { type: Number },
});

module.exports = mongoose.model('HindiMatra', HindiMatraSchema, 'hindi_matras');
