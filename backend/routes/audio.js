const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Get audio file by language, level, and question ID
router.get('/:language/:level/:questionId', async (req, res) => {
  try {
    const { language, level, questionId } = req.params;

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

    const question = quiz.questions.find(q => q.questionId === parseInt(questionId));

    if (!question || !question.audioData) {
      return res.status(404).json({
        success: false,
        message: 'Audio not found'
      });
    }

    // Set headers for audio streaming
    res.set({
      'Content-Type': question.audioContentType || 'audio/mpeg',
      'Content-Length': question.audioData.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(question.audioData);
  } catch (error) {
    console.error('Error serving audio:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
