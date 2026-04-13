const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// GET 5 random sentences for game — /api/word-jumble/play?language=hindi&level=1
router.get('/play', async (req, res) => {
  try {
    const { language = 'hindi', level = '1' } = req.query;

    const game = await Game.findOne({
      gameType: 'scrambled-sentences',
      language: language,
      level: parseInt(level)
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found for this language and level' });
    }

    const allSentences = game.gameData || [];
    const selectedSentences = [];
    const indices = new Set();

    // Randomly select 5 unique sentences
    while (selectedSentences.length < Math.min(5, allSentences.length)) {
      const randomIndex = Math.floor(Math.random() * allSentences.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        selectedSentences.push(allSentences[randomIndex]);
      }
    }

    res.json({
      gameId: game._id,
      title: game.title,
      language: game.language,
      level: game.level,
      difficulty: game.difficulty,
      sentences: selectedSentences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available levels — /api/word-jumble/levels?language=hindi
router.get('/levels', async (req, res) => {
  try {
    const { language = 'hindi' } = req.query;

    const games = await Game.find({
      gameType: 'scrambled-sentences',
      language: language
    })
      .select('level title difficulty')
      .sort({ level: 1 });

    const levels = games.map(game => ({
      level: game.level,
      title: game.title,
      difficulty: game.difficulty
    }));

    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
