const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, age, language } = req.body;

    const user = new User({
      name,
      age,
      language
    });

    await user.save();

    // Create initial progress record
    const progress = new Progress({
      userId: user._id,
      language: language,
      currentLevel: 1,
      totalScore: 0,
      quizzesCompleted: 0
    });

    await progress.save();

    res.status(201).json({
      success: true,
      user,
      progress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
