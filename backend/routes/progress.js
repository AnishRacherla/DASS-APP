const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Get user progress
router.get('/:userId', async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.params.userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update user progress
router.put('/:userId', async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.params.userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    const { currentLevel, totalScore, quizzesCompleted } = req.body;

    if (currentLevel !== undefined) progress.currentLevel = currentLevel;
    if (totalScore !== undefined) progress.totalScore = totalScore;
    if (quizzesCompleted !== undefined) progress.quizzesCompleted = quizzesCompleted;
    progress.updatedAt = Date.now();

    await progress.save();

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
