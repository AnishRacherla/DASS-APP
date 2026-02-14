const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Progress = require('../models/Progress');

// Submit quiz score
router.post('/', async (req, res) => {
  try {
    const { userId, quizId, language, level, score, answers } = req.body;

    const newScore = new Score({
      userId,
      quizId,
      language,
      level,
      score,
      totalQuestions: 5,
      answers
    });

    await newScore.save();

    // Update user progress
    const progress = await Progress.findOne({ userId, language });
    
    if (progress) {
      progress.totalScore += score;
      progress.quizzesCompleted += 1;
      
      // Unlock next level if score >= 3
      if (score >= 3 && level >= progress.currentLevel) {
        progress.currentLevel = level + 1;
      }
      
      progress.updatedAt = Date.now();
      await progress.save();

      res.status(201).json({
        success: true,
        score: newScore,
        progress
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get scores by user
router.get('/user/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      scores
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
