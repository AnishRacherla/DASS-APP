const mongoose = require('mongoose');
const Game = require('../models/Game');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding balloon games');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const roundsByLanguage = {
  hindi: {
    vowels: [
      { roundId: 1, targetLetter: 'अ', balloons: ['अ', 'आ', 'इ', 'ई'], correctAnswer: 'अ' },
      { roundId: 2, targetLetter: 'आ', balloons: ['अ', 'आ', 'उ', 'ऊ'], correctAnswer: 'आ' },
      { roundId: 3, targetLetter: 'इ', balloons: ['इ', 'ई', 'उ', 'ऊ'], correctAnswer: 'इ' },
      { roundId: 4, targetLetter: 'ई', balloons: ['अ', 'इ', 'ई', 'ए'], correctAnswer: 'ई' },
      { roundId: 5, targetLetter: 'उ', balloons: ['उ', 'ऊ', 'ए', 'ऐ'], correctAnswer: 'उ' }
    ],
    consonants: [
      { roundId: 1, targetLetter: 'क', balloons: ['क', 'ख', 'ग', 'घ'], correctAnswer: 'क' },
      { roundId: 2, targetLetter: 'च', balloons: ['च', 'छ', 'ज', 'झ'], correctAnswer: 'च' },
      { roundId: 3, targetLetter: 'ट', balloons: ['ट', 'ठ', 'ड', 'ढ'], correctAnswer: 'ट' },
      { roundId: 4, targetLetter: 'प', balloons: ['प', 'फ', 'ब', 'भ'], correctAnswer: 'प' },
      { roundId: 5, targetLetter: 'म', balloons: ['म', 'य', 'र', 'ल'], correctAnswer: 'म' }
    ]
  },
  telugu: {
    vowels: [
      { roundId: 1, targetLetter: 'అ', balloons: ['అ', 'ఆ', 'ఇ', 'ఈ'], correctAnswer: 'అ' },
      { roundId: 2, targetLetter: 'ఆ', balloons: ['అ', 'ఆ', 'ఉ', 'ఊ'], correctAnswer: 'ఆ' },
      { roundId: 3, targetLetter: 'ఇ', balloons: ['ఇ', 'ఈ', 'ఉ', 'ఊ'], correctAnswer: 'ఇ' },
      { roundId: 4, targetLetter: 'ఈ', balloons: ['అ', 'ఇ', 'ఈ', 'ఎ'], correctAnswer: 'ఈ' },
      { roundId: 5, targetLetter: 'ఉ', balloons: ['ఉ', 'ఊ', 'ఎ', 'ఏ'], correctAnswer: 'ఉ' }
    ],
    consonants: [
      { roundId: 1, targetLetter: 'క', balloons: ['క', 'ఖ', 'గ', 'ఘ'], correctAnswer: 'క' },
      { roundId: 2, targetLetter: 'చ', balloons: ['చ', 'ఛ', 'జ', 'ఝ'], correctAnswer: 'చ' },
      { roundId: 3, targetLetter: 'ట', balloons: ['ట', 'ఠ', 'డ', 'ఢ'], correctAnswer: 'ట' },
      { roundId: 4, targetLetter: 'ప', balloons: ['ప', 'ఫ', 'బ', 'భ'], correctAnswer: 'ప' },
      { roundId: 5, targetLetter: 'మ', balloons: ['మ', 'య', 'ర', 'ల'], correctAnswer: 'మ' }
    ]
  }
};

const levelConfig = {
  1: {
    difficulty: 'easy',
    timeLimit: 60,
    pointsPerCorrect: 10,
    pointsPerIncorrect: -3,
    speed: 'medium',
    label: 'Beginner',
    rule: 'Same target letter for full game.'
  },
  2: {
    difficulty: 'medium',
    timeLimit: 60,
    pointsPerCorrect: 15,
    pointsPerIncorrect: -5,
    speed: 'medium',
    label: 'Intermediate',
    rule: 'Target letter changes every 20 seconds.'
  },
  3: {
    difficulty: 'hard',
    timeLimit: 60,
    pointsPerCorrect: 20,
    pointsPerIncorrect: -5,
    speed: 'fast',
    label: 'Advanced',
    rule: 'Target letter changes every 10 seconds.'
  }
};

const languageLabel = {
  hindi: 'Hindi',
  telugu: 'Telugu'
};

const trackLabel = {
  vowels: 'Vowels',
  consonants: 'Consonants'
};

function buildGame(language, track, level) {
  const cfg = levelConfig[level];
  return {
    gameType: 'balloon',
    gameId: `balloon-${language}-${track}-${level}`,
    title: `Level ${level}: ${cfg.label} - ${languageLabel[language]} ${trackLabel[track]}`,
    description: `${cfg.rule} ${trackLabel[track]} practice mode.`,
    language,
    level,
    difficulty: cfg.difficulty,
    gameData: {
      rounds: roundsByLanguage[language][track]
    },
    config: {
      timeLimit: cfg.timeLimit,
      pointsPerCorrect: cfg.pointsPerCorrect,
      pointsPerIncorrect: cfg.pointsPerIncorrect,
      numberOfRounds: 5,
      speed: cfg.speed
    },
    assets: {
      images: [],
      audio: [],
      videos: []
    },
    isActive: true
  };
}

const balloonGames = [];
['hindi', 'telugu'].forEach((language) => {
  ['vowels', 'consonants'].forEach((track) => {
    [1, 2, 3].forEach((level) => {
      balloonGames.push(buildGame(language, track, level));
    });
  });
});

const seedBalloonGames = async () => {
  try {
    await connectDB();

    await Game.deleteMany({ gameType: 'balloon' });
    console.log('Cleared existing balloon games');

    await Game.insertMany(balloonGames);
    console.log('Balloon games seeded successfully!');

    const count = await Game.countDocuments({ gameType: 'balloon' });
    console.log(`Total balloon games in database: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding balloon games:', error);
    process.exit(1);
  }
};

seedBalloonGames();
