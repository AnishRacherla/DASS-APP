#!/usr/bin/env node
/**
 * Seed script to populate Hindi and Telugu letters with audio files.
 * Run this AFTER running: python generate_letter_audio.py
 *
 * Usage: node backend/scripts/seed-letters.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const HindiLetter = require('../models/HindiLetter');
const TeluguLetter = require('../models/TeluguLetter');

// Letter definitions matching the Python script
const hindiLetters = [
  // Vowels (11)
  { id: 'a', symbol: 'अ', type: 'vowel' },
  { id: 'aa', symbol: 'आ', type: 'vowel' },
  { id: 'i', symbol: 'इ', type: 'vowel' },
  { id: 'ee', symbol: 'ई', type: 'vowel' },
  { id: 'u', symbol: 'उ', type: 'vowel' },
  { id: 'uu', symbol: 'ऊ', type: 'vowel' },
  { id: 'ri', symbol: 'ऋ', type: 'vowel' },
  { id: 'e', symbol: 'ए', type: 'vowel' },
  { id: 'ai', symbol: 'ऐ', type: 'vowel' },
  { id: 'o', symbol: 'ओ', type: 'vowel' },
  { id: 'au', symbol: 'औ', type: 'vowel' },
  // Consonants (33)
  { id: 'ka', symbol: 'क', type: 'consonant', stage: 1 },
  { id: 'kha', symbol: 'ख', type: 'consonant', stage: 1 },
  { id: 'ga', symbol: 'ग', type: 'consonant', stage: 1 },
  { id: 'gha', symbol: 'घ', type: 'consonant', stage: 1 },
  { id: 'nga', symbol: 'ङ', type: 'consonant', stage: 2 },
  { id: 'cha', symbol: 'च', type: 'consonant', stage: 1 },
  { id: 'chha', symbol: 'छ', type: 'consonant', stage: 1 },
  { id: 'ja', symbol: 'ज', type: 'consonant', stage: 1 },
  { id: 'jha', symbol: 'झ', type: 'consonant', stage: 1 },
  { id: 'nya', symbol: 'ञ', type: 'consonant', stage: 2 },
  { id: 'ta1', symbol: 'ट', type: 'consonant', stage: 2 },
  { id: 'tha', symbol: 'ठ', type: 'consonant', stage: 2 },
  { id: 'da1', symbol: 'ड', type: 'consonant', stage: 2 },
  { id: 'dha', symbol: 'ढ', type: 'consonant', stage: 2 },
  { id: 'na1', symbol: 'ण', type: 'consonant', stage: 2 },
  { id: 'ta2', symbol: 'त', type: 'consonant', stage: 1 },
  { id: 'tha2', symbol: 'थ', type: 'consonant', stage: 1 },
  { id: 'da2', symbol: 'द', type: 'consonant', stage: 1 },
  { id: 'dha2', symbol: 'ध', type: 'consonant', stage: 1 },
  { id: 'na', symbol: 'न', type: 'consonant', stage: 1 },
  { id: 'pa', symbol: 'प', type: 'consonant', stage: 1 },
  { id: 'pha', symbol: 'फ', type: 'consonant', stage: 1 },
  { id: 'ba', symbol: 'ब', type: 'consonant', stage: 1 },
  { id: 'bha', symbol: 'भ', type: 'consonant', stage: 1 },
  { id: 'ma', symbol: 'म', type: 'consonant', stage: 1 },
  { id: 'ya', symbol: 'य', type: 'consonant', stage: 2 },
  { id: 'ra', symbol: 'र', type: 'consonant', stage: 1 },
  { id: 'la', symbol: 'ल', type: 'consonant', stage: 1 },
  { id: 'va', symbol: 'व', type: 'consonant', stage: 1 },
  { id: 'sha', symbol: 'श', type: 'consonant', stage: 2 },
  { id: 'ssha', symbol: 'ष', type: 'consonant', stage: 2 },
  { id: 'sa', symbol: 'स', type: 'consonant', stage: 2 },
  { id: 'ha', symbol: 'ह', type: 'consonant', stage: 2 },
];

const teluguLetters = [
  // Vowels (13)
  { id: 'a', symbol: 'అ', type: 'vowel' },
  { id: 'aa', symbol: 'ఆ', type: 'vowel' },
  { id: 'i', symbol: 'ఇ', type: 'vowel' },
  { id: 'ee', symbol: 'ఈ', type: 'vowel' },
  { id: 'u', symbol: 'ఉ', type: 'vowel' },
  { id: 'uu', symbol: 'ఊ', type: 'vowel' },
  { id: 'ri', symbol: 'ఋ', type: 'vowel' },
  { id: 'e', symbol: 'ఎ', type: 'vowel' },
  { id: 'ea', symbol: 'ఏ', type: 'vowel' },
  { id: 'ai', symbol: 'ఐ', type: 'vowel' },
  { id: 'o', symbol: 'ఒ', type: 'vowel' },
  { id: 'oa', symbol: 'ఓ', type: 'vowel' },
  { id: 'au', symbol: 'ఔ', type: 'vowel' },
  // Consonants (35)
  { id: 'ka', symbol: 'క', type: 'consonant', stage: 1 },
  { id: 'kha', symbol: 'ఖ', type: 'consonant', stage: 1 },
  { id: 'ga', symbol: 'గ', type: 'consonant', stage: 1 },
  { id: 'gha', symbol: 'ఘ', type: 'consonant', stage: 1 },
  { id: 'nga', symbol: 'ఙ', type: 'consonant', stage: 2 },
  { id: 'cha', symbol: 'చ', type: 'consonant', stage: 1 },
  { id: 'chha', symbol: 'ఛ', type: 'consonant', stage: 1 },
  { id: 'ja', symbol: 'జ', type: 'consonant', stage: 1 },
  { id: 'jha', symbol: 'ఝ', type: 'consonant', stage: 1 },
  { id: 'nya', symbol: 'ఞ', type: 'consonant', stage: 2 },
  { id: 'ta1', symbol: 'ట', type: 'consonant', stage: 2 },
  { id: 'tha', symbol: 'ఠ', type: 'consonant', stage: 2 },
  { id: 'da1', symbol: 'డ', type: 'consonant', stage: 2 },
  { id: 'dha', symbol: 'ఢ', type: 'consonant', stage: 2 },
  { id: 'na1', symbol: 'ణ', type: 'consonant', stage: 2 },
  { id: 'ta2', symbol: 'త', type: 'consonant', stage: 1 },
  { id: 'tha2', symbol: 'థ', type: 'consonant', stage: 1 },
  { id: 'da2', symbol: 'ద', type: 'consonant', stage: 1 },
  { id: 'dha2', symbol: 'ధ', type: 'consonant', stage: 1 },
  { id: 'na', symbol: 'న', type: 'consonant', stage: 1 },
  { id: 'pa', symbol: 'ప', type: 'consonant', stage: 1 },
  { id: 'pha', symbol: 'ఫ', type: 'consonant', stage: 1 },
  { id: 'ba', symbol: 'బ', type: 'consonant', stage: 1 },
  { id: 'bha', symbol: 'భ', type: 'consonant', stage: 1 },
  { id: 'ma', symbol: 'మ', type: 'consonant', stage: 1 },
  { id: 'ya', symbol: 'య', type: 'consonant', stage: 2 },
  { id: 'ra', symbol: 'ర', type: 'consonant', stage: 1 },
  { id: 'la', symbol: 'ల', type: 'consonant', stage: 1 },
  { id: 'va', symbol: 'వ', type: 'consonant', stage: 1 },
  { id: 'sha', symbol: 'శ', type: 'consonant', stage: 2 },
  { id: 'ssha', symbol: 'ష', type: 'consonant', stage: 2 },
  { id: 'sa', symbol: 'స', type: 'consonant', stage: 2 },
  { id: 'ha', symbol: 'హ', type: 'consonant', stage: 2 },
  { id: 'lla', symbol: 'ళ', type: 'consonant', stage: 2 },
  { id: 'ksha', symbol: 'క్ష', type: 'consonant', stage: 2 },
  { id: 'rra', symbol: 'ఱ', type: 'consonant', stage: 2 },
];

async function seedLetters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Seed Hindi letters
    console.log('\n========== SEEDING HINDI LETTERS ==========');
    await seedLanguageLetters(
      HindiLetter,
      hindiLetters,
      'Hindi'
    );

    // Seed Telugu letters
    console.log('\n========== SEEDING TELUGU LETTERS ==========');
    await seedLanguageLetters(
      TeluguLetter,
      teluguLetters,
      'Telugu'
    );

    console.log('\n========== SEEDING COMPLETE ==========');
    console.log('✓ All letters have been seeded!');
    console.log('\nNEXT STEPS:');
    console.log('1. Restart backend: npm run dev');
    console.log('2. Restart frontend: npm start');
    console.log('3. Test BalloonGame - audio should play for each letter');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function seedLanguageLetters(Model, letters, langName, audioDir) {
  let seeded = 0;
  let skipped = 0;
  let missingAudio = 0;

  for (const letterData of letters) {
    const audioFile = `${letterData.id}_${langName}.mp3`;
    // Resolve the path relative to the backend directory
    const audioPath = path.join(__dirname, `../assets/audio/${langName.toLowerCase()}_letters`, audioFile);
    const audioUrl = `/audio/${langName.toLowerCase()}_letters/${audioFile}`;

    // Check if audio file exists
    const audioExists = fs.existsSync(audioPath);

    if (!audioExists) {
      console.log(`  ✗ ${letterData.symbol} (${letterData.id}) - AUDIO FILE NOT FOUND`);
      missingAudio++;
      continue;
    }

    try {
      // Read audio file for database storage
      const audioData = fs.readFileSync(audioPath);

      // Create or update letter record
      const letter = await Model.findOneAndUpdate(
        { id: letterData.id },
        {
          id: letterData.id,
          symbol: letterData.symbol,
          name: letterData.id,
          type: letterData.type || 'consonant',
          stage: letterData.stage || 1,
          audioUrl: audioUrl,
          audioFileName: audioFile,
          audioData: audioData,
          audioContentType: 'audio/mpeg',
        },
        { upsert: true, new: true }
      );

      console.log(`  ✓ ${letterData.symbol} (${letterData.id}) - ${letter.type}`);
      seeded++;
    } catch (error) {
      console.error(`  ✗ ${letterData.symbol} (${letterData.id}) - ERROR: ${error.message}`);
    }
  }

  console.log(`\n${langName} Summary:`);
  console.log(`  Seeded: ${seeded}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Missing Audio: ${missingAudio}`);
}

// Run seeding
seedLetters();
