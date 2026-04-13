const express = require('express');
const router = express.Router();
const HindiMatra = require('../models/HindiMatra');
const HindiLetter = require('../models/HindiLetter');
const HindiWord = require('../models/HindiWord');
const Score = require('../models/Score');

// ─── LEVEL CONFIGURATION ────────────────────────────────────────────────────
const LEVELS = [
  {
    level: 1,
    name: 'Learn the Matras',
    nameHindi: 'मात्राएँ सीखें',
    description: 'Interactive introduction to basic matras with audio',
    mode: 'learn',
    matras: ['aa', 'i', 'ii', 'u', 'uu'],
    wordsPerRound: 8,
    timeLimit: 0,
    pointsPerCorrect: 10,
    starsThreshold: [50, 70, 90],
  },
  {
    level: 2,
    name: 'Tap & Match',
    nameHindi: 'टैप और मिलाओ',
    description: 'Tap the correct matra for each word',
    mode: 'tap',
    matras: ['aa', 'i', 'ii', 'u', 'uu'],
    wordsPerRound: 10,
    timeLimit: 0,
    pointsPerCorrect: 15,
    starsThreshold: [80, 120, 150],
  },
  {
    level: 3,
    name: 'Drag & Drop',
    nameHindi: 'खींचो और छोड़ो',
    description: 'Drag matras onto consonants to build words',
    mode: 'drag',
    matras: ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'],
    wordsPerRound: 10,
    timeLimit: 0,
    pointsPerCorrect: 20,
    starsThreshold: [120, 160, 200],
  },
  {
    level: 4,
    name: 'Word Scramble',
    nameHindi: 'शब्द पहेली',
    description: 'Arrange syllables to form Hindi words',
    mode: 'scramble',
    matras: ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'],
    wordsPerRound: 10,
    timeLimit: 0,
    pointsPerCorrect: 25,
    starsThreshold: [150, 200, 250],
  },
  {
    level: 5,
    name: 'Speed Challenge',
    nameHindi: 'स्पीड चैलेंज',
    description: 'Timed rounds across all categories — race against the clock!',
    mode: 'speed',
    matras: ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'],
    wordsPerRound: 15,
    timeLimit: 90,
    pointsPerCorrect: 30,
    starsThreshold: [200, 350, 450],
  },
];

// GET /api/matra-game/levels  — return level configuration
router.get('/levels', (req, res) => {
  res.json(LEVELS);
});

// GET /api/matra-game/matras  — all Hindi matras sorted by stage
router.get('/matras', async (req, res) => {
  try {
    const matras = await HindiMatra.find().sort({ stage: 1, levelIntroduced: 1 });
    res.json(matras);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/matra-game/consonants  — all Hindi consonants sorted by stage
router.get('/consonants', async (req, res) => {
  try {
    const consonants = await HindiLetter.find().sort({ stage: 1, levelIntroduced: 1 });
    res.json(consonants);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/matra-game/words  — Hindi words with optional filters
// Query params: ?category=animals&level=1&limit=10
router.get('/words', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.levelIntroduced = { $lte: Number(req.query.level) + 4 };
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const words = await HindiWord.find(filter)
      .sort({ levelIntroduced: 1, category: 1 })
      .limit(limit);
    res.json(words);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/matra-game/categories  — distinct categories with word counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await HindiWord.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const categoryMap = {
      animals: { name: 'जानवर', emoji: '🐶', nameEn: 'Animals' },
      fruits: { name: 'फल', emoji: '🍎', nameEn: 'Fruits' },
      colors: { name: 'रंग', emoji: '🎨', nameEn: 'Colors' },
      body: { name: 'शरीर', emoji: '🧍', nameEn: 'Body Parts' },
      objects: { name: 'वस्तुएं', emoji: '🏠', nameEn: 'Objects' },
      nature: { name: 'प्रकृति', emoji: '🌿', nameEn: 'Nature' },
      food: { name: 'खाना', emoji: '🍽️', nameEn: 'Food' },
      family: { name: 'परिवार', emoji: '👨‍👩‍👧‍👦', nameEn: 'Family' },
      words: { name: 'शब्द', emoji: '📝', nameEn: 'Words' },
    };
    const result = categories.map(c => ({
      id: c._id,
      count: c.count,
      ...(categoryMap[c._id] || { name: c._id, emoji: '📚', nameEn: c._id }),
    }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/matra-game/save-score  — save game score
router.post('/save-score', async (req, res) => {
  try {
    const { userId, level, score, correctAnswers, totalQuestions, language, timeTaken } = req.body;

    if (!userId || level === undefined || score === undefined) {
      return res.status(400).json({ error: 'userId, level, and score are required' });
    }

    const newScore = await Score.create({
      userId,
      gameType: 'matra',
      language: language || 'hindi',
      level: level || 1,
      score: score || 0,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 0,
      timeTaken: timeTaken || 0,
    });

    res.status(201).json({ success: true, score: newScore });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/matra-game/user-progress/:userId  — get user's matra game progress
router.get('/user-progress/:userId', async (req, res) => {
  try {
    const scores = await Score.find({
      userId: req.params.userId,
      gameType: 'matra',
    }).sort({ completedAt: -1 });

    // Compute highest level completed (score > 0 means completed)
    const levelScores = {};
    scores.forEach(s => {
      if (!levelScores[s.level] || s.score > levelScores[s.level].score) {
        levelScores[s.level] = s;
      }
    });

    const highestLevel = Object.keys(levelScores).reduce(
      (max, l) => Math.max(max, Number(l)),
      0
    );

    const totalScore = Object.values(levelScores).reduce((sum, s) => sum + s.score, 0);

    res.json({
      highestLevel,
      totalScore,
      levelScores,
      totalAttempts: scores.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
