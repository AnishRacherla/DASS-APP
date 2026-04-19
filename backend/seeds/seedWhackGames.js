const mongoose = require('mongoose');
const Game = require('../models/Game');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding whack games');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Hindi letter pools — 9 letters per pool (fits one full 3×3 grid)
const hindiVowels      = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ'];
const hindiConsonants1 = ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट'];
const hindiConsonants2 = ['त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'म'];
const hindiConsonants3 = ['य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष'];
const hindiMixed1      = ['अ', 'क', 'ग', 'इ', 'त', 'प', 'ए', 'म', 'र'];
const hindiMixed2      = ['आ', 'ख', 'च', 'ई', 'थ', 'फ', 'ऐ', 'ब', 'ल'];

// Telugu letter pools
const teluguVowels      = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఒ'];
const teluguConsonants1 = ['క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట'];
const teluguConsonants2 = ['త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'మ'];
const teluguConsonants3 = ['య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ'];
const teluguMixed1      = ['అ', 'క', 'గ', 'ఇ', 'త', 'ప', 'ఎ', 'మ', 'ర'];
const teluguMixed2      = ['ఆ', 'ఖ', 'చ', 'ఈ', 'థ', 'ఫ', 'ఏ', 'బ', 'ల'];

const makeGame = (language, level, targetLetter, allLetters, title, description, difficulty) => ({
  gameType: 'whack',
  gameId: `whack-${language}-${level}`,
  title,
  description,
  language,
  level,
  difficulty,
  gameData: {
    targetLetter,
    allLetters  // pool of 9 letters used to fill all tiles
  },
  config: {
    timeLimit: 40,
    pointsPerCorrect: 0,  // actual points = time left on global timer
    pointsPerIncorrect: -1,
    numberOfRounds: 5,
    speed: 'medium'
  },
  assets: { images: [], audio: [], videos: [] },
  isActive: true
});

const whackGames = [
  // ─── Hindi ──────────────────────────────────────────────────────────────
  // Easy — vowels
  makeGame('hindi',  1, 'अ',  hindiVowels,      'Whack-a-Letter: Level 1',  'Listen and find the correct letter!', 'easy'),
  makeGame('hindi',  2, 'आ',  hindiVowels,      'Whack-a-Letter: Level 2',  'Listen and find the correct letter!', 'easy'),
  makeGame('hindi',  3, 'इ',  hindiVowels,      'Whack-a-Letter: Level 3',  'Listen and find the correct letter!', 'easy'),
  makeGame('hindi',  4, 'उ',  hindiVowels,      'Whack-a-Letter: Level 4',  'Listen and find the correct letter!', 'easy'),
  makeGame('hindi',  5, 'ए',  hindiVowels,      'Whack-a-Letter: Level 5',  'Listen and find the correct letter!', 'easy'),
  // Medium — consonants
  makeGame('hindi',  6, 'क',  hindiConsonants1, 'Whack-a-Letter: Level 6',  'Listen and find the correct letter!', 'medium'),
  makeGame('hindi',  7, 'ग',  hindiConsonants1, 'Whack-a-Letter: Level 7',  'Listen and find the correct letter!', 'medium'),
  makeGame('hindi',  8, 'च',  hindiConsonants1, 'Whack-a-Letter: Level 8',  'Listen and find the correct letter!', 'medium'),
  makeGame('hindi',  9, 'त',  hindiConsonants2, 'Whack-a-Letter: Level 9',  'Listen and find the correct letter!', 'medium'),
  makeGame('hindi', 10, 'प',  hindiConsonants2, 'Whack-a-Letter: Level 10', 'Listen and find the correct letter!', 'medium'),
  // Hard — consonants set 3 & mixed
  makeGame('hindi', 11, 'श',  hindiConsonants3, 'Whack-a-Letter: Level 11', 'Listen and find the correct letter!', 'hard'),
  makeGame('hindi', 12, 'र',  hindiConsonants3, 'Whack-a-Letter: Level 12', 'Listen and find the correct letter!', 'hard'),
  makeGame('hindi', 13, 'क',  hindiMixed1,      'Whack-a-Letter: Level 13', 'Listen and find the correct letter!', 'hard'),
  makeGame('hindi', 14, 'ख',  hindiMixed2,      'Whack-a-Letter: Level 14', 'Listen and find the correct letter!', 'hard'),

  // ─── Telugu ─────────────────────────────────────────────────────────────
  // Easy — vowels
  makeGame('telugu',  1, 'అ',  teluguVowels,      'Whack-a-Letter: Level 1',  'Listen and find the correct letter!', 'easy'),
  makeGame('telugu',  2, 'ఆ',  teluguVowels,      'Whack-a-Letter: Level 2',  'Listen and find the correct letter!', 'easy'),
  makeGame('telugu',  3, 'ఇ',  teluguVowels,      'Whack-a-Letter: Level 3',  'Listen and find the correct letter!', 'easy'),
  makeGame('telugu',  4, 'ఉ',  teluguVowels,      'Whack-a-Letter: Level 4',  'Listen and find the correct letter!', 'easy'),
  makeGame('telugu',  5, 'ఎ',  teluguVowels,      'Whack-a-Letter: Level 5',  'Listen and find the correct letter!', 'easy'),
  // Medium — consonants
  makeGame('telugu',  6, 'క',  teluguConsonants1, 'Whack-a-Letter: Level 6',  'Listen and find the correct letter!', 'medium'),
  makeGame('telugu',  7, 'గ',  teluguConsonants1, 'Whack-a-Letter: Level 7',  'Listen and find the correct letter!', 'medium'),
  makeGame('telugu',  8, 'చ',  teluguConsonants1, 'Whack-a-Letter: Level 8',  'Listen and find the correct letter!', 'medium'),
  makeGame('telugu',  9, 'త',  teluguConsonants2, 'Whack-a-Letter: Level 9',  'Listen and find the correct letter!', 'medium'),
  makeGame('telugu', 10, 'ప',  teluguConsonants2, 'Whack-a-Letter: Level 10', 'Listen and find the correct letter!', 'medium'),
  // Hard — consonants set 3 & mixed
  makeGame('telugu', 11, 'శ',  teluguConsonants3, 'Whack-a-Letter: Level 11', 'Listen and find the correct letter!', 'hard'),
  makeGame('telugu', 12, 'ర',  teluguConsonants3, 'Whack-a-Letter: Level 12', 'Listen and find the correct letter!', 'hard'),
  makeGame('telugu', 13, 'క',  teluguMixed1,      'Whack-a-Letter: Level 13', 'Listen and find the correct letter!', 'hard'),
  makeGame('telugu', 14, 'ఖ',  teluguMixed2,      'Whack-a-Letter: Level 14', 'Listen and find the correct letter!', 'hard'),
];

const seedWhackGames = async () => {
  try {
    await connectDB();

    await Game.deleteMany({ gameType: 'whack' });
    console.log('Cleared existing whack games');

    await Game.insertMany(whackGames);
    console.log(`Seeded ${whackGames.length} whack games`);

    const count = await Game.countDocuments({ gameType: 'whack' });
    console.log(`Total whack games in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding whack games:', error);
    process.exit(1);
  }
};

seedWhackGames();
