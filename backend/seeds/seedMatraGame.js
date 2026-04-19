/**
 * Seed script for Matra Magic Builder game
 * Adds 50+ Hindi words across categories: animals, fruits, colors, body, objects
 * Uses upsert to avoid duplicating existing words.
 *
 * Run:  node seeds/seedMatraGame.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const HindiWord = require('../models/HindiWord');
const HindiMatra = require('../models/HindiMatra');
const HindiLetter = require('../models/HindiLetter');

const WORDS = [
  // ─── जानवर (Animals) ─────────────────────────────────────────
  { combined: 'कुत्ता',  parts: ['कुत्ता'],   meaning: 'dog',      emoji: '🐶', category: 'animals', keyMatra: 'u',  keyCons: 'ka',  levelIntroduced: 5 },
  { combined: 'बिल्ली', parts: ['बिल्ली'],  meaning: 'cat',      emoji: '🐱', category: 'animals', keyMatra: 'i',  keyCons: 'ba',  levelIntroduced: 5 },
  { combined: 'गाय',    parts: ['गाय'],     meaning: 'cow',      emoji: '🐄', category: 'animals', keyMatra: 'aa', keyCons: 'ga',  levelIntroduced: 5 },
  { combined: 'शेर',    parts: ['शेर'],     meaning: 'lion',     emoji: '🦁', category: 'animals', keyMatra: 'e',  keyCons: 'sha', levelIntroduced: 6 },
  { combined: 'हाथी',   parts: ['हाथी'],    meaning: 'elephant', emoji: '🐘', category: 'animals', keyMatra: 'aa', keyCons: 'ha',  levelIntroduced: 6 },
  { combined: 'मछली',   parts: ['मछली'],    meaning: 'fish',     emoji: '🐟', category: 'animals', keyMatra: 'i',  keyCons: 'ma',  levelIntroduced: 6 },
  { combined: 'घोड़ा',  parts: ['घोड़ा'],   meaning: 'horse',    emoji: '🐴', category: 'animals', keyMatra: 'o',  keyCons: 'gha', levelIntroduced: 6 },
  { combined: 'बकरी',   parts: ['बकरी'],    meaning: 'goat',     emoji: '🐐', category: 'animals', keyMatra: 'ii', keyCons: 'ba',  levelIntroduced: 6 },
  { combined: 'मोर',    parts: ['मोर'],     meaning: 'peacock',  emoji: '🦚', category: 'animals', keyMatra: 'o',  keyCons: 'ma',  levelIntroduced: 6 },
  { combined: 'चूहा',   parts: ['चूहा'],    meaning: 'mouse',    emoji: '🐭', category: 'animals', keyMatra: 'uu', keyCons: 'cha', levelIntroduced: 6 },
  { combined: 'भालू',   parts: ['भालू'],    meaning: 'bear',     emoji: '🐻', category: 'animals', keyMatra: 'aa', keyCons: 'bha', levelIntroduced: 7 },
  { combined: 'ऊँट',    parts: ['ऊँट'],     meaning: 'camel',    emoji: '🐫', category: 'animals', keyMatra: 'uu', keyCons: 'ka',  levelIntroduced: 7 },

  // ─── फल (Fruits) ─────────────────────────────────────────────
  { combined: 'आम',     parts: ['आम'],      meaning: 'mango',     emoji: '🥭', category: 'fruits', keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 5 },
  { combined: 'सेब',    parts: ['सेब'],     meaning: 'apple',     emoji: '🍎', category: 'fruits', keyMatra: 'e',  keyCons: 'sa', levelIntroduced: 5 },
  { combined: 'केला',   parts: ['केला'],    meaning: 'banana',    emoji: '🍌', category: 'fruits', keyMatra: 'e',  keyCons: 'ka', levelIntroduced: 5 },
  { combined: 'अंगूर',  parts: ['अंगूर'],   meaning: 'grapes',    emoji: '🍇', category: 'fruits', keyMatra: 'uu', keyCons: 'ga', levelIntroduced: 6 },
  { combined: 'पपीता',  parts: ['पपीता'],   meaning: 'papaya',    emoji: '🥭', category: 'fruits', keyMatra: 'ii', keyCons: 'pa', levelIntroduced: 6 },
  { combined: 'अनार',   parts: ['अनार'],    meaning: 'pomegranate',emoji: '🍎', category: 'fruits', keyMatra: 'aa', keyCons: 'na', levelIntroduced: 6 },
  { combined: 'तरबूज',  parts: ['तरबूज'],   meaning: 'watermelon', emoji: '🍉', category: 'fruits', keyMatra: 'u',  keyCons: 'ta2', levelIntroduced: 7 },
  { combined: 'संतरा',  parts: ['संतरा'],   meaning: 'orange',    emoji: '🍊', category: 'fruits', keyMatra: 'aa', keyCons: 'sa', levelIntroduced: 7 },
  { combined: 'लीची',   parts: ['लीची'],    meaning: 'lychee',    emoji: '🍒', category: 'fruits', keyMatra: 'ii', keyCons: 'la', levelIntroduced: 7 },
  { combined: 'नाशपाती',parts: ['नाशपाती'], meaning: 'pear',      emoji: '🍐', category: 'fruits', keyMatra: 'aa', keyCons: 'na', levelIntroduced: 7 },

  // ─── रंग (Colors) ────────────────────────────────────────────
  { combined: 'लाल',    parts: ['लाल'],     meaning: 'red',       emoji: '🔴', category: 'colors', keyMatra: 'aa', keyCons: 'la', levelIntroduced: 5 },
  { combined: 'नीला',   parts: ['नीला'],    meaning: 'blue',      emoji: '🔵', category: 'colors', keyMatra: 'ii', keyCons: 'na', levelIntroduced: 5 },
  { combined: 'पीला',   parts: ['पीला'],    meaning: 'yellow',    emoji: '🟡', category: 'colors', keyMatra: 'ii', keyCons: 'pa', levelIntroduced: 5 },
  { combined: 'हरा',    parts: ['हरा'],     meaning: 'green',     emoji: '🟢', category: 'colors', keyMatra: 'aa', keyCons: 'ha', levelIntroduced: 5 },
  { combined: 'काला',   parts: ['काला'],    meaning: 'black',     emoji: '⚫', category: 'colors', keyMatra: 'aa', keyCons: 'ka', levelIntroduced: 5 },
  { combined: 'सफ़ेद',  parts: ['सफ़ेद'],   meaning: 'white',     emoji: '⚪', category: 'colors', keyMatra: 'e',  keyCons: 'sa', levelIntroduced: 6 },
  { combined: 'गुलाबी', parts: ['गुलाबी'],  meaning: 'pink',      emoji: '🩷', category: 'colors', keyMatra: 'u',  keyCons: 'ga', levelIntroduced: 6 },
  { combined: 'बैंगनी', parts: ['बैंगनी'],  meaning: 'purple',    emoji: '🟣', category: 'colors', keyMatra: 'ai', keyCons: 'ba', levelIntroduced: 7 },
  { combined: 'नारंगी', parts: ['नारंगी'],  meaning: 'orange',    emoji: '🟠', category: 'colors', keyMatra: 'aa', keyCons: 'na', levelIntroduced: 7 },
  { combined: 'भूरा',   parts: ['भूरा'],    meaning: 'brown',     emoji: '🟤', category: 'colors', keyMatra: 'uu', keyCons: 'bha', levelIntroduced: 7 },

  // ─── शरीर (Body Parts) ───────────────────────────────────────
  { combined: 'हाथ',    parts: ['हाथ'],     meaning: 'hand',      emoji: '🤚', category: 'body', keyMatra: 'aa', keyCons: 'ha',  levelIntroduced: 5 },
  { combined: 'पैर',    parts: ['पैर'],     meaning: 'foot',      emoji: '🦶', category: 'body', keyMatra: 'ai', keyCons: 'pa',  levelIntroduced: 5 },
  { combined: 'नाक',    parts: ['नाक'],     meaning: 'nose',      emoji: '👃', category: 'body', keyMatra: 'aa', keyCons: 'na',  levelIntroduced: 5 },
  { combined: 'कान',    parts: ['कान'],     meaning: 'ear',       emoji: '👂', category: 'body', keyMatra: 'aa', keyCons: 'ka',  levelIntroduced: 5 },
  { combined: 'आँख',    parts: ['आँख'],     meaning: 'eye',       emoji: '👁️', category: 'body', keyMatra: 'aa', keyCons: 'ma',  levelIntroduced: 6 },
  { combined: 'मुँह',   parts: ['मुँह'],    meaning: 'mouth',     emoji: '👄', category: 'body', keyMatra: 'u',  keyCons: 'ma',  levelIntroduced: 6 },
  { combined: 'सिर',    parts: ['सिर'],     meaning: 'head',      emoji: '🗣️', category: 'body', keyMatra: 'i',  keyCons: 'sa',  levelIntroduced: 6 },
  { combined: 'गला',    parts: ['गला'],     meaning: 'throat',    emoji: '🗣️', category: 'body', keyMatra: 'aa', keyCons: 'ga',  levelIntroduced: 6 },
  { combined: 'पेट',    parts: ['पेट'],     meaning: 'stomach',   emoji: '🫃', category: 'body', keyMatra: 'e',  keyCons: 'pa',  levelIntroduced: 6 },
  { combined: 'उंगली',  parts: ['उंगली'],   meaning: 'finger',    emoji: '☝️', category: 'body', keyMatra: 'u',  keyCons: 'ga',  levelIntroduced: 7 },

  // ─── वस्तुएं (Objects) ───────────────────────────────────────
  { combined: 'किताब',  parts: ['किताब'],   meaning: 'book',      emoji: '📚', category: 'objects', keyMatra: 'i',  keyCons: 'ka',  levelIntroduced: 5 },
  { combined: 'कलम',   parts: ['कलम'],     meaning: 'pen',       emoji: '✏️', category: 'objects', keyMatra: 'aa', keyCons: 'ka',  levelIntroduced: 5 },
  { combined: 'घर',     parts: ['घर'],      meaning: 'home',      emoji: '🏠', category: 'objects', keyMatra: 'aa', keyCons: 'gha', levelIntroduced: 5 },
  { combined: 'थाली',   parts: ['थाली'],    meaning: 'plate',     emoji: '🍽️', category: 'objects', keyMatra: 'aa', keyCons: 'tha', levelIntroduced: 6 },
  { combined: 'कुर्सी', parts: ['कुर्सी'],  meaning: 'chair',     emoji: '🪑', category: 'objects', keyMatra: 'u',  keyCons: 'ka',  levelIntroduced: 6 },
  { combined: 'मेज',    parts: ['मेज'],     meaning: 'table',     emoji: '🪵', category: 'objects', keyMatra: 'e',  keyCons: 'ma',  levelIntroduced: 6 },
  { combined: 'दरवाज़ा', parts: ['दरवाज़ा'], meaning: 'door',     emoji: '🚪', category: 'objects', keyMatra: 'aa', keyCons: 'da2', levelIntroduced: 7 },
  { combined: 'खिड़की', parts: ['खिड़की'],  meaning: 'window',    emoji: '🪟', category: 'objects', keyMatra: 'i',  keyCons: 'kha', levelIntroduced: 7 },
  { combined: 'घड़ी',   parts: ['घड़ी'],    meaning: 'clock',     emoji: '🕐', category: 'objects', keyMatra: 'ii', keyCons: 'gha', levelIntroduced: 7 },
  { combined: 'चाबी',   parts: ['चाबी'],    meaning: 'key',       emoji: '🔑', category: 'objects', keyMatra: 'aa', keyCons: 'cha', levelIntroduced: 7 },
];

async function seedMatraGame() {
  await connectDB();
  console.log('🌱 Seeding Matra Game data...\n');

  let inserted = 0;
  let skipped = 0;

  for (const word of WORDS) {
    const exists = await HindiWord.findOne({ combined: word.combined });
    if (exists) {
      // Update category / matra metadata if needed
      let changed = false;
      if (word.keyMatra && !exists.keyMatra) { exists.keyMatra = word.keyMatra; changed = true; }
      if (word.keyCons && !exists.keyCons) { exists.keyCons = word.keyCons; changed = true; }
      if (word.category && exists.category !== word.category) { exists.category = word.category; changed = true; }
      if (changed) await exists.save();
      skipped++;
    } else {
      await HindiWord.create({ ...word, keyIdx: 0 });
      inserted++;
    }
  }

  console.log(`✅ Inserted: ${inserted} | ⏭️ Skipped (already exist): ${skipped}`);
  console.log(`📊 Total words in DB: ${await HindiWord.countDocuments()}`);

  // Verify matras exist
  const matraCount = await HindiMatra.countDocuments();
  const letterCount = await HindiLetter.countDocuments();
  console.log(`\n📝 Hindi Matras in DB: ${matraCount}`);
  console.log(`📝 Hindi Letters in DB: ${letterCount}`);

  if (matraCount === 0 || letterCount === 0) {
    console.log('\n⚠️  Matras or Letters are empty! Run the akshara seed first:');
    console.log('   POST http://localhost:5001/api/akshara/seed?adminKey=change_me');
  }

  await mongoose.disconnect();
  console.log('\n🌱 Seeding complete!');
}

seedMatraGame().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
