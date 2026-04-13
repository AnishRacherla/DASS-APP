const mongoose = require('mongoose');
require('dotenv').config();
const Game = require('../models/Game');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected for Seeding Shabd Games'))
    .catch(err => console.log(err));

// We reuse the fantastic 20 word vocabulary from the Mars Game & Lessons
// and package them into groups of 4 for the Shabd Match game.
const hindiVocab = [
    { word: 'कुत्ता', meaning: 'dog', image: '/images/hindi/dog.png', audio: '/audio/hindi/Dog_Hindi.mp4.mp3' },
    { word: 'बिल्ली', meaning: 'cat', image: '/images/hindi/cat.png', audio: '/audio/hindi/Cat_Hindi.mp4.mp3' },
    { word: 'हाथी', meaning: 'elephant', image: '/images/hindi/elephant.png', audio: '/audio/hindi/Elephant_Hindi.mp4.mp3' },
    { word: 'शेर', meaning: 'lion', image: '/images/hindi/lion.png', audio: '/audio/hindi/Lion_Hindi.mp4.mp3' },
    { word: 'घर', meaning: 'house', image: '/images/hindi/house.png', audio: '/audio/hindi/House_Hindi.mp4.mp3' },
    { word: 'फूल', meaning: 'flower', image: '/images/hindi/flower.png', audio: '/audio/hindi/Flower_Hindi.mp4.mp3' },
    { word: 'कार', meaning: 'car', image: '/images/hindi/car.png', audio: '/audio/hindi/Car_Hindi.mp4.mp3' },
    { word: 'सूरज', meaning: 'sun', image: '/images/hindi/sun.png', audio: '/audio/hindi/Sun_Hindi.mp4.mp3' }
];

const teluguVocab = [
    { word: 'కుక్క', meaning: 'dog', image: '/images/telugu/dog.png', audio: '/audio/telugu/Dog_Telugu.mp4.mp3' },
    { word: 'పిల్లి', meaning: 'cat', image: '/images/telugu/cat.png', audio: '/audio/telugu/Cat_Telugu.mp4.mp3' },
    { word: 'ఏనుగు', meaning: 'elephant', image: '/images/telugu/elephant.png', audio: '/audio/telugu/Elephant_Telugu.mp4.mp3' },
    { word: 'సింహం', meaning: 'lion', image: '/images/telugu/lion.png', audio: '/audio/telugu/Lion_Telugu.mp4.mp3' },
    { word: 'ఇల్లు', meaning: 'house', image: '/images/telugu/house.png', audio: '/audio/telugu/House_Telugu.mp4.mp3' },
    { word: 'పువ్వు', meaning: 'flower', image: '/images/telugu/flower.png', audio: '/audio/telugu/Flower_Telugu.mp4.mp3' },
    { word: 'కారు', meaning: 'car', image: '/images/telugu/car.png', audio: '/audio/telugu/Car_Telugu.mp4.mp3' },
    { word: 'సూర్యుడు', meaning: 'sun', image: '/images/telugu/sun.png', audio: '/audio/telugu/Sun_Telugu.mp4.mp3' }
];

const shabdGames = [
    // HINDI
    {
        gameType: 'shabd',
        gameId: 'shabd-hindi-1',
        title: 'Animals Match 1',
        language: 'hindi',
        level: 1,
        difficulty: 'easy',
        gameData: {
            pairs: hindiVocab.slice(0, 4) // Dog, Cat, Elephant, Lion
        },
        config: { timeLimit: 0, pointsPerCorrect: 10 }
    },
    {
        gameType: 'shabd',
        gameId: 'shabd-hindi-2',
        title: 'Objects Match 1',
        language: 'hindi',
        level: 2,
        difficulty: 'medium',
        gameData: {
            pairs: hindiVocab.slice(4, 8) // House, Flower, Car, Sun
        },
        config: { timeLimit: 0, pointsPerCorrect: 10 }
    },

    // TELUGU
    {
        gameType: 'shabd',
        gameId: 'shabd-telugu-1',
        title: 'Animals Match 1',
        language: 'telugu',
        level: 1,
        difficulty: 'easy',
        gameData: {
            pairs: teluguVocab.slice(0, 4)
        },
        config: { timeLimit: 0, pointsPerCorrect: 10 }
    },
    {
        gameType: 'shabd',
        gameId: 'shabd-telugu-2',
        title: 'Objects Match 1',
        language: 'telugu',
        level: 2,
        difficulty: 'medium',
        gameData: {
            pairs: teluguVocab.slice(4, 8)
        },
        config: { timeLimit: 0, pointsPerCorrect: 10 }
    }
];

const seedShabd = async () => {
    try {
        await Game.deleteMany({ gameType: 'shabd' });
        console.log('Cleared existing shabd games');

        await Game.insertMany(shabdGames);
        console.log(`✅ Seeded ${shabdGames.length} shabd games successfully`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedShabd();
