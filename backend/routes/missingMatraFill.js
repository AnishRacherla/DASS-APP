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
    name: 'Easy Fill',
    nameHindi: 'आसान भरो',
    description: 'Fill the blank with basic matras — ा ि ी ु ू',
    matras: ['aa', 'i', 'ii', 'u', 'uu'],
    wordsPerRound: 8,
    optionCount: 3,
    timeLimit: 0,
    pointsPerCorrect: 10,
    starsThreshold: [50, 60, 80],
  },
  {
    level: 2,
    name: 'Medium Fill',
    nameHindi: 'मध्यम भरो',
    description: 'More matras — े ै ो ौ added to the mix!',
    matras: ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'],
    wordsPerRound: 10,
    optionCount: 4,
    timeLimit: 0,
    pointsPerCorrect: 15,
    starsThreshold: [80, 110, 150],
  },
  {
    level: 3,
    name: 'Speed Fill',
    nameHindi: 'स्पीड भरो',
    description: 'Race the clock — fill blanks before time runs out!',
    matras: ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'],
    wordsPerRound: 12,
    optionCount: 5,
    timeLimit: 60,
    pointsPerCorrect: 20,
    starsThreshold: [120, 180, 240],
  },
];

// GET /api/missing-matra/levels
router.get('/levels', (req, res) => {
  res.json(LEVELS);
});

// GET /api/missing-matra/matras
router.get('/matras', async (req, res) => {
  try {
    const matras = await HindiMatra.find().sort({ stage: 1, levelIntroduced: 1 });
    res.json(matras);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/missing-matra/consonants
router.get('/consonants', async (req, res) => {
  try {
    const consonants = await HindiLetter.find().sort({ stage: 1, levelIntroduced: 1 });
    res.json(consonants);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/missing-matra/words?matras=aa,i,ii&limit=50
router.get('/words', async (req, res) => {
  try {
    const filter = {
      keyMatra: { $exists: true, $ne: null },
      keyCons: { $exists: true, $ne: null },
      combined: { $exists: true, $ne: null },
    };

    if (req.query.matras) {
      const matraList = req.query.matras.split(',').map((m) => m.trim());
      filter.keyMatra = { $in: matraList };
    }

    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const words = await HindiWord.find(filter)
      .sort({ levelIntroduced: 1, category: 1 })
      .limit(limit);

    res.json(words);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/missing-matra/save-score
router.post('/save-score', async (req, res) => {
  try {
    const { userId, level, score, correctAnswers, totalQuestions, language, timeTaken } = req.body;

    if (!userId || level === undefined || score === undefined) {
      return res.status(400).json({ error: 'userId, level, and score are required' });
    }

    const newScore = await Score.create({
      userId,
      gameType: 'missing-matra',
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

// GET /api/missing-matra/user-progress/:userId
router.get('/user-progress/:userId', async (req, res) => {
  try {
    const scores = await Score.find({
      userId: req.params.userId,
      gameType: 'missing-matra',
    }).sort({ completedAt: -1 });

    const levelScores = {};
    scores.forEach((s) => {
      if (!levelScores[s.level] || s.score > levelScores[s.level].score) {
        levelScores[s.level] = s;
      }
    });

    const highestLevel = Object.keys(levelScores).reduce(
      (max, l) => Math.max(max, Number(l)),
      0
    );

    const totalScore = Object.values(levelScores).reduce((sum, s) => sum + s.score, 0);

    res.json({ highestLevel, totalScore, levelScores, totalAttempts: scores.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
