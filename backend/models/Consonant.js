const mongoose = require('mongoose');

const consonantSchema = new mongoose.Schema({
  letter: { type: String, required: true },
  language: { type: String, enum: ['hindi', 'telugu'], required: true },
  audioBase64: { type: String, required: true },
});

module.exports = mongoose.model('Consonant', consonantSchema);
