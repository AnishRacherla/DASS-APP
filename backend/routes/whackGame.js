const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Score = require('../models/Score');
const Progress = require('../models/Progress');

// Get all whack games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ gameType: 'whack', isActive: true })
      .sort({ language: 1, level: 1 });
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get whack games by language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const games = await Game.find({ gameType: 'whack', language, isActive: true })
      .sort({ level: 1 });
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific whack game by language and level
router.get('/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;
    const game = await Game.findOne({
      gameType: 'whack',
      language,
      level: parseInt(level),
      isActive: true
    });

    if (!game) {
      return res.status(404).json({ success: false, error: 'Whack game not found' });
    }

    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit whack game score
router.post('/score', async (req, res) => {
  try {
    const { userId, gameId, language, level, score, penalties, timeTaken } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const scoreEntry = new Score({
      userId,
      gameType: 'whack',
      gameId,
      language,
      level: parseInt(level),
      score,
      correctAnswers: penalties === 0 && score >= 10 ? 1 : 0,
      totalQuestions: 1,
      timeTaken: timeTaken || 40,
      completedAt: new Date()
    });

    await scoreEntry.save();

    // Update progress if passed (no penalties AND score >= 10)
    const passed = penalties === 0 && score >= 10;
    if (passed && userId) {
      const progress = await Progress.findOne({ userId, language });
      if (progress) {
        progress.totalScore += score;
        progress.updatedAt = Date.now();
        await progress.save();
      }
    }

    res.json({ success: true, message: 'Score saved!', scoreEntry, passed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
