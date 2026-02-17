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

// Balloon Game Data Structure
const balloonGames = [
  {
    gameType: 'balloon',
    gameId: 'balloon-hindi-1',
    title: 'Balloon Pop - Hindi Vowels',
    description: 'Pop the balloon with the correct letter!',
    language: 'hindi',
    level: 1,
    difficulty: 'easy',
    gameData: {
      rounds: [
        {
          roundId: 1,
          targetLetter: 'अ',
          balloons: ['अ', 'आ', 'इ', 'ई'],
          correctAnswer: 'अ'
        },
        {
          roundId: 2,
          targetLetter: 'आ',
          balloons: ['अ', 'आ', 'उ', 'ऊ'],
          correctAnswer: 'आ'
        },
        {
          roundId: 3,
          targetLetter: 'इ',
          balloons: ['इ', 'ई', 'उ', 'ऊ'],
          correctAnswer: 'इ'
        },
        {
          roundId: 4,
          targetLetter: 'ई',
          balloons: ['अ', 'इ', 'ई', 'ए'],
          correctAnswer: 'ई'
        },
        {
          roundId: 5,
          targetLetter: 'उ',
          balloons: ['उ', 'ऊ', 'ए', 'ऐ'],
          correctAnswer: 'उ'
        }
      ]
    },
    config: {
      timeLimit: 60,
      pointsPerCorrect: 10,
      pointsPerIncorrect: -3,
      numberOfRounds: 5,
      speed: 'medium'
    },
    assets: {
      images: [],
      audio: [],
      videos: []
    },
    isActive: true
  },
  {
    gameType: 'balloon',
    gameId: 'balloon-hindi-2',
    title: 'Balloon Pop - Hindi Consonants',
    description: 'Pop the balloon with the correct consonant!',
    language: 'hindi',
    level: 2,
    difficulty: 'medium',
    gameData: {
      rounds: [
        {
          roundId: 1,
          targetLetter: 'क',
          balloons: ['क', 'ख', 'ग', 'घ'],
          correctAnswer: 'क'
        },
        {
          roundId: 2,
          targetLetter: 'च',
          balloons: ['च', 'छ', 'ज', 'झ'],
          correctAnswer: 'च'
        },
        {
          roundId: 3,
          targetLetter: 'ट',
          balloons: ['ट', 'ठ', 'ड', 'ढ'],
          correctAnswer: 'ट'
        },
        {
          roundId: 4,
          targetLetter: 'प',
          balloons: ['प', 'फ', 'ब', 'भ'],
          correctAnswer: 'प'
        },
        {
          roundId: 5,
          targetLetter: 'म',
          balloons: ['म', 'य', 'र', 'ल'],
          correctAnswer: 'म'
        }
      ]
    },
    config: {
      timeLimit: 50,
      pointsPerCorrect: 15,
      pointsPerIncorrect: -5,
      numberOfRounds: 5,
      speed: 'medium'
    },
    assets: {
      images: [],
      audio: [],
      videos: []
    },
    isActive: true
  },
  {
    gameType: 'balloon',
    gameId: 'balloon-telugu-1',
    title: 'Balloon Pop - Telugu Vowels',
    description: 'Pop the balloon with the correct letter!',
    language: 'telugu',
    level: 1,
    difficulty: 'easy',
    gameData: {
      rounds: [
        {
          roundId: 1,
          targetLetter: 'అ',
          balloons: ['అ', 'ఆ', 'ఇ', 'ఈ'],
          correctAnswer: 'అ'
        },
        {
          roundId: 2,
          targetLetter: 'ఆ',
          balloons: ['అ', 'ఆ', 'ఉ', 'ఊ'],
          correctAnswer: 'ఆ'
        },
        {
          roundId: 3,
          targetLetter: 'ఇ',
          balloons: ['ఇ', 'ఈ', 'ఉ', 'ఊ'],
          correctAnswer: 'ఇ'
        },
        {
          roundId: 4,
          targetLetter: 'ఈ',
          balloons: ['అ', 'ఇ', 'ఈ', 'ఎ'],
          correctAnswer: 'ఈ'
        },
        {
          roundId: 5,
          targetLetter: 'ఉ',
          balloons: ['ఉ', 'ఊ', 'ఎ', 'ఏ'],
          correctAnswer: 'ఉ'
        }
      ]
    },
    config: {
      timeLimit: 60,
      pointsPerCorrect: 10,
      pointsPerIncorrect: -3,
      numberOfRounds: 5,
      speed: 'medium'
    },
    assets: {
      images: [],
      audio: [],
      videos: []
    },
    isActive: true
  }
];

const seedBalloonGames = async () => {
  try {
    await connectDB();
    
    // Clear existing balloon games
    await Game.deleteMany({ gameType: 'balloon' });
    console.log('Cleared existing balloon games');
    
    // Insert new balloon games
    await Game.insertMany(balloonGames);
    console.log('Balloon games seeded successfully!');
    
    // Display summary
    const count = await Game.countDocuments({ gameType: 'balloon' });
    console.log(`Total balloon games in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding balloon games:', error);
    process.exit(1);
  }
};

seedBalloonGames();
