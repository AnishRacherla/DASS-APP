const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const Score = require('../models/Score'); // Added Score model

const getStars = (scoreItem) => {
  // Logic to calculate stars: max is ~3. Use percentage if correctAnswers/totalQuestions exist, else derive from score.
  if (scoreItem.totalQuestions > 0 && scoreItem.correctAnswers !== undefined) {
    const p = scoreItem.correctAnswers / scoreItem.totalQuestions;
    if (p >= 0.8) return 3;
    if (p >= 0.5) return 2;
    return 1;
  }
  // Fallback map max score to stars. Assuming max is usually around 100
  if (scoreItem.score >= 80) return 3;
  if (scoreItem.score >= 50) return 2;
  return 1;
};

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

// Find or create user by name and language (used during login)
router.post('/find-or-create', async (req, res) => {
  try {
    const { name, age, language } = req.body;

    // Try to find existing user by name
    let user = await User.findOne({ name });

    if (user) {
      // Update last active and language if needed
      user.lastActive = Date.now();
      if (language) user.language = language;
      await user.save();
      return res.json({ success: true, user, existing: true });
    }

    // Create new user
    user = new User({ name, age: age || 5, language: language || 'hindi' });
    await user.save();

    // Create initial progress record
    const progress = new Progress({
      userId: user._id,
      language: language || 'hindi',
      currentLevel: 1,
      totalScore: 0,
      quizzesCompleted: 0
    });
    await progress.save();

    res.status(201).json({ success: true, user, existing: false });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user profile scores categorized by stages
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const scores = await Score.find({ userId: req.params.id });

    // Define the classification of games to stages
    const stagesConfig = {
      earth: ['akshara', 'consonant', 'swara', 'memory', 'quiz'], // Recognition
      mars: ['mars', 'tracing', 'balloon', 'whack'],               // Mastery 
      jupiter: ['matra', 'spelling', 'wordSorting', 'missingMatra'],// Words & matras
      saturn: ['story', 'crossword', 'scrambledSentences', 'scavenger'] // Sentence & Reading
    };

    // calculate weighted start rating for each game
    const gameStats = {};
    
    scores.forEach(s => {
      const gType = s.gameType;
      if (!gameStats[gType]) gameStats[gType] = { starsTotal: 0, count: 0 };
      gameStats[gType].starsTotal += getStars(s);
      gameStats[gType].count += 1;
    });

    const stages = {
      earth: { points: 0, title: 'Recognition' },
      mars: { points: 0, title: 'Mastery' },
      jupiter: { points: 0, title: 'Words & Matras' },
      saturn: { points: 0, title: 'Sentence & Reading' }
    };

    Object.keys(stagesConfig).forEach(stage => {
      let stagePoints = 0;
      stagesConfig[stage].forEach(game => {
        if (gameStats[game] && gameStats[game].count > 0) {
          // Average stars per game
          stagePoints += Math.round(gameStats[game].starsTotal / gameStats[game].count);
        }
      });
      stages[stage].points = stagePoints;
    });

    res.json({
      success: true,
      user,
      stages
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
