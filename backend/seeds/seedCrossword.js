const Crossword = require('../models/Crossword');
const mongoose = require('mongoose');
require('dotenv').config();

const CROSSWORD_DATA = {
  gameKey: 'kidsCrossword',
  totalLevels: 5,
  levels: [
    {
      level: 1,
      slots: [
        { id: 'L1_H1', orientation: 'across', row: 2, col: 0, maxLen: 2, wordId: 'fruit' },
        { id: 'L1_H2', orientation: 'across', row: 3, col: 0, maxLen: 2, wordId: 'home' },
        { id: 'L1_V1', orientation: 'down', row: 0, col: 2, maxLen: 4, wordId: 'water' },
        { id: 'L1_V2', orientation: 'down', row: 0, col: 3, maxLen: 4, wordId: 'cat' },
      ],
    },
    {
      level: 2,
      slots: [
        { id: 'L2_H1', orientation: 'across', row: 0, col: 0, maxLen: 2, wordId: 'tea' },
        { id: 'L2_H2', orientation: 'across', row: 1, col: 0, maxLen: 2, wordId: 'milk' },
        { id: 'L2_V1', orientation: 'down', row: 0, col: 2, maxLen: 4, wordId: 'lotus' },
        { id: 'L2_V2', orientation: 'down', row: 0, col: 3, maxLen: 4, wordId: 'roti' },
      ],
    },
    {
      level: 3,
      slots: [
        { id: 'L3_V1', orientation: 'down', row: 0, col: 0, maxLen: 4, wordId: 'boat' },
        { id: 'L3_V2', orientation: 'down', row: 0, col: 1, maxLen: 4, wordId: 'hand' },
        { id: 'L3_H1', orientation: 'across', row: 2, col: 2, maxLen: 2, wordId: 'leg' },
        { id: 'L3_H2', orientation: 'across', row: 3, col: 2, maxLen: 2, wordId: 'nose' },
      ],
    },
    {
      level: 4,
      slots: [
        { id: 'L4_H1', orientation: 'across', row: 0, col: 2, maxLen: 2, wordId: 'ear' },
        { id: 'L4_H2', orientation: 'across', row: 1, col: 2, maxLen: 2, wordId: 'eye' },
        { id: 'L4_V1', orientation: 'down', row: 0, col: 0, maxLen: 4, wordId: 'fire' },
        { id: 'L4_V2', orientation: 'down', row: 0, col: 1, maxLen: 4, wordId: 'cloud' },
      ],
    },
    {
      level: 5,
      slots: [
        { id: 'L5_V1', orientation: 'down', row: 0, col: 1, maxLen: 4, wordId: 'cap' },
        { id: 'L5_V2', orientation: 'down', row: 0, col: 2, maxLen: 4, wordId: 'ball' },
        { id: 'L5_H1', orientation: 'across', row: 2, col: 0, maxLen: 4, wordId: 'banana' },
        { id: 'L5_H2', orientation: 'across', row: 3, col: 0, maxLen: 4, wordId: 'flower' },
      ],
    },
  ],
  wordBank: [
    { id: 'fruit', clue: '🍎', hi: 'फल', te: 'పండు' },
    { id: 'home', clue: '🏠', hi: 'घर', te: 'ఇల్లు' },
    { id: 'lotus', clue: '🪷', hi: 'कमल', te: 'కమలం' },
    { id: 'water', clue: '💧', hi: 'पानी', te: 'నీరు' },
    { id: 'roti', clue: '🥖', hi: 'रोटी', te: 'రోటీ' },
    { id: 'cat', clue: '🐱', hi: 'बिल्ली', te: 'పిల్లి' },
    { id: 'tea', clue: '🍵', hi: 'चाय', te: 'టీ' },
    { id: 'milk', clue: '🥛', hi: 'दूध', te: 'పాలు' },
    { id: 'boat', clue: '🚤', hi: 'नाव', te: 'పడవ' },
    { id: 'hand', clue: '✋', hi: 'हाथ', te: 'చెయ్యి' },
    { id: 'leg', clue: '🦶', hi: 'पैर', te: 'కాలు' },
    { id: 'nose', clue: '👃', hi: 'नाक', te: 'ముక్కు' },
    { id: 'ear', clue: '👂', hi: 'कान', te: 'చెవి' },
    { id: 'eye', clue: '👁️', hi: 'आंख', te: 'కన్ను' },
    { id: 'fire', clue: '🔥', hi: 'आग', te: 'అగ్ని' },
    { id: 'cloud', clue: '☁️', hi: 'बादल', te: 'మేఘం' },
    { id: 'cap', clue: '🧢', hi: 'टोपी', te: 'టోపీ' },
    { id: 'ball', clue: '⚽', hi: 'गेंद', te: 'బంతి' },
    { id: 'banana', clue: '🍌', hi: 'केला', te: 'అరటి' },
    { id: 'flower', clue: '🌸', hi: 'फूल', te: 'పువ్వు' },
  ],
  isActive: true,
};

async function seedCrossword() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/literacy-games';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if crossword content already exists
    const existing = await Crossword.findOne({ gameKey: 'kidsCrossword' });
    if (existing) {
      console.log('Crossword content already exists. Updating...');
      await Crossword.updateOne({ gameKey: 'kidsCrossword' }, CROSSWORD_DATA);
    } else {
      console.log('Creating new crossword content...');
      await Crossword.create(CROSSWORD_DATA);
    }

    console.log('✓ Crossword content seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding crossword data:', error);
    process.exit(1);
  }
}

seedCrossword();
