const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Score = require('../models/Score');

// Get all balloon games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ gameType: 'balloon', isActive: true })
      .select('-assets.audio.data') // Exclude audio data for list view
      .sort({ language: 1, level: 1 });
    
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get balloon games by language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const games = await Game.find({ 
      gameType: 'balloon', 
      language, 
      isActive: true 
    })
    .select('-assets.audio.data')
    .sort({ level: 1 });
    
    res.json({ success: true, games });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific balloon game by language and level
router.get('/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;
    const game = await Game.findOne({ 
      gameType: 'balloon', 
      language, 
      level: parseInt(level),
      isActive: true 
    }).select('-assets.audio.data');
    
    if (!game) {
      return res.status(404).json({ 
        success: false, 
        error: 'Balloon game not found' 
      });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit balloon game score
router.post('/score', async (req, res) => {
  try {
    const { userId, gameId, score, correctAnswers, totalRounds, timeTaken } = req.body;
    
    if (!userId || !gameId || score === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Get game details
    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found' 
      });
    }
    
    // Create score entry
    const scoreEntry = new Score({
      userId,
      gameType: 'balloon',
      gameId,
      language: game.language,
      level: game.level,
      score,
      correctAnswers,
      totalQuestions: totalRounds,
      timeTaken,
      completedAt: new Date()
    });
    
    await scoreEntry.save();
    
    res.json({ 
      success: true, 
      message: 'Score saved successfully!',
      scoreEntry 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's balloon game scores
router.get('/scores/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const scores = await Score.find({ 
      userId, 
      gameType: 'balloon' 
    }).sort({ completedAt: -1 });
    
    res.json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard for balloon games
router.get('/leaderboard/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;
    
    const leaderboard = await Score.aggregate([
      { 
        $match: { 
          gameType: 'balloon',
          language,
          level: parseInt(level)
        } 
      },
      { 
        $sort: { score: -1, timeTaken: 1 } 
      },
      { 
        $limit: 10 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userName: '$user.name',
          score: 1,
          correctAnswers: 1,
          totalQuestions: 1,
          timeTaken: 1,
          completedAt: 1
        }
      }
    ]);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
