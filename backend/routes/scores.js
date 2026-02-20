const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Progress = require('../models/Progress');

// Submit any game score (no scaling - use raw scores)
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      quizId, 
      gameType = 'quiz',
      language, 
      level, 
      score, 
      correctAnswers,
      totalQuestions,
      answers 
    } = req.body;

    // Use raw score without any scaling
    const finalScore = score;

    // Check if this game/level was played before
    const previousScore = await Score.findOne({
      userId,
      gameType,
      language,
      level: level || 1
    }).sort({ completedAt: -1 });

    const newScore = new Score({
      userId,
      quizId,
      gameType,
      language,
      level: level || 1,
      score: finalScore,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 5,
      answers
    });

    await newScore.save();

    // Update user progress
    const progress = await Progress.findOne({ userId, language });
    
    if (progress) {
      // If there was a previous score, subtract it first
      if (previousScore) {
        progress.totalScore -= previousScore.score;
      }
      
      // Then add the new score
      progress.totalScore += finalScore;
      
      // For quiz, update level progress
      if (gameType === 'quiz') {
        // Only increment quizzes completed if this is a new level
        if (!previousScore) {
          progress.quizzesCompleted += 1;
        }
        
        // Unlock next level if score >= 3
        if (score >= 3 && level >= progress.currentLevel) {
          progress.currentLevel = level + 1;
        }
      }
      
      progress.updatedAt = Date.now();
      await progress.save();

      res.status(201).json({
        success: true,
        score: newScore,
        progress,
        message: previousScore ? 'Score updated' : 'Score saved'
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

// Get total score summary for a user
router.get('/user/:userId/total', async (req, res) => {
  try {
    const { language } = req.query;
    const query = { userId: req.params.userId };
    
    if (language) {
      query.language = language;
    }

    const scores = await Score.find(query).sort({ completedAt: -1 });

    // Group scores by game type and level, keeping only the latest (most recent) score
    const latestScores = {};
    scores.forEach(score => {
      const gameType = score.gameType || 'quiz';
      const level = score.level || 1;
      const key = `${gameType}-${level}`;
      
      // Only keep the first occurrence (latest due to sorting)
      if (!latestScores[key]) {
        latestScores[key] = score;
      }
    });

    // Calculate totals by game type using only latest scores
    const gameTypeTotals = {
      quiz: 0,
      balloon: 0,
      mars: 0,
      total: 0
    };

    Object.values(latestScores).forEach(score => {
      const gameType = score.gameType || 'quiz';
      gameTypeTotals[gameType] = (gameTypeTotals[gameType] || 0) + score.score;
      gameTypeTotals.total += score.score;
    });

    // Count unique games played (unique game-level combinations)
    const uniqueGames = Object.values(latestScores);
    const gamesPlayed = {
      quiz: uniqueGames.filter(s => s.gameType === 'quiz').length,
      balloon: uniqueGames.filter(s => s.gameType === 'balloon').length,
      mars: uniqueGames.filter(s => s.gameType === 'mars').length,
      total: uniqueGames.length
    };

    res.json({
      success: true,
      totalScore: gameTypeTotals.total,
      gameTypeTotals,
      gamesPlayed,
      language
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
