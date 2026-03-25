#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();
const HindiLetter = require('../models/HindiLetter');
const TeluguLetter = require('../models/TeluguLetter');

async function scanLetters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Scan Hindi letters
    const hindiLetters = await HindiLetter.find({}).select('id symbol type audioFileName').sort('id');
    console.log('\n=== HINDI LETTERS ===');
    console.log(`Total: ${hindiLetters.length}`);
    console.log('\nWith Audio:');
    hindiLetters.filter(l => l.audioFileName).forEach(l => {
      console.log(`  ${l.symbol} (${l.id}) - ${l.type} - [${l.audioFileName}]`);
    });
    console.log('\nWithout Audio:');
    hindiLetters.filter(l => !l.audioFileName).forEach(l => {
      console.log(`  ${l.symbol} (${l.id}) - ${l.type}`);
    });

    // Scan Telugu letters
    const teluguLetters = await TeluguLetter.find({}).select('id symbol type audioFileName').sort('id');
    console.log('\n=== TELUGU LETTERS ===');
    console.log(`Total: ${teluguLetters.length}`);
    console.log('\nWith Audio:');
    teluguLetters.filter(l => l.audioFileName).forEach(l => {
      console.log(`  ${l.symbol} (${l.id}) - ${l.type} - [${l.audioFileName}]`);
    });
    console.log('\nWithout Audio:');
    teluguLetters.filter(l => !l.audioFileName).forEach(l => {
      console.log(`  ${l.symbol} (${l.id}) - ${l.type}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

scanLetters();
