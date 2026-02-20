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

// Hindi letter pools — 9 letters per pool (fits one full 3x3 grid)
const hindiVowels   = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ'];
const hindiConsonants1 = ['क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट'];
const hindiConsonants2 = ['त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'म'];

// Telugu letter pools
const teluguVowels   = ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఒ'];
const teluguConsonants1 = ['క', 'ఖ', 'గ', 'ఘ', 'చ', 'ఛ', 'జ', 'ఝ', 'ట'];
const teluguConsonants2 = ['త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'మ'];

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
  // Hindi
  makeGame('hindi', 1, 'अ', hindiVowels,      'Whack-a-Letter: अ',  'Find and tap all tiles showing अ!', 'easy'),
  makeGame('hindi', 2, 'आ', hindiVowels,      'Whack-a-Letter: आ',  'Find and tap all tiles showing आ!', 'easy'),
  makeGame('hindi', 3, 'इ', hindiVowels,      'Whack-a-Letter: इ',  'Find and tap all tiles showing इ!', 'easy'),
  makeGame('hindi', 4, 'क', hindiConsonants1, 'Whack-a-Letter: क',  'Find and tap all tiles showing क!', 'medium'),
  makeGame('hindi', 5, 'ग', hindiConsonants1, 'Whack-a-Letter: ग',  'Find and tap all tiles showing ग!', 'medium'),
  makeGame('hindi', 6, 'त', hindiConsonants2, 'Whack-a-Letter: त',  'Find and tap all tiles showing त!', 'hard'),
  makeGame('hindi', 7, 'प', hindiConsonants2, 'Whack-a-Letter: प',  'Find and tap all tiles showing प!', 'hard'),

  // Telugu
  makeGame('telugu', 1, 'అ', teluguVowels,      'Whack-a-Letter: అ',  'Find and tap all tiles showing అ!', 'easy'),
  makeGame('telugu', 2, 'ఆ', teluguVowels,      'Whack-a-Letter: ఆ',  'Find and tap all tiles showing ఆ!', 'easy'),
  makeGame('telugu', 3, 'ఇ', teluguVowels,      'Whack-a-Letter: ఇ',  'Find and tap all tiles showing ఇ!', 'easy'),
  makeGame('telugu', 4, 'క', teluguConsonants1, 'Whack-a-Letter: క',  'Find and tap all tiles showing క!', 'medium'),
  makeGame('telugu', 5, 'గ', teluguConsonants1, 'Whack-a-Letter: గ',  'Find and tap all tiles showing గ!', 'medium'),
  makeGame('telugu', 6, 'త', teluguConsonants2, 'Whack-a-Letter: త',  'Find and tap all tiles showing త!', 'hard'),
  makeGame('telugu', 7, 'ప', teluguConsonants2, 'Whack-a-Letter: ప',  'Find and tap all tiles showing ప!', 'hard'),
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
