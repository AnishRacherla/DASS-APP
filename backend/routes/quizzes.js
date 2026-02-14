const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Get quiz by language and level
router.get('/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;

    const quiz = await Quiz.findOne({
      language: language,
      level: parseInt(level)
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all quizzes for a language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;

    const quizzes = await Quiz.find({ language }).sort({ level: 1 });

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Create new quiz (for seeding)
router.post('/', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();

    res.status(201).json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
