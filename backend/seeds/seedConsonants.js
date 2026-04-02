const mongoose = require('mongoose');
const googleTTS = require('google-tts-api');
const Consonant = require('../models/Consonant');
require('dotenv').config();

const hindiConsonants = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह'
];

const teluguConsonants = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ',
  'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ'
];

async function generateTTS(text, lang) {
  try {
    const url = googleTTS.getAudioUrl(text, {
      lang,
      slow: false,
      host: 'https://translate.google.com',
    });
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error(`TTS failed for ${text}:`, error.message);
    return null;
  }
}

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/literacy_game';
  await mongoose.connect(uri);
  console.log('Connected to DB');

  await Consonant.deleteMany({});
  console.log('Cleared existing consonants');

  for (const letter of hindiConsonants) {
    console.log(`Generating audio for Hindi ${letter}...`);
    const audioBase64 = await generateTTS(letter, 'hi');
    if (audioBase64) {
      await Consonant.create({ letter, language: 'hindi', audioBase64: `data:audio/mp3;base64,${audioBase64}` });
    }
    await new Promise((res) => setTimeout(res, 300));
  }

  for (const letter of teluguConsonants) {
    console.log(`Generating audio for Telugu ${letter}...`);
    const audioBase64 = await generateTTS(letter, 'te');
    if (audioBase64) {
      await Consonant.create({ letter, language: 'telugu', audioBase64: `data:audio/mp3;base64,${audioBase64}` });
    }
    await new Promise((res) => setTimeout(res, 300));
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed();
