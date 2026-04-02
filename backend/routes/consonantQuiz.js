const express = require('express');
const router = express.Router();
const Consonant = require('../models/Consonant');
const Score = require('../models/Score');

const SCORE_INCREMENT = 10;
const DEFAULT_LEVEL = 1;

router.get('/question', async (req, res) => {
  const language = req.query.language || 'hindi';

  try {
    const consonants = await Consonant.aggregate([
      { $match: { language } },
      { $sample: { size: 4 } }
    ]);

    if (!consonants || consonants.length < 4) {
      return res.status(400).json({ error: 'Not enough consonants for this language' });
    }

    const correctTarget = consonants[Math.floor(Math.random() * consonants.length)];
    const options = consonants
      .map((c) => ({ _id: c._id, audioBase64: c.audioBase64 }))
      .sort(() => 0.5 - Math.random());

    res.json({
      questionId: String(correctTarget._id),
      correctLetter: correctTarget.letter,
      options
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/submit', async (req, res) => {
  const { userId, language, questionId, selectedOptionId } = req.body;

  if (!userId || !language || !questionId || !selectedOptionId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const isCorrect = String(questionId) === String(selectedOptionId);

    const previousScore = await Score.findOne({
      userId,
      gameType: 'consonant',
      language,
      level: DEFAULT_LEVEL
    }).sort({ completedAt: -1 });

    let currentScore = previousScore ? previousScore.score : 0;

    if (isCorrect) {
      currentScore += SCORE_INCREMENT;
      await Score.create({
        userId,
        gameType: 'consonant',
        language,
        level: DEFAULT_LEVEL,
        score: currentScore,
        correctAnswers: 1,
        totalQuestions: 1
      });
    }

    res.json({
      isCorrect,
      currentScore
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/score', async (req, res) => {
  const { userId, language } = req.query;
  if (!userId || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const latestScore = await Score.findOne({
      userId,
      gameType: 'consonant',
      language,
      level: DEFAULT_LEVEL
    }).sort({ completedAt: -1 });

    res.json({ score: latestScore ? latestScore.score : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
