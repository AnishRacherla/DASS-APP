const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// GET random 5 sentences for game — /api/scrambled-sentences/play?language=hindi&level=1
router.get('/play', async (req, res) => {
  try {
    const { language = 'hindi', level = '1' } = req.query;

    const game = await Game.findOne({
      gameType: 'scrambled-sentences',
      language: language,
      level: parseInt(level)
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get all sentences and randomly select 5
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
      description: game.description,
      language: game.language,
      level: game.level,
      difficulty: game.difficulty,
      config: game.config,
      sentences: selectedSentences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET scrambled sentence game — /api/scrambled-sentences/game?language=hindi&level=1
router.get('/game', async (req, res) => {
  try {
    const { language = 'hindi', level = '1' } = req.query;

    const game = await Game.findOne({
      gameType: 'scrambled-sentences',
      language: language,
      level: parseInt(level)
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      gameId: game._id,
      title: game.title,
      description: game.description,
      language: game.language,
      level: game.level,
      difficulty: game.difficulty,
      config: game.config,
      sentences: game.gameData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all available levels — /api/scrambled-sentences/levels?language=hindi
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

// GET languages available
router.get('/languages', async (req, res) => {
  try {
    const languages = await Game.distinct('language', { gameType: 'scrambled-sentences' });
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
